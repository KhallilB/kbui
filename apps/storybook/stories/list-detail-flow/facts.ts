// Plain data: fixtures and generated guides share it without `storybook/test`.
import type { RuleId } from "./rules";

export type FlowFacts = {
  /** Commits settle asynchronously; enables `requires: "async"` rules. */
  async: boolean;
  /** Rules the recipe does not meet yet, with the reason. */
  gaps: Partial<Record<RuleId, string>>;
};

export const flowFacts = {
  ListDetail: { async: true, gaps: {} },
  Inbox: { async: true, gaps: {} },
} satisfies Record<string, FlowFacts>;

/** Facts for a flow recipe by name; throws if it has none. */
export function flowFactsFor(recipe: string): FlowFacts {
  const facts = (flowFacts as Record<string, FlowFacts | undefined>)[recipe];
  if (!facts) throw new Error(`${recipe} has no flow facts`);
  return facts;
}
