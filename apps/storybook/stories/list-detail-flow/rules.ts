// Plain data: the site and generated guides read it without `storybook/test`.
export type RuleGroup = "focus" | "navigation" | "editing" | "lists" | "async" | "data";

export type RuleMeta = {
  /** What a recipe guarantees; shown when a gap closes and in guides. */
  summary: string;
  group: RuleGroup;
  /** Fixture capability the rule needs; recipes without it skip the rule. */
  requires?: "async" | undefined;
};

export const ruleMeta = {
  "open-focus": { summary: "Opening a record focuses its heading", group: "focus" },
  "unavailable-focus": {
    summary: "An unknown record id focuses the unavailable heading",
    group: "focus",
  },
  reselect: {
    summary: "Reselecting the open record focuses its heading without a history entry",
    group: "focus",
  },
  "return-row": { summary: "Back returns focus to the row that opened the record", group: "focus" },
  "filtered-return": {
    summary: "Back focuses search when the opening row is filtered out",
    group: "focus",
  },
  history: {
    summary: "Browser Back and Forward restore the row and heading of the latest record",
    group: "navigation",
  },
  resize: {
    summary: "Narrowing to one pane moves focus from the hidden list to the heading",
    group: "navigation",
  },
  drafts: {
    summary: "Drafts stay with their record across navigation; discard restores the original",
    group: "editing",
  },
  "async-completion": {
    summary: "A commit settling after navigation sends once and leaves focus where the user is",
    group: "async",
    requires: "async",
  },
  validation: {
    summary: "An invalid commit keeps the value, focuses the field and describes the error",
    group: "editing",
  },
  "current-row": { summary: "Only the open record's row carries aria-current", group: "lists" },
  routing: {
    summary: "The selection parameter follows the open record and keeps other parameters",
    group: "navigation",
  },
  announcements: { summary: "A repeated identical outcome is announced again", group: "editing" },
  filters: {
    summary: "Filters persist, keep the open record open, and Clear focuses search",
    group: "lists",
  },
  "pending-focus": {
    summary: "Focus stays on an enabled control while a commit is pending",
    group: "async",
    requires: "async",
  },
  "empty-selection": {
    summary: "An empty selection parameter shows the list, not an unavailable record",
    group: "navigation",
  },
  "resize-keeps-draft": {
    summary: "A resize that leaves the focused field visible keeps its focus and draft",
    group: "navigation",
  },
  "context-initial": {
    summary: "The context aside shows on first open exactly when the policy says open",
    group: "navigation",
  },
  "forced-colors-row": {
    summary: "The current-row cue stays distinct from focus in forced colors",
    group: "lists",
  },
  "validation-separate": {
    summary:
      "A validation error describes the field and makes no commit; a commit failure shows visibly and never in the field's description",
    group: "editing",
    requires: "async",
  },
  unmount: {
    summary:
      "Unmounting while a commit is pending causes no error, and a remount shows no stale pending state",
    group: "async",
    requires: "async",
  },
  "live-records": {
    summary:
      "Records that change after mount are matched by id: the open record and drafts survive, a server echo shows once, and removing the open record shows it unavailable",
    group: "data",
  },
  "routing-boundary": {
    summary:
      "Navigation goes only through the router seam: one write per change, none for the open id, and the URL is untouched",
    group: "navigation",
  },
} as const satisfies Record<string, RuleMeta>;

export type RuleId = keyof typeof ruleMeta;
