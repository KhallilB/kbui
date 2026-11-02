// What a blind labeller sees besides screenshots, shared by the human page and model labellers.
import type { Spec } from "@json-render/core";
import { literals, type RuleId, walk } from "./rules";

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
