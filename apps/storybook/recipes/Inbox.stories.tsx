import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { controls, Harness } from "../stories/list-detail-flow/harness";
import { type CommitResult, Inbox, type InboxThread } from "./Inbox";

const meta = {
  title: "Recipes/Inbox",
  component: Inbox,
  tags: ["!autodocs"],
  parameters: { layout: "padded" },
  beforeEach: () => {
    if (import.meta.env.MODE !== "test") return;
    const original = window.location.href;
    const url = new URL(original);
    url.searchParams.delete("message");
    window.history.replaceState(null, "", url);
    return () => window.history.replaceState(null, "", original);
  },
  afterEach: ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth + 1);
  },
} satisfies Meta<typeof Inbox>;
export default meta;
type Story = StoryObj<typeof meta>;

const failed = "Reply could not be sent. Your draft is safe; try again.";
const offline = () => Promise.reject(new Error("offline"));

export const Correspondence: Story = {
  play: async ({ canvasElement, userEvent }) => {
    if (
      import.meta.env.MODE !== "test" &&
      new URL(window.location.href).searchParams.has("message")
    )
      return;
    const canvas = within(canvasElement);
    const row = canvas.getByRole("button", { name: /Mara Ellis.*Notes from the coast/ });
    row.focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("heading", { name: "Notes from the coast" })).toHaveFocus();
    expect(new URL(window.location.href).searchParams.get("message")).toBe("coast");
    if (row.getClientRects().length) {
      await userEvent.click(row);
      await expect(canvas.getByRole("heading", { name: "Notes from the coast" })).toHaveFocus();
    }
    await userEvent.click(canvas.getByRole("button", { name: "Show sender details" }));
    await expect(canvas.getByRole("complementary", { name: "Sender details" })).toHaveTextContent(
      "Mara Ellis",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Hide sender details" }));
    expect(canvas.queryByRole("complementary", { name: "Sender details" })).toBeNull();
    await expect(canvas.getByRole("button", { name: "Show sender details" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Back to inbox" }));
    await expect(row).toHaveFocus();
    expect(new URL(window.location.href).searchParams.has("message")).toBe(false);
  },
};

export const ReplyAndDrafts: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Mara Ellis.*Notes from the coast/ }));
    await userEvent.click(canvas.getByRole("button", { name: /^Reply$/ }));
    const reply = canvas.getByRole("textbox", { name: "Your reply" });
    await expect(reply).toHaveFocus();
    await userEvent.type(reply, "   ");
    await userEvent.click(canvas.getByRole("button", { name: "Send reply" }));
    await expect(reply).toHaveFocus();
    await expect(reply).toHaveAccessibleDescription("Write a reply before sending.");
    await userEvent.clear(reply);
    await userEvent.type(reply, "Please send the contact sheet.");
    await userEvent.click(canvas.getByRole("button", { name: "Back to inbox" }));
    await expect(canvas.getByRole("button", { name: /Mara Ellis.*Draft/ })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /Jon Bell/ }));
    expect(canvas.queryByRole("textbox", { name: "Your reply" })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Back to inbox" }));
    await userEvent.click(canvas.getByRole("button", { name: /Mara Ellis/ }));
    await expect(canvas.getByRole("textbox", { name: "Your reply" })).toHaveValue(
      "Please send the contact sheet.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Send reply" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Reply added to Notes from the coast for this session.",
    );
    await expect(canvas.getByRole("button", { name: /^Reply$/ })).toHaveFocus();
    await expect(canvas.getByRole("article", { name: "Your reply 1" })).toHaveTextContent(
      "Please send the contact sheet.",
    );
  },
};

export const DeliveryRecovery: Story = {
  args: {
    commit: async () => {
      throw new Error("offline");
    },
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Mara Ellis/ }));
    await userEvent.click(canvas.getByRole("button", { name: /^Reply$/ }));
    await userEvent.type(canvas.getByRole("textbox", { name: "Your reply" }), "Keep this draft.");
    await userEvent.click(canvas.getByRole("button", { name: "Send reply" }));
    await waitFor(() => expect(canvas.getByText(failed)).toBeVisible());
    await expect(canvas.getByRole("textbox", { name: "Your reply" })).toHaveValue(
      "Keep this draft.",
    );
    await expect(canvas.getByRole("textbox", { name: "Your reply" })).toHaveFocus();
    expect(canvas.queryByRole("article", { name: "Your reply 1" })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Discard draft" }));
    await expect(canvas.getByRole("button", { name: /^Reply$/ })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: /^Reply$/ }));
    await expect(canvas.getByRole("textbox", { name: "Your reply" })).toHaveValue("");
  },
};

