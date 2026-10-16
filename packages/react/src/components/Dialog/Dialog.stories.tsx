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
        <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
        <Dialog.Close render={<Button variant="danger" />}>Delete</Dialog.Close>
      </Dialog.Content>
    </Dialog>
  ),
};

export const Open: Story = {
  render: () => (
    <Dialog defaultOpen>
      <Dialog.Content title="Already open" description="Rendered open for docs.">
        <Dialog.Close render={<Button />}>Close</Dialog.Close>
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
        <Dialog.Close render={<Button />}>Done</Dialog.Close>
      </Dialog.Content>
    </Dialog>
  ),
};
