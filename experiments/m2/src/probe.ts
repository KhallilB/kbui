// In-page geometry probe evaluated inside Playwright.
export const probe = () => {
  const keyOf = (el: Element | null) =>
    el?.closest("[data-jr-key]")?.getAttribute("data-jr-key") ?? null;
  const cardOf = (el: Element | null) =>
    el?.closest("[data-jr-type='Card']")?.firstElementChild ?? null;
  const visible = (r: DOMRect) => r.width > 0 && r.height > 0;
  const opaque = (el: Element | null) => {
    if (!el) return false;
    const bg = getComputedStyle(el).backgroundColor;
    return Boolean(bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" && !bg.endsWith("/ 0)"));
  };
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const leaves = [...document.querySelectorAll("#root *")].filter((el) => {
    if (el.closest("[aria-hidden='true']")) return false;
    const interactive = el.matches(
      "button, a, input, select, textarea, [role='switch'], [role='checkbox'], [role='radio'], [role='slider'], [role='tab']",
    );
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim());
    return (interactive || ownText) && visible(el.getBoundingClientRect());
  });

  // Range bounds capture unwrapped glyph width when CSS constrains the element box.
  const leafRect = (el: Element) => {
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim());
    if (ownText) {
      const range = document.createRange();
      range.selectNodeContents(el);
      const rr = range.getBoundingClientRect();
      if (visible(rr)) return rr;
    }
    return el.getBoundingClientRect();
  };

  const clipped: { key: string | null; text: string }[] = [];
  const addClip = (el: Element, text: string) => {
    const key = keyOf(el);
    if (!clipped.some((c) => c.key === key && c.text === text)) clipped.push({ key, text });
  };

  for (const el of leaves) {
    const s = getComputedStyle(el);
    const text = el.textContent?.trim() ?? "";
    const hides = s.overflowX !== "visible" || s.textOverflow === "ellipsis";
    if (hides && el.scrollWidth > el.clientWidth + 1 && text) addClip(el, text);

    if (
      el instanceof HTMLInputElement &&
      !["checkbox", "radio", "range", "hidden", "button", "submit"].includes(el.type)
    ) {
      const val = (el.value || el.placeholder || "").trim();
      if (val && ctx) {
        ctx.font = s.font;
        const avail = el.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
        if (ctx.measureText(val).width > avail + 2) addClip(el, val);
      }
    }

    const card = cardOf(el);
    if (card) {
      const cr = card.getBoundingClientRect();
      const lr = leafRect(el);
      const er = el.getBoundingClientRect();
      if (Math.max(lr.right, er.right) > cr.right + 2 || Math.min(lr.left, er.left) < cr.left - 2) {
        addClip(el, text || el.getAttribute("aria-label") || el.tagName.toLowerCase());
      }
    }
  }

  const overlaps: { a: string | null; b: string | null; area: number }[] = [];
  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) {
      const a = leaves[i] as Element;
      const b = leaves[j] as Element;
      if (a.contains(b) || b.contains(a)) continue;
      const ra = leafRect(a);
      const rb = leafRect(b);
      const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      const area = Math.round(Math.max(0, w) * Math.max(0, h));
      const smaller = Math.min(ra.width * ra.height, rb.width * rb.height);
      if (area > 24 && area > smaller * 0.1) {
        const ca = cardOf(a);
        const cb = cardOf(b);
        // Opaque neighbor pills occlude spilled content instead of colliding glyphs.
        if (ca !== cb && (opaque(a) || opaque(b))) {
          addClip(a, a.textContent?.trim() ?? "");
          continue;
        }
        overlaps.push({ a: keyOf(a), b: keyOf(b), area });
      }
    }
  }

  const boxes: Record<string, number[]> = {};
  for (const tag of document.querySelectorAll("[data-jr-key]")) {
    const key = tag.getAttribute("data-jr-key") as string;
    if (boxes[key]) continue;
    const type = tag.getAttribute("data-jr-type");
    const sub =
      type === "Radio" || type === "Slider"
        ? [...tag.querySelectorAll("[role='radio'], [role='slider']")]
            .map((c) => c.getBoundingClientRect())
            .filter(visible)
        : [];
    if (sub.length) {
      const smallest = sub.reduce((a, b) =>
        Math.min(b.width, b.height) < Math.min(a.width, a.height) ? b : a,
      );
      boxes[key] = [
        smallest.left + scrollX,
        smallest.top + scrollY,
        smallest.width,
        smallest.height,
      ].map(Math.round);
      continue;
    }
    const rects = [...tag.children].map((c) => c.getBoundingClientRect()).filter(visible);
    if (!rects.length) continue;
    const x = Math.min(...rects.map((r) => r.left)) + scrollX;
    const y = Math.min(...rects.map((r) => r.top)) + scrollY;
    boxes[key] = [
      x,
      y,
      Math.max(...rects.map((r) => r.right)) + scrollX - x,
      Math.max(...rects.map((r) => r.bottom)) + scrollY - y,
    ].map(Math.round);
  }

  return {
    overflowX: document.documentElement.scrollWidth > innerWidth + 1,
    clipped,
    overlaps,
    boxes,
    height: document.documentElement.scrollHeight,
  };
};
