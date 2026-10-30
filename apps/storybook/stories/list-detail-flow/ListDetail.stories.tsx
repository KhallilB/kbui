import type { Meta } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { ListDetail } from "../../recipes/ListDetail";
import { type FlowFixture, flow } from "./contract";

const meta = {
  title: "Validation/List-detail flow/ListDetail",
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;

const fixture: FlowFixture = {
  recipe: "ListDetail",
  param: "request",
  render: ({ initialId }) => <ListDetail initialRequestId={initialId ?? null} />,
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
  },
  commit: async (canvas, user) => {
    await user.click(canvas.getByRole("button", { name: "Edit request" }));
    await user.click(canvas.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: "Edit request" })).toHaveFocus());
  },
  status: (root) => root.querySelector<HTMLElement>(".request-flow-notice") ?? root,
  gaps: {
    reselect: "Reselect pushes a history entry and defers focus",
    history: "History Back keeps the older return row",
    announcements: "A repeated save sets identical status text",
  },
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
export const Validation = story("validation");
export const CurrentRow = story("current-row");
export const Routing = story("routing");
export const Announcements = story("announcements");
export const Filters = story("filters");
export const EmptySelection = story("empty-selection");

complete();
