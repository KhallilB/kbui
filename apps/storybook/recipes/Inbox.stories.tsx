import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { Inbox } from "./Inbox";

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
    sendReply: async () => {
      throw new Error("offline");
    },
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Mara Ellis/ }));
    await userEvent.click(canvas.getByRole("button", { name: /^Reply$/ }));
    await userEvent.type(canvas.getByRole("textbox", { name: "Your reply" }), "Keep this draft.");
    await userEvent.click(canvas.getByRole("button", { name: "Send reply" }));
    await expect(canvas.getByRole("textbox", { name: "Your reply" })).toHaveAccessibleDescription(
      "Reply could not be sent. Your draft is safe; try again.",
    );
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
  args: { initialThreads: [] },
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

const deferredSend = fn(async (_id: string, _body: string) => {});
export const PendingDelivery: Story = {
  args: { sendReply: deferredSend },
  play: async ({ canvasElement, userEvent }) => {
    let complete = () => {};
    const delivered = new Promise<void>((resolve) => {
      complete = resolve;
    });
    deferredSend.mockReturnValueOnce(delivered);
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Mara Ellis/ }));
    await userEvent.click(canvas.getByRole("button", { name: /^Reply$/ }));
    await userEvent.type(canvas.getByRole("textbox", { name: "Your reply" }), "Sending once.");
    await userEvent.click(canvas.getByRole("button", { name: "Send reply" }));
    await expect(canvas.getByRole("button", { name: "Sending reply…" })).toBeDisabled();
    await expect(canvas.getByRole("textbox", { name: "Your reply" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Discard draft" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Back to inbox" }));
    await userEvent.click(canvas.getByRole("button", { name: /Jon Bell/ }));
    const heading = canvas.getByRole("heading", { name: "A small correction to the print proof" });
    complete();
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        "Reply added to Notes from the coast for this session.",
      ),
    );
    await expect(heading).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Back to inbox" }));
    await userEvent.click(canvas.getByRole("button", { name: /Mara Ellis/ }));
    await expect(canvas.getAllByRole("article", { name: /Your reply/ })).toHaveLength(1);
    await expect(canvas.getByRole("article", { name: "Your reply 1" })).toHaveTextContent(
      "Sending once.",
    );
    expect(deferredSend).toHaveBeenCalledTimes(1);
    let fail = () => {};
    deferredSend.mockReturnValueOnce(
      new Promise<void>((_resolve, reject) => {
        fail = () => reject(new Error("offline"));
      }),
    );
    await userEvent.click(canvas.getByRole("button", { name: /^Reply$/ }));
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Your reply" }),
      "Retain after late failure.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Send reply" }));
    await userEvent.click(canvas.getByRole("button", { name: "Back to inbox" }));
    await userEvent.click(canvas.getByRole("button", { name: /Jon Bell/ }));
    fail();
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        "Reply to Mara Ellis failed. Draft retained.",
      ),
    );
    await expect(
      canvas.getByRole("heading", { name: "A small correction to the print proof" }),
    ).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Back to inbox" }));
    await userEvent.click(canvas.getByRole("button", { name: /Mara Ellis/ }));
    await expect(canvas.getByRole("textbox", { name: "Your reply" })).toHaveValue(
      "Retain after late failure.",
    );
    await expect(canvas.getByRole("textbox", { name: "Your reply" })).toHaveAccessibleDescription(
      "Reply could not be sent. Your draft is safe; try again.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Send reply" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: /^Reply$/ })).toHaveFocus());
    expect(canvas.getAllByRole("article", { name: /Your reply/ })).toHaveLength(2);
    expect(deferredSend).toHaveBeenCalledTimes(3);
  },
};
