import type { Meta } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { ListDetail, type RequestRecord } from "../../recipes/ListDetail";
import { type FlowFixture, flow, recipePolicy } from "./contract";
import { flowFacts } from "./facts";

const meta = {
  title: "Validation/List-detail flow/ListDetail",
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;

const record = (id: string, title: string, owner: string): RequestRecord => ({
  id,
  title,
  owner,
  status: "Open",
  summary: `Summary for ${title}.`,
  site: "North depot",
  requester: "Alex Morgan",
  activity: `${owner} reviewed this request.`,
});
const records = [
  record("REQ-1042", "Warehouse access", "Maya Chen"),
  record("REQ-1043", "Replace loading dock scanner", "Sam Rivera"),
  record("REQ-1044", "Delivery window update", "Casey Park"),
];
const committedText = "Warehouse access for the inventory team";

const fixture: FlowFixture = {
  recipe: "ListDetail",
  param: "request",
  render: ({ initialId, commit, records, router }) => (
    <ListDetail
      initialRequestId={initialId ?? null}
      {...(commit ? { commit } : {})}
      {...(records ? { requests: records as RequestRecord[] } : {})}
      {...(router ? { router } : {})}
    />
  ),
  policy: recipePolicy("ListDetail"),
  context: "Request context",
  showContext: "Show context",
  first: { id: "REQ-1042", row: /REQ-1042.*Warehouse access/, heading: "Warehouse access" },
  second: {
    id: "REQ-1043",
    row: /REQ-1043.*Replace loading dock scanner/,
    heading: "Replace loading dock scanner",
  },
  query: "scanner",
  missingHeading: "Request unavailable",
  names: { search: "Search requests", back: "Back to requests", clear: "Clear filters" },
  draft: {
    begin: /^Edit request$/,
    field: "Request title",
    discard: "Cancel editing",
    submit: "Save changes",
    pristine: "Warehouse access",
    invalid: "Enter a request title.",
    failed: "Changes could not be saved. Your draft is safe; try again.",
  },
  commitOnce: async (canvas, user) => {
    await user.click(canvas.getByRole("button", { name: "Edit request" }));
    await user.click(canvas.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: "Edit request" })).toHaveFocus());
  },
  status: (root) => root.querySelector<HTMLElement>(".request-flow-notice") ?? root,
  async: flowFacts.ListDetail.async ? { pendingSubmit: "Saving changes…" } : undefined,
  live: {
    records,
    added: { id: "REQ-1050", row: /REQ-1050.*Freezer door seal/, heading: "Freezer door seal" },
    add: (current) => [...current, record("REQ-1050", "Freezer door seal", "Jordan Lee")],
    echo: (current, id) =>
      (current as RequestRecord[]).map((entry) =>
        entry.id === id ? { ...entry, title: committedText } : entry,
      ),
    remove: (current, id) => (current as RequestRecord[]).filter((entry) => entry.id !== id),
    commitChange: async (canvas, user) => {
      await user.click(canvas.getByRole("button", { name: "Edit request" }));
      const title = canvas.getByRole("textbox", { name: "Request title" });
      await user.clear(title);
      await user.type(title, committedText);
      await user.click(canvas.getByRole("button", { name: "Save changes" }));
      await waitFor(() =>
        expect(canvas.getByRole("button", { name: "Edit request" })).toHaveFocus(),
      );
    },
    committedText,
  },
  gaps: flowFacts.ListDetail.gaps,
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

complete();