export const FilterAndHistory: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole("searchbox", { name: "Search correspondence" });
    await userEvent.type(search, "no match");
    await expect(canvas.getByRole("heading", { name: "No matching messages" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    await expect(search).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: /Mara Ellis/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Back to inbox" }));
    await userEvent.type(search, "Jon");
    window.history.back();
    await waitFor(() =>
      expect(canvas.getByRole("heading", { name: "Notes from the coast" })).toHaveFocus(),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Back to inbox" }));
    await expect(search).toHaveFocus();
    await expect(search).toHaveValue("Jon");
  },
};

export const MissingMessage: Story = {
  args: { initialThreadId: "missing" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Message unavailable" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Back to inbox" }));
    await expect(canvas.getByRole("searchbox", { name: "Search correspondence" })).toHaveFocus();
  },
};

export const EmptyInbox: Story = {
  args: { threads: [] },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("heading", { name: "No correspondence yet" }),
    ).toBeVisible();
  },
};

export const LongLetter: Story = {
  args: { initialThreadId: "translation" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /Translation notes/ })).toBeVisible();
    await expect(
      canvas.getByRole("article", { name: "Letter from Amina Okafor" }),
    ).toHaveTextContent("édition");
  },
};

type Outcome = CommitResult<"body">;

/** Commit whose next call waits until the story settles it. */
function held() {
  const commit = fn(async (_id: string, _draft: { body: string }): Promise<Outcome> => {});
  let settle: (ok: boolean) => void = () => {};
  const next = () =>
    commit.mockReturnValueOnce(
      new Promise<Outcome>((resolve, reject) => {
        settle = (ok) => (ok ? resolve() : reject(new Error("offline")));
      }),
    );
  return { commit, next, settle: (ok: boolean) => settle(ok) };
}

type Context = Parameters<NonNullable<Story["play"]>>[0];

/** Opens Mara's letter, starts a reply and returns its field. */
async function replyFirst(
  { canvasElement, userEvent }: Context,
  text = "Please send the contact sheet.",
) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: /Mara Ellis/ }));
  await userEvent.click(canvas.getByRole("button", { name: /^Reply$/ }));
  const field = canvas.getByRole("textbox", { name: "Your reply" });
  await userEvent.type(field, text);
  return field;
}

function send({ canvasElement, userEvent }: Context) {
  return userEvent.click(within(canvasElement).getByRole("button", { name: "Send reply" }));
}

const pendingDelivery = held();
export const PendingDelivery: Story = {
  args: { commit: pendingDelivery.commit },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    pendingDelivery.next();
    await replyFirst(context, "Sending once.");
    await send(context);
    await expect(canvas.getByRole("button", { name: "Sending reply…" })).toBeDisabled();
    await expect(canvas.getByRole("textbox", { name: "Your reply" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Discard draft" })).toBeDisabled();
    pendingDelivery.settle(true);
    await waitFor(() => expect(canvas.getByRole("button", { name: /^Reply$/ })).toHaveFocus());
    await expect(canvas.getAllByRole("article", { name: /Your reply/ })).toHaveLength(1);
    expect(pendingDelivery.commit).toHaveBeenCalledTimes(1);
  },
};

export const ClientValidationBlocksCommit: Story = {
  args: {
    commit: fn(async () => {}),
    validate: ({ body }) => (body.includes("tomorrow") ? { body: "Give a date, not a day." } : {}),
  },
  play: async (context) => {
    const field = await replyFirst(context, "I will send it tomorrow.");
    await send(context);
    await expect(field).toHaveFocus();
    await expect(field).toHaveAccessibleDescription("Give a date, not a day.");
    await expect(field).toHaveValue("I will send it tomorrow.");
    expect(context.args.commit).not.toHaveBeenCalled();
  },
};

export const ServerErrorsActLikeValidation: Story = {
  args: { commit: fn(async () => ({ errors: { body: "Server says no" } })) },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    const field = await replyFirst(context);
    await send(context);
    await waitFor(() => expect(field).toHaveFocus());
    await expect(field).toHaveAccessibleDescription("Server says no");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Reply to Mara Ellis needs changes before sending.",
    );
    await expect(field).toHaveValue("Please send the contact sheet.");
    expect(canvas.queryByRole("article", { name: "Your reply 1" })).toBeNull();
    expect(canvas.queryByText(failed)).toBeNull();
  },
};

export const CommitRejectionShowsVisibleError: Story = {
  args: { commit: fn(offline) },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    const field = await replyFirst(context);
    await send(context);
    await waitFor(() => expect(canvas.getByText(failed)).toBeVisible());
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Reply to Mara Ellis failed. Draft retained.",
    );
    await expect(field).toHaveFocus();
    await expect(field).toHaveValue("Please send the contact sheet.");
    await expect(field).not.toHaveAccessibleDescription(/could not be sent/);
  },
};

export const CommitSuccessAppliesAndClears: Story = {
  args: { commit: fn(async () => {}) },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    await replyFirst(context);
    await send(context);
    await waitFor(() => expect(canvas.getByRole("button", { name: /^Reply$/ })).toHaveFocus());
    expect(context.args.commit).toHaveBeenCalledWith("coast", {
      body: "Please send the contact sheet.",
    });
    await expect(canvas.getByRole("article", { name: "Your reply 1" })).toHaveTextContent(
      "Please send the contact sheet.",
    );
    expect(canvas.queryByRole("textbox", { name: "Your reply" })).toBeNull();
  },
};

