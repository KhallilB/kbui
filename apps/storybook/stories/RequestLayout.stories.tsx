import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { page } from "vitest/browser";
import { ListDetail } from "../recipes/ListDetail";

const meta = {
  title: "Validation/Request layout",
  component: ListDetail,
  parameters: { layout: "padded" },
  beforeEach: () => {
    const original = window.location.href;
    const url = new URL(original);
    url.searchParams.delete("request");
    window.history.replaceState(null, "", url);
    return () => window.history.replaceState(null, "", original);
  },
} satisfies Meta<typeof ListDetail>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ResizeFocus: Story = {
  args: { initialRequestId: "REQ-1042" },
  play: async ({ canvasElement, userEvent }) => {
    const original = { width: innerWidth, height: innerHeight };
    const canvas = within(canvasElement);
    try {
      await page.viewport(1440, 900);
      // Observe wide layout before testing a second resize.
      await new Promise<void>((resolve) => {
        const observer = new ResizeObserver(() => {
          observer.disconnect();
          resolve();
        });
        observer.observe(canvasElement);
      });
      const search = canvas.getByRole("searchbox", { name: "Search requests" });
      search.focus();
      await expect(search).toHaveFocus();
      await page.viewport(390, 844);
      const heading = canvas.getByRole("heading", { name: "Warehouse access" });
      await waitFor(() => expect(heading).toHaveFocus());
      expect(canvas.queryByRole("searchbox", { name: "Search requests" })).toBeNull();
      await page.viewport(1440, 900);
      await expect(heading).toHaveFocus();

      await userEvent.click(canvas.getByRole("button", { name: "Edit request" }));
      const title = canvas.getByRole("textbox", { name: "Request title" });
      await userEvent.clear(title);
      await userEvent.type(title, "Retained through resize");
      await page.viewport(390, 844);
      await expect(title).toHaveFocus();
      await expect(title).toHaveValue("Retained through resize");
      await expect(title).toBeVisible();
      expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth + 1);

      await page.viewport(1440, 900);
      await userEvent.click(canvas.getByRole("combobox", { name: "Filter by status" }));
      await userEvent.click(await canvas.findByRole("option", { name: "Resolved" }));
      search.focus();
      await page.viewport(390, 844);
      await waitFor(() => expect(heading).toHaveFocus());
      await userEvent.click(canvas.getByRole("button", { name: "Back to requests" }));
      await expect(search).toHaveFocus();
      expect(canvas.queryByRole("button", { name: /REQ-1042/ })).toBeNull();
    } finally {
      await page.viewport(original.width, original.height);
    }
  },
};

export const ResizeWithoutSelection: Story = {
  play: async ({ canvasElement }) => {
    const original = { width: innerWidth, height: innerHeight };
    const canvas = within(canvasElement);
    try {
      await page.viewport(1440, 900);
      const search = canvas.getByRole("searchbox", { name: "Search requests" });
      search.focus();
      await page.viewport(390, 844);
      await expect(search).toHaveFocus();
      await expect(search).toBeVisible();
    } finally {
      await page.viewport(original.width, original.height);
    }
  },
};
