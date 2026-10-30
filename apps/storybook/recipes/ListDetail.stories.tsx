import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { ListDetail } from "./ListDetail";

const meta = {
  title: "Recipes/ListDetail",
  component: ListDetail,
  tags: ["!autodocs"],
  parameters: { layout: "padded" },
  afterEach: ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth + 1);
  },
  beforeEach: () => {
    if (import.meta.env.MODE !== "test") return;
    const original = window.location.href;
    const url = new URL(original);
    url.searchParams.delete("request");
    window.history.replaceState(null, "", url);
    return () => window.history.replaceState(null, "", original);
  },
} satisfies Meta<typeof ListDetail>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RequestQueue: Story = {
  play: async ({ canvasElement, userEvent }) => {
    if (
      import.meta.env.MODE !== "test" &&
      new URL(window.location.href).searchParams.has("request")
    )
      return;
    const canvas = within(canvasElement);
    const row = canvas.getByRole("button", { name: /REQ-1042.*Warehouse access/ });
    row.focus();
    await userEvent.keyboard("{Enter}");
    const detail = canvas.getByRole("region", { name: "Warehouse access" });
    await expect(within(detail).getByRole("heading", { name: "Warehouse access" })).toHaveFocus();
    expect(new URL(window.location.href).searchParams.get("request")).toBe("REQ-1042");
    await expect(canvas.getByRole("complementary", { name: "Request context" })).toHaveTextContent(
      "North depot",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Hide context" }));
    expect(canvas.queryByRole("complementary", { name: "Request context" })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Show context" }));
    await expect(canvas.getByRole("complementary", { name: "Request context" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Back to requests" }));
    await expect(row).toHaveFocus();
    expect(new URL(window.location.href).searchParams.has("request")).toBe(false);
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth + 1);
  },
};

export const EditAndValidate: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /REQ-1042.*Warehouse access/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Edit request" }));
    const title = canvas.getByRole("textbox", { name: "Request title" });
    await expect(title).toHaveFocus();
    await userEvent.clear(title);
    await userEvent.type(title, "   ");
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(title).toHaveFocus();
    await expect(title).toHaveAccessibleDescription("Enter a request title.");
    await expect(canvas.getByRole("textbox", { name: "Owner" })).toHaveValue("Maya Chen");
    await userEvent.clear(title);
    await userEvent.type(title, "Warehouse access approved");
    const owner = canvas.getByRole("textbox", { name: "Owner" });
    await userEvent.clear(owner);
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(owner).toHaveFocus();
    await expect(owner).toHaveAccessibleDescription("Enter an owner.");
    await userEvent.type(owner, "Sam Rivera");
    await userEvent.click(canvas.getByRole("combobox", { name: "Status" }));
    await userEvent.click(await canvas.findByRole("option", { name: "Resolved" }));
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(canvas.getByRole("heading", { name: "Warehouse access approved" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Edit request" })).toHaveFocus();
    await expect(canvas.getByRole("status")).toHaveTextContent("REQ-1042 saved for this session.");
    await expect(canvas.getByRole("complementary", { name: "Request context" })).toHaveTextContent(
      "Sam Rivera",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Back to requests" }));
    await expect(
      canvas.getByRole("button", { name: /REQ-1042.*Warehouse access approved.*Resolved/ }),
    ).toBeVisible();
  },
};

export const RetainedDraft: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /REQ-1042.*Warehouse access/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Edit request" }));
    const title = canvas.getByRole("textbox", { name: "Request title" });
    await userEvent.clear(title);
    await userEvent.type(title, "Unfinished draft");
    await userEvent.click(canvas.getByRole("button", { name: "Back to requests" }));
    await userEvent.click(
      canvas.getByRole("button", { name: /REQ-1043.*Replace loading dock scanner/ }),
    );
    await expect(canvas.getByRole("complementary", { name: "Request context" })).toHaveTextContent(
      "East depot",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Back to requests" }));
    await userEvent.click(canvas.getByRole("button", { name: /REQ-1042.*Warehouse access/ }));
    await expect(canvas.getByRole("textbox", { name: "Request title" })).toHaveValue(
      "Unfinished draft",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Cancel editing" }));
    await expect(canvas.getByRole("heading", { name: "Warehouse access" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Edit request" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Edit request" }));
    await expect(canvas.getByRole("textbox", { name: "Request title" })).toHaveValue(
      "Warehouse access",
    );
  },
};

export const SearchAndRecovery: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole("searchbox", { name: "Search requests" });
    await userEvent.type(search, "nothing matches");
    await expect(canvas.getByRole("heading", { name: "No matching requests" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    await expect(search).toHaveFocus();
    await expect(search).toHaveValue("");
    await userEvent.click(canvas.getByRole("combobox", { name: "Filter by status" }));
    await userEvent.click(await canvas.findByRole("option", { name: "Resolved" }));
    await expect(
      canvas.getByRole("button", { name: /REQ-1044.*Delivery window update/ }),
    ).toBeVisible();
    expect(canvas.queryByRole("button", { name: /REQ-1042/ })).toBeNull();
    await userEvent.type(search, "none");
    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    await expect(canvas.getByRole("button", { name: /REQ-1042/ })).toBeVisible();
  },
};

export const UnavailableRequest: Story = {
  args: { initialRequestId: "missing" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Request unavailable" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Back to requests" }));
    await expect(canvas.getByRole("searchbox", { name: "Search requests" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: /REQ-1043/ }));
    window.history.back();
    await waitFor(() => expect(canvas.getByRole("button", { name: /REQ-1043/ })).toHaveFocus());
  },
};

export const EmptyQueue: Story = {
  args: { initialRequests: [] },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("heading", { name: "No requests yet" }),
    ).toBeVisible();
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth + 1);
  },
};

export const LongContent: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /REQ-1045/ }));
    await expect(
      canvas.getByRole("heading", {
        name: "Review international shipment documentation and regional handling instructions",
      }),
    ).toBeVisible();
    await expect(canvas.getByRole("complementary", { name: "Request context" })).toHaveTextContent(
      "Central distribution hub",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Edit request" }));
    await expect(canvas.getByRole("textbox", { name: "Request title" })).toHaveValue(
      "Review international shipment documentation and regional handling instructions",
    );
  },
};
