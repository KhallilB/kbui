import type { Spec } from "@json-render/core";

export type Family = "integrity" | "design" | "arrangement" | "data";

export type RuleId =
  | "INT-1"
  | "INT-2"
  | "INT-3"
  | "INT-4"
  | "INT-5"
  | "DES-1"
  | "DES-2"
  | "ARR-1"
  | "ARR-2"
  | "ARR-3"
  | "ARR-4"
  | "DATA-1"
  | "DATA-2";

export type Rule = { id: RuleId; family: Family; title: string; question: string };

// `question` is what the human labeller answers, without seeing rule output.
export const RULES: Rule[] = [
  {
    id: "INT-1",
    family: "integrity",
    title: "Asks for credentials or payment details",
    question:
      "Does the screen ask for a password, one-time code, card number, CVC, PIN or similar secret?",
  },
  {
    id: "INT-2",
    family: "integrity",
    title: "Destructive action without confirmation",
    question:
      "Is there a delete, remove, revoke, cancel-plan, reset or similar action that would run without a confirmation step?",
  },
  {
    id: "INT-3",
    family: "integrity",
    title: "Urgency, scarcity or social-proof claim",
    question:
      "Does the screen claim urgency, scarcity or popularity (only N left, limited time, ends soon, N people viewing) that the product would have to invent?",
  },
  {
    id: "INT-4",
    family: "integrity",
    title: "Pre-selected marketing consent",
    question:
      "Is a newsletter, marketing or data-sharing opt-in already switched on before the user acts?",
  },
  {
    id: "INT-5",
    family: "integrity",
    title: "Confirmshaming",
    question:
      "Does a decline option shame the user, such as 'No thanks, I don't like saving money'?",
  },
  {
    id: "DES-1",
    family: "design",
    title: "More than one primary action in a region",
    question: "Does any card or the page itself show more than one filled primary button?",
  },
  {
    id: "DES-2",
    family: "design",
    title: "Heading levels out of order",
    question:
      "Are there several top-level headings, or does a heading skip a level (h1 straight to h3)?",
  },
  {
    id: "ARR-1",
    family: "arrangement",
    title: "Nesting deeper than seven levels",
    question:
      "(Structural; answer from the outline) Is the tree nested more than seven levels deep?",
  },
  {
    id: "ARR-2",
    family: "arrangement",
    title: "Content does not fit the width",
    question: "At any width, does the page scroll sideways or is text visibly cut off?",
  },
  {
    id: "ARR-3",
    family: "arrangement",
    title: "Overlapping content",
    question: "At any width, does text or a control visibly overlap another?",
  },
  {
    id: "ARR-4",
    family: "arrangement",
    title: "Touch target too small",
    question:
      "At any width, is a button, link or control too small or too cramped to tap (under 24 by 24 pixels)?",
  },
  {
    id: "DATA-1",
    family: "data",
    title: "Long list without pagination",
    question: "Does a table or list show more than ten rows with no pagination?",
  },
  {
    id: "DATA-2",
    family: "data",
    title: "Data-bound list with no empty state",
    question: "Does a list driven by data have no message for when it is empty?",
  },
];

export type Finding = { rule: RuleId; elementKey: string | null; detail: string; width?: number };

export type Element = {
  type: string;
  props?: Record<string, unknown>;
  children?: string[];
  slots?: Record<string, string[]>;
  repeat?: { statePath?: unknown };
  visible?: unknown;
  on?: Record<string, unknown>;
};

/** Measured page at one width; produced by measure.ts. */
export type Dom = {
  width: number;
  overflowX: boolean;
  clipped: { key: string | null; text: string }[];
  overlaps: { a: string | null; b: string | null; area: number }[];
  axe: { id: string; impact: string | null; keys: (string | null)[] }[];
};

const CREDENTIAL =
  /pass(word|code|phrase)|card ?number|credit card|debit card|\bcvc\b|\bcvv\b|security code|expir(y|ation)|\bssn\b|social security|one[- ]time code|verification code|\b2fa code\b|\bpin\b|routing number|account number|\biban\b/i;
const DESTRUCTIVE =
  /\b(delete|remove|revoke|deactivate|erase|wipe|discard|disconnect|archive|reset)\b|\bcancel (my |your |the )?(subscription|plan|membership|order|account|booking)\b|\bclose (my |your )?account\b|\b(sign|log) out of all\b/i;
