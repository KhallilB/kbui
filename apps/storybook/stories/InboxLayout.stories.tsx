import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { page } from "vitest/browser";
import { Inbox } from "../recipes/Inbox";

const meta = {
  title: "Validation/Inbox layout",
  component: Inbox,
  parameters: { layout: "padded" },
  beforeEach: () => {
    const original = window.location.href;
    const url = new URL(original);
    url.searchParams.delete("message");
    window.history.replaceState(null, "", url);
    return () => window.history.replaceState(null, "", original);
  },
} satisfies Meta<typeof Inbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const EmptySelection: Story = {
  args: { initialThreadId: "" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Message unavailable" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Back to inbox" }));
    await expect(canvas.getByRole("searchbox", { name: "Search correspondence" })).toHaveFocus();
  },
};

export const ResizeFocus: Story = {
  args: { initialThreadId: "coast" },
  play: async ({ canvasElement }) => {
    const original = { width: innerWidth, height: innerHeight };
    const canvas = within(canvasElement);
    try {
      await page.viewport(1440, 900);
      await new Promise<void>((resolve) => {
        const observer = new ResizeObserver(() => {
          observer.disconnect();
          resolve();
        });
        observer.observe(canvasElement);
      });
      const search = canvas.getByRole("searchbox", { name: "Search correspondence" });
      search.focus();
      await expect(search).toHaveFocus();
      await page.viewport(390, 844);
      await waitFor(() =>
        expect(canvas.getByRole("heading", { name: "Notes from the coast" })).toHaveFocus(),
      );
      expect(canvas.queryByRole("searchbox", { name: "Search correspondence" })).toBeNull();
      expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth + 1);
    } finally {
      await page.viewport(original.width, original.height);
    }
  },
};

export const PaneGeometry: Story = {
  args: { initialThreadId: "translation" },
  play: async ({ canvasElement, userEvent }) => {
    const original = { width: innerWidth, height: innerHeight };
    const canvas = within(canvasElement);
    try {
      await userEvent.click(canvas.getByRole("button", { name: "Show sender details" }));
      for (const width of [320, 390, 768, 1440]) {
        await page.viewport(width, 900);
        await waitFor(() =>
          expect(canvas.getByRole("heading", { name: /Translation notes/ })).toBeVisible(),
        );
        expect(Boolean(canvas.queryByRole("searchbox", { name: "Search correspondence" }))).toBe(
          width >= 768,
        );
        expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth + 1);
        const letter = canvas
          .getByRole("region", { name: /Translation notes/ })
          .getBoundingClientRect();
        const sender = canvas
          .getByRole("complementary", { name: "Sender details" })
          .getBoundingClientRect();
        expect(sender.width).toBeGreaterThan(0);
        if (width <= 768) expect(sender.top).toBeGreaterThanOrEqual(letter.bottom);
      }
      if (matchMedia("(forced-colors: active)").matches) {
        const row = canvas.getByRole("button", { name: /Amina Okafor/ });
        expect(getComputedStyle(row).borderInlineStartStyle).toBe("solid");
        expect(
          Number.parseFloat(getComputedStyle(row).borderInlineStartWidth),
        ).toBeGreaterThanOrEqual(2);
        row.focus();
        await userEvent.keyboard("{Tab}");
        const active = document.activeElement;
        if (!(active instanceof HTMLElement)) throw new Error("Keyboard focus left the flow");
        expect(getComputedStyle(active).outlineStyle).toBe("solid");
        expect(Number.parseFloat(getComputedStyle(active).outlineWidth)).toBeGreaterThanOrEqual(2);
      }
    } finally {
      await page.viewport(original.width, original.height);
    }
  },
};
