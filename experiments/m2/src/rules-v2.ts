// v2 rewrites of rules that scored under 0.7 precision; v1 stays as the M2 record.
import type { Spec } from "@json-render/core";
import {
  type Element,
  type Finding,
  literals,
  pointer,
  type RuleId,
  referencesPath,
  treeFindings,
  URGENCY,
  type Visit,
  walk,
} from "./rules";

export const REWRITTEN: RuleId[] = ["INT-2", "INT-3", "DES-1", "DATA-2"];

// Loss the user cannot undo; removing a cart line or disconnecting an app can be redone.
const IRREVERSIBLE =
  /\b(delete|erase|wipe|destroy)\b|\b(close|deactivate) (my |your |the )?account\b|\bcancel (my |your |the )?(subscription|plan|membership|order|booking)\b/i;
const DEADLINE =
  /\bends (on |at )?(sunday|monday|tuesday|wednesday|thursday|friday|saturday|tomorrow|tonight|midnight|\d)|\b(stock is limited|limited stock|limited quantities)\b|\bonce (it'?s|they'?re) gone\b/i;
const OVERLAYS = ["Dialog", "Drawer"];

export function treeFindingsV2(spec: Spec): Finding[] {
  const state = (spec as { state?: unknown }).state ?? {};
  const nodes = walk(spec);
  const byKey = new Map(nodes.map((n) => [n.key, n]));
  const findings = treeFindings(spec).filter((f) => !REWRITTEN.includes(f.rule));
  const add = (rule: RuleId, elementKey: string | null, detail: string) =>
    findings.push({ rule, elementKey, detail });
  const bindings = (el: Element, event: string) => {
    const b = el.on?.[event] as Record<string, unknown> | Record<string, unknown>[] | undefined;
    return Array.isArray(b) ? b : b ? [b] : [];
  };
  const overlay = (n: Visit) =>
    n.ancestors.find((a) => OVERLAYS.includes(byKey.get(a)?.el.type ?? ""));
  const dialogPaths = new Set(
    nodes.filter((n) => OVERLAYS.includes(n.el.type)).map((n) => n.el.props?.openPath),
  );
  // Screenshots show an overlay only when its open state starts true.
  const hidden = (n: Visit) => {
    const o = overlay(n);
    return o !== undefined && pointer(state, byKey.get(o)?.el.props?.openPath) !== true;
  };

  for (const n of nodes) {
    const p = n.el.props ?? {};
    if (["Button", "Link"].includes(n.el.type) && IRREVERSIBLE.test(literals(p.label).join(" "))) {
      const press = bindings(n.el, "press");
      const confirmed = press.some((b) => b.confirm);
      const opensDialog = press.some(
        (b) =>
          b.action === "setState" &&
          dialogPaths.has((b.params as Record<string, unknown> | undefined)?.statePath),
      );
      if (!confirmed && !opensDialog && !overlay(n))
        add("INT-2", n.key, literals(p.label).join(" "));
    }
    for (const s of literals(p)) {
      const m = s.match(URGENCY) ?? s.match(DEADLINE);
      if (m) add("INT-3", n.key, m[0]);
    }
  }
  for (const s of literals(state)) {
    const m = s.match(URGENCY) ?? s.match(DEADLINE);
    if (m) add("INT-3", null, `state: ${m[0]}`);
  }

  // Filled = primary, danger or the default variant, as the labelling hint describes.
  const regions = new Map<string, string[]>();
  for (const n of nodes) {
    const v = n.el.props?.variant;
    if (n.el.type !== "Button" || v === "secondary" || hidden(n)) continue;
    const region =
      [...n.ancestors].reverse().find((a) => byKey.get(a)?.el.type === "Card") ?? "page";
    regions.set(region, [...(regions.get(region) ?? []), n.key]);
  }
  for (const [region, keys] of regions)
    if (keys.length > 1)
      add(
        "DES-1",
        region === "page" ? null : region,
        `${keys.length} filled buttons: ${keys.join(", ")}`,
      );

  // Only a list the UI can add to or remove from can become empty.
  const mutated = new Set(
    nodes.flatMap((n) =>
      Object.keys(n.el.on ?? {}).flatMap((event) =>
        bindings(n.el, event)
          .filter((b) => b.action === "pushState" || b.action === "removeState")
          .map((b) => String((b.params as Record<string, unknown> | undefined)?.statePath ?? "")),
      ),
    ),
  );
  for (const n of nodes) {
    const path = n.el.repeat?.statePath;
    if (typeof path !== "string" || !mutated.has(path)) continue;
    const hasEmptyState = nodes.some(
      (m) => m.key !== n.key && m.el.visible && referencesPath(m.el.visible, path),
    );
    if (!hasEmptyState) add("DATA-2", n.key, path);
  }
  return findings;
}
