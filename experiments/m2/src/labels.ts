import type { Finding, RuleId } from "./rules";

export type Answer = "yes" | "no" | "unsure";
export type Answers = Record<string, Partial<Record<RuleId, Answer>>>;
export type Labels = { study: string; labeller: string; labels: Answers };

// The spec answers these questions outright, so a blind answer that contradicts the rule is rechecked.
export const LITERAL: RuleId[] = ["INT-1", "INT-3", "INT-4", "DES-2", "ARR-1"];

export type Recheck = { token: string; rule: RuleId; blind: "yes" | "no"; evidence: string[] };

export function rechecks(
  screens: { token: string; findings: Finding[] }[],
  labels: Answers,
): Recheck[] {
  return screens.flatMap(({ token, findings }) =>
    LITERAL.flatMap((rule) => {
      const blind = labels[token]?.[rule];
      const evidence = [...new Set(findings.filter((f) => f.rule === rule).map((f) => f.detail))];
      if (blind !== "yes" && blind !== "no") return [];
      if (evidence.length > 0 === (blind === "yes")) return [];
      return [{ token, rule, blind, evidence }];
    }),
  );
}

export function adjudicate(blind: Answers, rechecked: Answers): Answers {
  const out: Answers = {};
  for (const t of new Set([...Object.keys(blind), ...Object.keys(rechecked)]))
    out[t] = { ...blind[t], ...rechecked[t] };
  return out;
}
