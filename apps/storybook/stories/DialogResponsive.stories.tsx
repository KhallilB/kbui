import { Button, Dialog } from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, waitFor, within } from "storybook/test";
import { page } from "vitest/browser";

const meta = {
  title: "Validation/Dialog responsive layout",
  component: Dialog,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResizeOpenDrawer: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger render={<Button />}>Edit project</Dialog.Trigger>
      <Dialog.Content layout="drawer" title="Edit project">
        <Dialog.Body>
          <label>
            Project name
            <input defaultValue="Field notes" />
          </label>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close render={<Button />}>Done</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const original = { width: innerWidth, height: innerHeight };
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Edit project" });
    try {
      await page.viewport(551, 760);
      await userEvent.click(trigger);
      const dialog = await body.findByRole("dialog", { name: "Edit project" });
      const input = within(dialog).getByRole("textbox", { name: "Project name" });
      await userEvent.type(input, " revised");
      await waitFor(() => {
        expect(dialog.getBoundingClientRect().top).toBeCloseTo(0);
        expect(dialog.getBoundingClientRect().right).toBeCloseTo(551);
      });

      for (const width of [550, 390]) {
        await page.viewport(width, 760);
        await waitFor(() => {
          const bounds = dialog.getBoundingClientRect();
          expect(bounds.top).toBeGreaterThan(380);
          expect(bounds.left).toBeCloseTo(0);
          expect(bounds.right).toBeCloseTo(width);
          expect(bounds.bottom).toBeCloseTo(760);
        });
        expect(input).toHaveFocus();
        expect(input).toHaveValue("Field notes revised");
      }

      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
      await waitFor(() => expect(trigger).toHaveFocus());
    } finally {
      await page.viewport(original.width, original.height);
    }
  },
};

const cutoutInsets = {
  "--_kb-dialog-safe-area-left": "34px",
  "--_kb-dialog-safe-area-right": "52px",
} as CSSProperties;

export const SafeAreaWithoutSections: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger render={<Button />}>Open drawer</Dialog.Trigger>
      <Dialog.Content layout="drawer" title="Review changes" style={cutoutInsets}>
        <div data-testid="plain-content">Review the project details.</div>
        <Dialog.Body>Changes are saved automatically.</Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close render={<Button />}>Done</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const original = { width: innerWidth, height: innerHeight };
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    try {
      await page.viewport(390, 760);
      await userEvent.click(canvas.getByRole("button", { name: "Open drawer" }));
      const popup = await body.findByRole("dialog", { name: "Review changes" });
      const plainContent = within(popup).getByTestId("plain-content");

      for (const direction of ["ltr", "rtl"]) {
        popup.setAttribute("dir", direction);
        const bounds = popup.getBoundingClientRect();
        const style = getComputedStyle(popup);
        const innerLeft = bounds.left + Number.parseFloat(style.borderLeftWidth);
        const innerRight = bounds.right - Number.parseFloat(style.borderRightWidth);
        expect(plainContent.getBoundingClientRect().left).toBeCloseTo(innerLeft + 34);
        expect(plainContent.getBoundingClientRect().right).toBeCloseTo(innerRight - 52);

        const sections = popup.querySelectorAll<HTMLElement>(
          ":scope > :is(.kb-dialog-header, .kb-dialog-body, .kb-dialog-footer)",
        );
        expect(sections).toHaveLength(3);
        for (const section of sections) {
          const sectionBounds = section.getBoundingClientRect();
          expect(sectionBounds.left).toBeCloseTo(innerLeft);
          expect(sectionBounds.right).toBeCloseTo(innerRight);
          expect(getComputedStyle(section).paddingLeft).toBe("34px");
          expect(getComputedStyle(section).paddingRight).toBe("52px");
        }
      }

      await userEvent.click(within(popup).getByRole("button", { name: "Done" }));
      await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    } finally {
      await page.viewport(original.width, original.height);
    }
  },
};