const leavingSuccess = held();
export const SuccessAfterLeavingKeepsFocus: Story = {
  args: { commit: leavingSuccess.commit },
  play: async (context) => {
    const { userEvent } = context;
    const canvas = within(context.canvasElement);
    leavingSuccess.next();
    await replyFirst(context);
    await send(context);
    await userEvent.click(canvas.getByRole("button", { name: "Back to inbox" }));
    await userEvent.click(canvas.getByRole("button", { name: /Jon Bell/ }));
    const heading = canvas.getByRole("heading", { name: "A small correction to the print proof" });
    await waitFor(() => expect(heading).toHaveFocus());
    leavingSuccess.settle(true);
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        "Reply added to Notes from the coast for this session.",
      ),
    );
    await expect(heading).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Back to inbox" }));
    await userEvent.click(canvas.getByRole("button", { name: /Mara Ellis/ }));
    await expect(canvas.getAllByRole("article", { name: /Your reply/ })).toHaveLength(1);
  },
};

const leavingFailure = held();
export const FailureAfterLeavingKeepsDraftAndError: Story = {
  args: { commit: leavingFailure.commit },
  play: async (context) => {
    const { userEvent } = context;
    const canvas = within(context.canvasElement);
    leavingFailure.next();
    await replyFirst(context, "Retain after late failure.");
    await send(context);
    await userEvent.click(canvas.getByRole("button", { name: "Back to inbox" }));
    await userEvent.click(canvas.getByRole("button", { name: /Jon Bell/ }));
    const heading = canvas.getByRole("heading", { name: "A small correction to the print proof" });
    await waitFor(() => expect(heading).toHaveFocus());
    leavingFailure.settle(false);
    const status = canvas.getByRole("status");
    await waitFor(() =>
      expect(status).toHaveTextContent("Reply to Mara Ellis failed. Draft retained."),
    );
    await expect(heading).toHaveFocus();
    let announced = 0;
    const observer = new MutationObserver((records) => {
      announced += records.length;
    });
    observer.observe(status, { subtree: true, childList: true, characterData: true });
    try {
      await userEvent.click(canvas.getByRole("button", { name: "Back to inbox" }));
      await userEvent.click(canvas.getByRole("button", { name: /Mara Ellis/ }));
      await expect(canvas.getByRole("textbox", { name: "Your reply" })).toHaveValue(
        "Retain after late failure.",
      );
      await expect(canvas.getByText(failed)).toBeVisible();
      expect(announced, "failure announced again on reopen").toBe(0);
    } finally {
      observer.disconnect();
    }
  },
};

const echoed: InboxThread[] = [
  {
    id: "coast",
    sender: "Mara Ellis",
    address: "mara@example.com",
    subject: "Notes from the coast",
    date: "30 October · 09:12",
    excerpt: "The last ferry left before the rain.",
    paragraphs: ["Hi Rowan, the last ferry left before the rain."],
    context: "Photographer · Winter issue.",
  },
];
export const EchoAfterFailedCommitKeepsDraft: Story = {
  args: { commit: fn(offline) },
  render: (args) => (
    <Harness
      records={echoed}
      render={(records) => <Inbox {...args} threads={records as InboxThread[]} />}
    />
  ),
  play: async (context) => {
    const canvas = within(context.canvasElement);
    const field = await replyFirst(context);
    await send(context);
    await waitFor(() => expect(canvas.getByText(failed)).toBeVisible());
    controls.setRecords(echoed.map((thread) => ({ ...thread })));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await expect(field).toHaveValue("Please send the contact sheet.");
    await expect(canvas.getByText(failed)).toBeVisible();
    expect(canvas.queryByRole("article", { name: /Your reply/ })).toBeNull();
  },
};

export const UnrenderedFieldErrorFocusesSubmit: Story = {
  args: {
    commit: fn(async () => {}),
    validate: () => ({ attachment: "Attach the contact sheet." }) as Record<string, string>,
  },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    await replyFirst(context);
    await send(context);
    await expect(canvas.getByRole("button", { name: "Send reply" })).toHaveFocus();
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("Attach the contact sheet.");
    let announced = 0;
    const observer = new MutationObserver((records) => {
      announced += records.length;
    });
    observer.observe(status, { subtree: true, childList: true, characterData: true });
    try {
      await send(context);
      await waitFor(() => expect(announced, "identical error announced again").toBeGreaterThan(0));
    } finally {
      observer.disconnect();
    }
    expect(context.args.commit).not.toHaveBeenCalled();
  },
};

export const CopyReplacesStrings: Story = {
  args: { copy: { title: "Letters", reply: "Answer" } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Letters" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /Mara Ellis/ }));
    await expect(canvas.getByRole("button", { name: "Answer" })).toBeVisible();
  },
};
