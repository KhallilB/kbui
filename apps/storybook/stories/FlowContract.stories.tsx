import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { page } from "vitest/browser";
import { Inbox } from "../recipes/Inbox";
import { ListDetail } from "../recipes/ListDetail";
import { deferred, type FlowFixture, type RuleId, rules, verify } from "./flow-contract";

// One list-and-detail flow contract, run against every flow recipe.
const meta = {
  title: "Validation/Flow contract",
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const listDetail: FlowFixture = {
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
  // Reselect pushes history and defers focus; history Back keeps the older return row;
  // a repeated save sets identical status text, so nothing is announced.
  gaps: ["R2 reselect", "R4 history", "R11 announcements"],
};

const inbox: FlowFixture = {
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
  // Disabling the focused submit drops focus to the body; `?message=` reads as a selection.
  gaps: ["R13 pending focus", "R14 empty selection"],
};

function contract(fixture: FlowFixture, id: RuleId): Story {
  const rule = rules[id];
  const send = deferred();
  return {
    name: `${fixture.recipe}: ${id}`,
    render: () =>
      fixture.render({ initialId: rule.initialId, send: rule.deferredSend ? send : undefined }),
    beforeEach: () => {
      const original = window.location.href;
      const url = new URL(original);
      for (const key of [listDetail.param, inbox.param, "keep"]) url.searchParams.delete(key);
      for (const [key, value] of new URLSearchParams(rule.search?.(fixture) ?? ""))
        url.searchParams.set(key, value);
      window.history.replaceState(null, "", url);
      return () => window.history.replaceState(null, "", original);
    },
    play: async ({ canvasElement, userEvent }) => {
      const original = { width: innerWidth, height: innerHeight };
      try {
        if (rule.width) await page.viewport(rule.width, 900);
        await verify(
          id,
          () =>
            rule.check({
              fixture,
              root: canvasElement,
              canvas: within(canvasElement),
              user: userEvent,
              send,
            }),
          fixture,
        );
      } finally {
        await page.viewport(original.width, original.height);
      }
    },
  };
}

export const ListDetailOpen = contract(listDetail, "R1 open focuses heading");
export const ListDetailUnavailable = contract(listDetail, "R1 unavailable focuses heading");
export const ListDetailReselect = contract(listDetail, "R2 reselect");
export const ListDetailReturnRow = contract(listDetail, "R3 return row");
export const ListDetailFilteredReturn = contract(listDetail, "R3 filtered return");
export const ListDetailHistory = contract(listDetail, "R4 history");
export const ListDetailResize = contract(listDetail, "R5 resize");
export const ListDetailDrafts = contract(listDetail, "R6 drafts");
export const ListDetailValidation = contract(listDetail, "R8 validation");
export const ListDetailCurrentRow = contract(listDetail, "R9 current row");
export const ListDetailRouting = contract(listDetail, "R10 routing");
export const ListDetailAnnouncements = contract(listDetail, "R11 announcements");
export const ListDetailFilters = contract(listDetail, "R12 filters");
export const ListDetailEmptySelection = contract(listDetail, "R14 empty selection");

export const InboxOpen = contract(inbox, "R1 open focuses heading");
export const InboxUnavailable = contract(inbox, "R1 unavailable focuses heading");
export const InboxReselect = contract(inbox, "R2 reselect");
export const InboxReturnRow = contract(inbox, "R3 return row");
export const InboxFilteredReturn = contract(inbox, "R3 filtered return");
export const InboxHistory = contract(inbox, "R4 history");
export const InboxResize = contract(inbox, "R5 resize");
export const InboxDrafts = contract(inbox, "R6 drafts");
export const InboxAsyncCompletion = contract(inbox, "R7 async completion");
export const InboxValidation = contract(inbox, "R8 validation");
export const InboxCurrentRow = contract(inbox, "R9 current row");
export const InboxRouting = contract(inbox, "R10 routing");
export const InboxAnnouncements = contract(inbox, "R11 announcements");
export const InboxFilters = contract(inbox, "R12 filters");
export const InboxPendingFocus = contract(inbox, "R13 pending focus");
export const InboxEmptySelection = contract(inbox, "R14 empty selection");
