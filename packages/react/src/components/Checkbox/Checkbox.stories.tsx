import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: { label: "Include selected records", checked: false, onCheckedChange: () => {} },
  render: function Example(args) {
    const [checked, setChecked] = useState(args.checked);
    return (
      <Checkbox
        {...args}
        checked={checked}
        indeterminate={Boolean(args.indeterminate) && !checked}
        onCheckedChange={setChecked}
      />
    );
  },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("checkbox");
    await userEvent.click(box);
    await expect(box).toBeChecked();
  },
};
export const Mixed: Story = {
  args: { indeterminate: true },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("checkbox");
    await expect(box).toBePartiallyChecked();
    box.focus();
    await userEvent.keyboard(" ");
    await expect(box).toBeChecked();
  },
};
export const Dark: Story = { globals: { theme: "dark" } };
export const Disabled: Story = {
  args: { disabled: true, description: "Available after verification" },
};
export const Invalid: Story = {
  args: { description: "Confirm acknowledgement", error: "Acknowledgement required" },
};
export const Editorial: Story = {
  args: {
    style: { "--kb-checkbox-size": "1.5rem" } as CSSProperties,
    label: "I acknowledge the admission requirements",
  },
};
