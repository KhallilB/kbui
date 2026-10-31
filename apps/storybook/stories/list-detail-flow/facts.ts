// Plain data: fixtures and generated guides share it without `storybook/test`.
import type { RuleId } from "./rules";

export type FlowFacts = {
  /** Commits settle asynchronously; enables `requires: "async"` rules. */
  async: boolean;
  /** Rules the recipe does not meet yet, with the reason. */
  gaps: Partial<Record<RuleId, string>>;
};

export const flowFacts = {
  ListDetail: {
    async: false,
    gaps: {
      "live-records": "Copies requests into state at mount and ignores later prop changes",
      "routing-boundary": "Reads and pushes the URL directly; takes no router",
    },
  },
  Inbox: {
    async: true,
    gaps: {
      "validation-separate": "Shows a failed send as the reply field's error description",
      "live-records": "Keeps sent replies beside the thread, so a server echo shows them twice",
      "routing-boundary": "Reads and pushes the URL directly; takes no router",
    },
  },
} satisfies Record<string, FlowFacts>;

/** Facts for a flow recipe by name; throws if it has none. */
export function flowFactsFor(recipe: string): FlowFacts {
  const facts = (flowFacts as Record<string, FlowFacts | undefined>)[recipe];
  if (!facts) throw new Error(`${recipe} has no flow facts`);
  return facts;
}
