import type { RuleMeta } from "../list-detail-flow/rules";

export const ruleMeta = {
  prepare: {
    summary: "Preparation shows the selected values and focuses the result heading",
    group: "focus",
  },
  validation: {
    summary: "Invalid preparation retains the draft and links errors to their inputs",
    group: "focus",
  },
  assignment: {
    summary: "Directory search recovers from no match and reviewer removal keeps other fields",
    group: "editing",
  },
  edit: {
    summary: "Editing the prepared request restores every core field and title focus",
    group: "editing",
  },
  reset: {
    summary: "Starting another request clears the core draft and focuses its title",
    group: "editing",
  },
  "empty-directory": {
    summary: "An empty directory explains the missing owner and retains the draft",
    group: "editing",
  },
  "application-validation": {
    summary: "Application validation retains the draft and supports linked field recovery",
    group: "focus",
  },
} satisfies Record<string, RuleMeta>;

export type RuleId = keyof typeof ruleMeta;