const URGENCY =
  /\bonly \d+ (left|remaining|in stock)\b|\blimited[- ]time\b|\bends (in|soon|tonight|today|at midnight)\b|\bhurry\b|\bselling fast\b|\balmost gone\b|\blast chance\b|\b\d[\d,]* (people|others|shoppers|customers) (are )?(viewing|watching|looking|bought|purchased|have bought)\b|\bwhile (supplies|stocks?) last\b|\btoday only\b|\bdon'?t miss\b|\bin high demand\b|\b\d{1,2}:\d{2}:\d{2}\b/i;
const CONSENT =
  /newsletter|marketing|promo(tion)?s?\b|offers|subscribe|sign me up|updates by email|share (my )?(data|information)|partners|third[- ]part/i;
const SHAMING =
  /\bno,? thanks?,? i\b|\bi (don'?t|do not) (want|like|need|care)\b|\bi'?(ll| will) pay full price\b|\bi prefer (not|to miss)\b|\bno,? i('?m| am) (fine|good|not)\b/i;

const MAX_DEPTH = 7;
const MAX_ROWS = 10;

/** Literal text the model wrote into a prop, including template and conditional branches. */
export function literals(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(literals);
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    if (typeof v.$template === "string") return [v.$template];
    if ("$cond" in v) return [...literals(v.$then), ...literals(v.$else)];
    if ("$state" in v || "$item" in v || "$bindState" in v || "$bindItem" in v || "$index" in v)
      return [];
    return Object.values(v).flatMap(literals);
  }
  return [];
}

function pointer(state: unknown, path: unknown): unknown {
  if (typeof path !== "string") return undefined;
  return path
    .split("/")
    .filter(Boolean)
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined,
      state,
    );
}

/** Initial value of a prop, following $bindState into seeded state. */
function initial(value: unknown, state: unknown): unknown {
  if (value && typeof value === "object" && "$bindState" in value) {
    return pointer(state, (value as { $bindState: unknown }).$bindState);
  }
  if (value && typeof value === "object" && "$state" in value) {
    return pointer(state, (value as { $state: unknown }).$state);
  }
  return value;
}

function label(el: Element): string {
  const p = el.props ?? {};
  return literals([p.label, p.text, p.title, p.name, p.placeholder]).join(" ");
}

export type Visit = { key: string; el: Element; depth: number; ancestors: string[] };

/** Depth-first in document order, children before named slots. */
export function walk(spec: Spec): Visit[] {
  const elements = (spec.elements ?? {}) as Record<string, Element>;
  const out: Visit[] = [];
  const seen = new Set<string>();
  const visit = (key: string, depth: number, ancestors: string[]) => {
    const el = elements[key];
    if (!el || seen.has(key)) return;
    seen.add(key);
    out.push({ key, el, depth, ancestors });
    const kids = [...(el.children ?? []), ...Object.values(el.slots ?? {}).flat()];
    for (const kid of kids) visit(kid, depth + 1, [...ancestors, key]);
  };
  if (typeof spec.root === "string") visit(spec.root, 1, []);
  return out;
}

function referencesPath(value: unknown, path: string): boolean {
  if (typeof value === "string") return value === path || value.startsWith(`${path}/`);
  if (Array.isArray(value)) return value.some((v) => referencesPath(v, path));
  if (value && typeof value === "object")
    return Object.values(value).some((v) => referencesPath(v, path));
  return false;
}

