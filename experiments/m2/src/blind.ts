import type { Spec } from "@json-render/core";
import { literals, type QuestionVersion, type RuleId, walk } from "./rules";

export const short = (v: unknown) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > 90 ? `${s.slice(0, 87)}...` : s;
};

function pointer(state: unknown, path: unknown): unknown {
  if (typeof path !== "string") return undefined;
  return path
    .split("/")
    .filter(Boolean)
    .reduce<unknown>(
      (n, k) => (n && typeof n === "object" ? (n as Record<string, unknown>)[k] : undefined),
      state,
    );
}

export type OutlineRow = { type: string; depth: number; text: string; facts: string[] };

/** Raw spec facts a reviewer would find by reading the JSON or clicking around. */
export function outlineRows(spec: Spec): OutlineRow[] {
  const state = (spec as { state?: unknown }).state ?? {};
  return walk(spec).map(({ el, depth }) => {
    const p = (el.props ?? {}) as Record<string, unknown>;
    const text = literals([p.title, p.label, p.text, p.description, p.placeholder]).join(" · ");
    const facts: string[] = [];
    if (p.level) facts.push(short(p.level));
    if ("variant" in p) facts.push(`variant ${short(p.variant ?? "default")}`);
    if (p.type) facts.push(`type ${short(p.type)}`);
    if ("checked" in p) {
      const c = p.checked as Record<string, unknown> | boolean;
      const start = c && typeof c === "object" ? pointer(state, c.$bindState ?? c.$state) : c;
      facts.push(`starts ${start === true ? "on" : "off"}`);
    }
    if (Array.isArray(p.rows)) facts.push(`${p.rows.length} rows`);
    if (el.repeat) {
      const items = pointer(state, el.repeat.statePath);
      facts.push(
        `repeats ${short(el.repeat.statePath)}${Array.isArray(items) ? ` (${items.length} items)` : ""}`,
      );
    }
    if (el.visible !== undefined) facts.push(`visible when ${short(el.visible)}`);
    for (const [event, binding] of Object.entries(el.on ?? {})) {
      for (const b of (Array.isArray(binding) ? binding : [binding]) as Record<string, unknown>[]) {
        const params = b.params ? ` ${short(b.params)}` : "";
        const confirm = b.confirm ? ` with confirm ${short(b.confirm)}` : "";
        facts.push(`on ${event}: ${b.action}${params}${confirm}`);
      }
    }
    if (p.openPath) facts.push(`open when ${short(p.openPath)}`);
    return { type: el.type, depth, text, facts };
  });
}

/** The outline as indented plain text; the number after each type is its depth. */
export function outlineText(rows: OutlineRow[]): string {
  return rows
    .map(({ type, depth, text, facts }) =>
      [`${"  ".repeat(depth - 1)}${type} ${depth}`, text && `“${short(text)}”`, facts.join("; ")]
        .filter(Boolean)
        .join(" "),
    )
    .join("\n");
}

// Where to look for each answer; the questions themselves live with the rules.
export const HINTS: Record<RuleId, string> = {
  "INT-1": "Screenshot: form fields.",
  "INT-2":
    "Outline: a destructive button's on press, and whether it opens a dialog or has a confirm.",
  "INT-3": "Screenshot and outline text, including badges and fine print.",
  "INT-4": "Outline: switches and checkboxes say whether they start on.",
  "INT-5": "Screenshot: decline links and secondary buttons.",
  "DES-1": "Screenshot: filled dark buttons within one card or the page.",
  "DES-2": "Outline: heading levels (h1, h2, h3) in order.",
  "ARR-1": "Outline: the grey number after each type is its depth.",
  "ARR-2": "Check every width, 390px especially.",
  "ARR-3": "Check every width, 390px especially.",
  "ARR-4": "Check every width: icon buttons, links in dense rows.",
  "DATA-1": "Outline: rows and repeat counts, and any Pagination.",
  "DATA-2": "Outline: a repeat, and an element visible when that list is empty.",
};

// v2 hints direct integrity/data to the spec outline and design/arrangement to visible renders.
export const HINTS_V2: Record<RuleId, string> = {
  "INT-1": "Outline: Input and Textarea labels, types and placeholders, including closed dialogs.",
  "INT-2":
    "Outline: every destructive Button or Link's on press, confirm, or Dialog/Drawer target.",
  "INT-3": "Outline and seeded state text: props, badges, fine print and state values.",
  "INT-4":
    "Outline: Checkbox and Switch rows state 'starts on' or 'starts off' from initial state.",
  "INT-5": "Outline: secondary buttons, decline links and dialog actions.",
  "DES-1":
    "Screenshots at 390, 768 and 1440 px: visible filled primary buttons per card or page; ignore closed dialogs.",
  "DES-2":
    "Outline and screenshots: Heading levels (h1, h2, h3) in order for elements visible on screen.",
  "ARR-1":
    "Outline and screenshots: grey depth number after each visible element's type; ignore closed dialogs.",
  "ARR-2":
    "Screenshots at 390, 768 and 1440 px (390 px especially): sideways scroll, clipped text or placeholders, and card overflow.",
  "ARR-3":
    "Screenshots at 390, 768 and 1440 px (390 px especially): visible text or controls colliding on screen.",
  "ARR-4":
    "Screenshots at 390, 768 and 1440 px: visible buttons, links, checkboxes and switches under 24 by 24 px.",
  "DATA-1":
    "Outline: Table row counts and repeat item counts in state, and whether any Pagination exists in the spec.",
  "DATA-2":
    "Outline: every repeat path, and whether another element has 'visible when' referencing that path.",
};

export function hintsFor(version: QuestionVersion = "v1"): Record<RuleId, string> {
  return version === "v2" ? HINTS_V2 : HINTS;
}
