import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { Dialog } from "./Dialog";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirm: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger render={<Button variant="danger" />}>Delete project</Dialog.Trigger>
      <Dialog.Content title="Delete project" description="This cannot be undone.">
        <Dialog.Actions>
          <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
          <Dialog.Close render={<Button variant="danger" />}>Delete</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  ),
};

export const Open: Story = {
  render: () => (
    <Dialog defaultOpen>
      <Dialog.Content title="Already open" description="Rendered open for docs.">
        <Dialog.Actions>
          <Dialog.Close render={<Button />}>Close</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  ),
};

export const CustomLayout: Story = {
  render: () => (
    <Dialog defaultOpen>
      <Dialog.Content>
        <Dialog.Title>Custom title</Dialog.Title>
        <Dialog.Description>Composed parts instead of props.</Dialog.Description>
        <Dialog.Actions>
          <Dialog.Close render={<Button />}>Done</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  ),
};

export const ExtensibleSurface: Story = {
  render: () => (
    <Dialog defaultOpen>
      <Dialog.Content
        title="Review selection"
        description="Surface tokens preserve behavior."
        style={
          {
            "--kb-dialog-background": "rgb(255, 242, 223)",
            "--kb-dialog-color": "rgb(38, 27, 34)",
            "--kb-dialog-description-color": "rgb(80, 60, 64)",
            "--kb-dialog-shadow": "8px 8px 0 rgb(38 27 34 / .3)",
            "--kb-dialog-motion-duration": "210ms",
          } as import("react").CSSProperties
        }
      >
        <Dialog.Actions>
          <Dialog.Close render={<Button />}>Return</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  ),
  play: async () => {
    const { expect, within } = await import("storybook/test");
    const popup = within(document.body).getByRole("dialog");
    await expect(getComputedStyle(popup).backgroundColor).toBe("rgb(255, 242, 223)");
    await expect(getComputedStyle(popup).boxShadow).not.toBe("none");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    await expect(getComputedStyle(popup).transitionDuration).toBe(reduced ? "0s" : "0.21s, 0.21s");
  },
};