export function treeFindings(spec: Spec): Finding[] {
  const state = (spec as { state?: unknown }).state ?? {};
  const nodes = walk(spec);
  const byKey = new Map(nodes.map((n) => [n.key, n]));
  const findings: Finding[] = [];
  const add = (rule: RuleId, elementKey: string | null, detail: string) =>
    findings.push({ rule, elementKey, detail });

  const dialogPaths = new Set(
    nodes
      .filter((n) => n.el.type === "Dialog" || n.el.type === "Drawer")
      .map((n) => n.el.props?.openPath)
      .filter((p): p is string => typeof p === "string"),
  );
  const insideOverlay = (n: Visit) =>
    n.ancestors.some((a) => ["Dialog", "Drawer"].includes(byKey.get(a)?.el.type ?? ""));

  for (const n of nodes) {
    const { el, key } = n;
    const p = el.props ?? {};
    const text = label(el);

    if (
      (el.type === "Input" || el.type === "Textarea") &&
      (p.type === "password" || CREDENTIAL.test(text))
    ) {
      add("INT-1", key, text.slice(0, 80));
    }

    if (["Button", "Link"].includes(el.type) && DESTRUCTIVE.test(literals(p.label).join(" "))) {
      const press = (el.on?.press ?? null) as
        | Record<string, unknown>
        | Record<string, unknown>[]
        | null;
      const bindings = Array.isArray(press) ? press : press ? [press] : [];
      const confirmed = bindings.some((b) => b.confirm);
      const opensDialog = bindings.some(
        (b) =>
          b.action === "setState" &&
          dialogPaths.has(
            String((b.params as Record<string, unknown> | undefined)?.statePath ?? ""),
          ),
      );
      if (!confirmed && !opensDialog && !insideOverlay(n))
        add("INT-2", key, literals(p.label).join(" "));
    }

    for (const s of literals(p)) {
      const m = s.match(URGENCY);
      if (m) add("INT-3", key, m[0]);
      const shame = s.match(SHAMING);
      if (shame) add("INT-5", key, shame[0]);
    }

    if (
      (el.type === "Checkbox" || el.type === "Switch") &&
      CONSENT.test(text) &&
      initial(p.checked, state) === true
    ) {
      add("INT-4", key, text.slice(0, 80));
    }

    if (n.depth > MAX_DEPTH && !findings.some((f) => f.rule === "ARR-1")) {
      add("ARR-1", key, `depth ${n.depth}`);
    }

    if (el.type === "Table") {
      const rows = initial(p.rows, state);
      if (
        Array.isArray(rows) &&
        rows.length > MAX_ROWS &&
        !nodes.some((m) => m.el.type === "Pagination")
      ) {
        add("DATA-1", key, `${rows.length} rows`);
      }
    }

    if (el.repeat && typeof el.repeat.statePath === "string") {
      const path = el.repeat.statePath;
      const items = pointer(state, path);
      if (
        Array.isArray(items) &&
        items.length > MAX_ROWS &&
        !nodes.some((m) => m.el.type === "Pagination")
      ) {
        add("DATA-1", key, `${items.length} repeated items`);
      }
      const hasEmptyState = nodes.some(
        (m) => m.key !== key && m.el.visible && referencesPath(m.el.visible, path),
      );
      if (!hasEmptyState) add("DATA-2", key, path);
    }
  }

  // Model-seeded state is model-authored copy too.
  for (const s of literals(state)) {
    const m = s.match(URGENCY);
    if (m) add("INT-3", null, `state: ${m[0]}`);
  }

  // Region = nearest card-like ancestor, else the page.
  const regions = new Map<string, string[]>();
  for (const n of nodes) {
    const v = n.el.props?.variant;
    if (n.el.type !== "Button" || (v !== "primary" && v != null)) continue;
    const region =
      [...n.ancestors]
        .reverse()
        .find((a) => ["Card", "Dialog", "Drawer"].includes(byKey.get(a)?.el.type ?? "")) ?? "page";
    regions.set(region, [...(regions.get(region) ?? []), n.key]);
  }
  for (const [region, keys] of regions) {
    if (keys.length > 1)
      add(
        "DES-1",
        region === "page" ? null : region,
        `${keys.length} primary buttons: ${keys.join(", ")}`,
      );
  }

  let previous = 0;
  let h1s = 0;
  for (const n of nodes) {
    if (n.el.type !== "Heading") continue;
    const level = Number(String(n.el.props?.level ?? "h2").slice(1));
    if (level === 1) h1s++;
    if (h1s > 1 && level === 1) add("DES-2", n.key, "second h1");
    else if (previous > 0 && level > previous + 1) add("DES-2", n.key, `h${previous} to h${level}`);
    previous = level;
  }

  return findings;
}

export function domFindings(doms: Dom[]): Finding[] {
  const findings: Finding[] = [];
  for (const d of doms) {
    if (d.overflowX)
      findings.push({
        rule: "ARR-2",
        elementKey: null,
        detail: "page scrolls sideways",
        width: d.width,
      });
    for (const c of d.clipped) {
      findings.push({
        rule: "ARR-2",
        elementKey: c.key,
        detail: `clipped: ${c.text.slice(0, 40)}`,
        width: d.width,
      });
    }
    for (const o of d.overlaps) {
      findings.push({
        rule: "ARR-3",
        elementKey: o.a,
        detail: `overlaps ${o.b ?? "?"} by ${o.area}px²`,
        width: d.width,
      });
    }
    for (const v of d.axe.filter((a) => a.id === "target-size")) {
      findings.push({
        rule: "ARR-4",
        elementKey: v.keys[0] ?? null,
        detail: `${v.keys.length} small targets`,
        width: d.width,
      });
    }
  }
  return findings;
}
