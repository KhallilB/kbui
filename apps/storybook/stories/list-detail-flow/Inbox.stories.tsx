import type { Meta } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { Inbox, type InboxThread } from "../../recipes/Inbox";
import { type FlowFixture, flow, recipePolicy } from "./contract";
import { flowFacts } from "./facts";

const meta = {
  title: "Validation/List-detail flow/Inbox",
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;

const thread = (id: string, sender: string, subject: string): InboxThread => ({
  id,
  sender,
  address: `${id}@example.com`,
  subject,
  date: "30 October · 09:12",
  excerpt: `About ${subject.toLowerCase()}.`,
  paragraphs: [`Notes on ${subject.toLowerCase()}.`],
  context: `${sender} · Winter issue.`,
});
const threads = [
  thread("coast", "Mara Ellis", "Notes from the coast"),
  thread("proof", "Jon Bell", "A small correction to the print proof"),
  thread("translation", "Amina Okafor", "Translation notes"),
];
const committedText = "Thanks, the contact sheet works.";

const fixture: FlowFixture = {
  recipe: "Inbox",
  param: "message",
  render: ({ initialId, commit, records, router }) => (
    <Inbox
      initialThreadId={initialId ?? null}
      {...(commit ? { commit } : {})}
      {...(records ? { threads: records as InboxThread[] } : {})}
      {...(router ? { router } : {})}
    />
  ),
  policy: recipePolicy("Inbox"),
  context: "Sender details",
  showContext: "Show sender details",
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
    failed: "Reply could not be sent. Your draft is safe; try again.",
  },
  commitOnce: async (canvas, user) => {
    await user.click(canvas.getByRole("button", { name: /^Reply$/ }));
    await user.type(canvas.getByRole("textbox", { name: "Your reply" }), "Thanks.");
    await user.click(canvas.getByRole("button", { name: "Send reply" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: /^Reply$/ })).toHaveFocus());
  },
  status: (root) => root.querySelector<HTMLElement>('[role="status"].kb-sr-only') ?? root,
  async: flowFacts.Inbox.async ? { pendingSubmit: "Sending reply…" } : undefined,
  live: {
    records: threads,
    added: { id: "cover", row: /Priya Shah/, heading: "Revised cover caption" },
    add: (current) => [...current, thread("cover", "Priya Shah", "Revised cover caption")],
    echo: (current, id) =>
      (current as InboxThread[]).map((entry) =>
        entry.id === id ? { ...entry, paragraphs: [...entry.paragraphs, committedText] } : entry,
      ),
    remove: (current, id) => (current as InboxThread[]).filter((entry) => entry.id !== id),
    commitChange: async (canvas, user) => {
      await user.click(canvas.getByRole("button", { name: /^Reply$/ }));
      await user.type(canvas.getByRole("textbox", { name: "Your reply" }), committedText);
      await user.click(canvas.getByRole("button", { name: "Send reply" }));
      await waitFor(() => expect(canvas.getByRole("button", { name: /^Reply$/ })).toHaveFocus());
    },
    committedText,
  },
  gaps: flowFacts.Inbox.gaps,
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
