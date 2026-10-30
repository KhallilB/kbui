import {
  type PlacementContract,
  type PlacementRule,
  type SizeClass,
  sizeClassOf,
} from "./placement";

// Sub-pixel layout rounding; anything larger is a real misplacement.
const tolerance = 1;
const targetSelector =
  "a[href], button, input:not([type='hidden']), select, textarea, [tabindex]:not([tabindex='-1'])";

type Box = { left: number; right: number; top: number; bottom: number; width: number };

function shown(el: Element) {
  const rect = el.getBoundingClientRect();
  return (rect.width > 0 || rect.height > 0) && getComputedStyle(el).visibility !== "hidden";
}

function contentBox(el: Element): Box {
  const rect = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  const inset = (side: string) =>
    Number.parseFloat(style.getPropertyValue(`padding-${side}`)) +
    Number.parseFloat(style.getPropertyValue(`border-${side}-width`));
  const left = rect.left + inset("left");
  const right = rect.right - inset("right");
  return {
    left,
    right,
    top: rect.top + inset("top"),
    bottom: rect.bottom - inset("bottom"),
    width: right - left,
  };
}

// Union of laid-out contents, so a full-width part with end-justified children reads as end.
function extent(el: Element): Box {
  const range = document.createRange();
  range.selectNodeContents(el);
  const { left, right, top, bottom, width } = range.getBoundingClientRect();
  return width > 0 ? { left, right, top, bottom, width } : el.getBoundingClientRect();
}

function children(el: Element) {
  return [...el.children].filter(shown);
}

// b sits after a: below it, or on the same row and further along.
function follows(a: DOMRect, b: DOMRect) {
  const sameRow = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > tolerance;
  return sameRow ? b.left >= a.right - tolerance : b.top >= a.bottom - tolerance;
}

// First shown sibling of target that does not sit before it.
function ahead(parent: Element, target: Element) {
  const rect = target.getBoundingClientRect();
  return children(parent).find(
    (kid) => kid !== target && !follows(kid.getBoundingClientRect(), rect),
  );
}

function parts(root: HTMLElement, part: string): HTMLElement[] {
  return part === ":scope" ? [root] : [...root.querySelectorAll<HTMLElement>(part)].filter(shown);
}

function reference(root: HTMLElement, el: HTMLElement, rule: PlacementRule) {
  if (rule.of) return el.parentElement?.closest<HTMLElement>(rule.of) ?? null;
  return el === root ? root.parentElement : root;
}

function checkRule(root: HTMLElement, rule: PlacementRule, el: HTMLElement, ref: HTMLElement) {
  const box = el.getBoundingClientRect();
  const area = contentBox(ref);
  const near = (a: number, b: number) => Math.abs(a - b) <= tolerance;
  const px = (n: number) => `${Math.round(n)}px`;
  switch (rule.place) {
    case "fill":
      return near(box.left, area.left) && near(box.right, area.right)
        ? null
        : `spans ${px(box.left)}–${px(box.right)}, region ${px(area.left)}–${px(area.right)}`;
    case "measure": {
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      const want = Math.min(area.width, rule.max * rem);
      return near(box.width, want) ? null : `is ${px(box.width)} wide, want ${px(want)}`;
    }
    case "start": {
      const left = extent(el).left;
      return near(left, area.left) ? null : `starts at ${px(left)}, region at ${px(area.left)}`;
    }
    case "end": {
      const right = extent(el).right;
      return near(right, area.right) ? null : `ends at ${px(right)}, region at ${px(area.right)}`;
    }
    case "last": {
      const after = ahead(el.parentElement ?? root, el);
      return after ? `${after.className || after.tagName} sits after it` : null;
    }
    case "line": {
      const kids = children(el).map((kid) => kid.getBoundingClientRect());
      if (kids.length === 0) return "has no children";
      const top = Math.max(...kids.map((kid) => kid.top));
      const bottom = Math.min(...kids.map((kid) => kid.bottom));
      return bottom - top > tolerance ? null : "children wrap onto more than one line";
    }
    case "stack": {
      const kids = children(el).map((kid) => kid.getBoundingClientRect());
      const index = kids.findIndex(
        (kid, i) => i > 0 && kid.top < (kids[i - 1]?.bottom ?? 0) - tolerance,
      );
      return index === -1 ? null : `child ${index + 1} is not below child ${index}`;
    }
    case "primary-last": {
      const primary = el.querySelector(rule.primary);
      const own = [...el.children].find((kid) => kid === primary || kid.contains(primary));
      if (!own) return `has no ${rule.primary}`;
      const after = ahead(el, own);
      return after ? `${after.textContent?.trim() || after.tagName} sits after the primary` : null;
    }
  }
}

// Inside a sideways scroller, a target past the edge is reachable by scrolling.
function scrolled(el: Element, root: Element) {
  for (let node = el.parentElement; node && node !== root; node = node.parentElement)
    if (/auto|scroll/.test(getComputedStyle(node).overflowX)) return true;
  return false;
}

// Overflow, overlap and target size hold for every container at every size.
function checkUsable(root: HTMLElement): string[] {
  const errors: string[] = [];
  if (root.scrollWidth > root.clientWidth + tolerance)
    errors.push(`overflows sideways by ${root.scrollWidth - root.clientWidth}px`);
  const box = root.getBoundingClientRect();
  const targets = [...root.querySelectorAll<HTMLElement>(targetSelector)]
    .filter((el) => shown(el) && !el.closest("[aria-hidden='true'], [hidden], [inert]"))
    .map((el) => ({ el, rect: el.getBoundingClientRect() }));
  const name = (el: Element) => el.getAttribute("aria-label") ?? el.textContent?.trim() ?? "";
  for (const { el, rect } of targets) {
    // WCAG 2.5.8 exempts targets inside a sentence.
    const inline = getComputedStyle(el).display === "inline";
    if (!inline && (rect.width < 24 - 0.5 || rect.height < 24 - 0.5))
      errors.push(`target "${name(el)}" is ${Math.round(rect.width)}×${Math.round(rect.height)}`);
    const outside = rect.left < box.left - tolerance || rect.right > box.right + tolerance;
    if (outside && !scrolled(el, root)) errors.push(`target "${name(el)}" leaves the container`);
  }
  for (const [i, a] of targets.entries())
    for (const b of targets.slice(i + 1)) {
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const x = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
      const y = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
      if (x > 0.5 && y > 0.5) errors.push(`"${name(a.el)}" overlaps "${name(b.el)}"`);
    }
  return errors;
}

/** Size class of `root`, from its parent's content width. */
export function sizeClassOfRoot(root: HTMLElement): SizeClass {
  const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return sizeClassOf(contentBox(root.parentElement ?? root).width / rem);
}

/** Every broken promise in `root`, as readable lines; empty when the contract holds. */
export function checkPlacement(
  root: HTMLElement,
  contract: PlacementContract,
  size: SizeClass = sizeClassOfRoot(root),
): string[] {
  const errors = checkUsable(root).map((error) => `${contract.root} ${error}`);
  for (const rule of contract.rules) {
    if (rule.at && !rule.at.includes(size)) continue;
    const label = `${contract.root} ${rule.part} ${rule.place}`;
    const matches = parts(root, rule.part);
    if (matches.length === 0) errors.push(`${label}: no visible ${rule.part}`);
    for (const el of matches) {
      const ref = reference(root, el, rule);
      const error = ref ? checkRule(root, rule, el, ref) : `no ${rule.of} around it`;
      if (error) errors.push(`${label}: ${error}`);
    }
  }
  return errors;
}
