import type { Meta } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { type FlowFixture, flow } from "../list-detail-flow/contract";
import { type Member, Members } from "./Members";

const meta = {
  title: "Validation/List-detail transfer/Members",
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;

const member = (id: string, name: string, team: string, role: Member["role"]): Member => ({
  id,
  name,
  email: `${name.split(" ")[0]?.toLowerCase()}@example.com`,
  role,
  team,
  note: `${name} joined the ${team} team this quarter.`,
});
const records = [
  member("MEM-201", "Ana Lima", "Platform", "Admin"),
  member("MEM-202", "Ben Okafor", "Design", "Editor"),
  member("MEM-203", "Chloe Martin", "Support", "Viewer"),
];
const committedText = "Platform reliability";

// Not a registered recipe: its own policy and gaps test the controller on a third record type.
const fixture: FlowFixture = {
  recipe: "Members",
  param: "member",
  render: ({ initialId, commit, records, router, loading, embedded }) => (
    <Members
      initialMemberId={initialId ?? null}
      {...(commit ? { commit } : {})}
      {...(records ? { members: records as Member[] } : {})}
      {...(router ? { router } : {})}
      {...(loading !== undefined ? { loading } : {})}
      {...(embedded ? { landmark: false, header: false } : {})}
    />
  ),
  policy: { collapseBelow: "40rem", context: "closed", commit: "edit" },
  context: "Member context",
  showContext: "Show context",
  first: { id: "MEM-201", row: /MEM-201.*Ana Lima/, heading: "Ana Lima" },
  second: { id: "MEM-202", row: /MEM-202.*Ben Okafor/, heading: "Ben Okafor" },
  query: "okafor",
  missingHeading: "Member unavailable",
  emptyHeading: "No members yet",
  names: { search: "Search members", back: "Back to members", clear: "Clear filters" },
  draft: {
    begin: /^Change access$/,
    field: "Team",
    discard: "Cancel changes",
    submit: "Save access",
    pristine: "Platform",
    invalid: "Enter a team.",
    failed: "Access could not be saved. Your draft is safe; try again.",
    needsChanges: /needs changes/,
    marker: /Unsaved draft/,
    discarded: /draft discarded/i,
  },
  commitOnce: async (canvas, user) => {
    await user.click(canvas.getByRole("button", { name: "Change access" }));
    await user.click(canvas.getByRole("button", { name: "Save access" }));
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Change access" })).toHaveFocus(),
    );
  },
  status: (root) => root.querySelector<HTMLElement>(".members-notice") ?? root,
  async: { pendingSubmit: "Saving access…" },
  live: {
    records,
    added: { id: "MEM-210", row: /MEM-210.*Eve Santos/, heading: "Eve Santos" },
    add: (current) => [...current, member("MEM-210", "Eve Santos", "Data", "Viewer")],
    echo: (current, id) =>
      (current as Member[]).map((entry) =>
        entry.id === id ? { ...entry, team: committedText } : entry,
      ),
    remove: (current, id) => (current as Member[]).filter((entry) => entry.id !== id),
    commitChange: async (canvas, user) => {
      await user.click(canvas.getByRole("button", { name: "Change access" }));
      const team = canvas.getByRole("textbox", { name: "Team" });
      await user.clear(team);
      await user.type(team, committedText);
      await user.click(canvas.getByRole("button", { name: "Save access" }));
      await waitFor(() =>
        expect(canvas.getByRole("button", { name: "Change access" })).toHaveFocus(),
      );
    },
    committedText,
  },
  gaps: {},
};

const { story, complete } = flow(fixture);

export const OpenFocus = story("open-focus");
export const UnavailableFocus = story("unavailable-focus");
export const Reselect = story("reselect");
export const ReturnRow = story("return-row");
export const FilteredReturn = story("filtered-return");
export const History = story("history");
export const Resize = story("resize");
export const Drafts = story("drafts");
export const AsyncCompletion = story("async-completion");
export const Validation = story("validation");
export const CurrentRow = story("current-row");
export const Routing = story("routing");
export const Announcements = story("announcements");
export const Filters = story("filters");
export const PendingFocus = story("pending-focus");
export const EmptySelection = story("empty-selection");
export const ResizeKeepsDraft = story("resize-keeps-draft");
export const ContextInitial = story("context-initial");
export const ForcedColorsRow = story("forced-colors-row");
export const ValidationSeparate = story("validation-separate");
export const Unmount = story("unmount");
export const LiveRecords = story("live-records");
export const RoutingBoundary = story("routing-boundary");
export const Loading = story("loading");
export const Refetch = story("refetch");
export const RefetchRow = story("refetch-row");
export const RefetchCount = story("refetch-count");
export const FormError = story("form-error");
export const Embedded = story("embedded");
export const DraftFocus = story("draft-focus");
export const DraftReopenFocus = story("draft-reopen-focus");
export const DraftMarker = story("draft-marker");

complete();
