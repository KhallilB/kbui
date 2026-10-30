import type { Meta } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { Inbox } from "../../recipes/Inbox";
import { type FlowFixture, flow } from "./contract";

const meta = {
  title: "Validation/List-detail flow/Inbox",
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;

const fixture: FlowFixture = {
  recipe: "Inbox",
  param: "message",
  render: ({ initialId, send }) => (
    <Inbox initialThreadId={initialId ?? null} {...(send ? { sendReply: send } : {})} />
  ),
  first: { id: "coast", row: /Mara Ellis/, heading: "Notes from the coast" },
  second: { id: "proof", row: /Jon Bell/, heading: "A small correction to the print proof" },
  query: "Jon",
  missingHeading: "Message unavailable",
  names: { search: "Search correspondence", back: "Back to inbox", clear: "Clear search" },
  draft: {
    begin: /^Reply$/,
    field: "Your reply",
    discard: "Discard draft",
    submit: "Send reply",
    pristine: "",
    invalid: "Write a reply before sending.",
  },
  commit: async (canvas, user) => {
    await user.click(canvas.getByRole("button", { name: /^Reply$/ }));
    await user.type(canvas.getByRole("textbox", { name: "Your reply" }), "Thanks.");
    await user.click(canvas.getByRole("button", { name: "Send reply" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: /^Reply$/ })).toHaveFocus());
  },
  status: (root) => root.querySelector<HTMLElement>('[role="status"].kb-sr-only') ?? root,
  async: { pendingSubmit: "Sending reply…" },
  gaps: {
    "pending-focus": "Disabling the focused submit drops focus to the body",
    "empty-selection": "`?message=` reads as a selection",
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
export const AsyncCompletion = story("async-completion");
export const Validation = story("validation");
export const CurrentRow = story("current-row");
export const Routing = story("routing");
export const Announcements = story("announcements");
export const Filters = story("filters");
export const PendingFocus = story("pending-focus");
export const EmptySelection = story("empty-selection");

complete();
