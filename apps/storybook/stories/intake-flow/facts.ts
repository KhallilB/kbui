import type { RuleId } from "./rules";

export const flowFacts = {
  RequestIntake: { async: false, gaps: {} },
} satisfies Record<string, { async: boolean; gaps: Partial<Record<RuleId, string>> }>;

export function flowFactsFor(recipe: string) {
  const facts = (flowFacts as Record<string, (typeof flowFacts)["RequestIntake"] | undefined>)[
    recipe
  ];
  if (!facts) throw new Error(`${recipe} has no intake flow facts`);
  return facts;
}

export const policyRows = [
  ["Preparation", "Local summary; no server record"],
  ["Draft", "In-memory until reset or reload"],
  ["Required fields", "Non-whitespace title and a current directory owner"],
  ["Reviewers", "Optional, from the current directory"],
] as const;
