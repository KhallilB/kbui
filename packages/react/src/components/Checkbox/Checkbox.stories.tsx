import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Checkbox, type CheckboxProps } from "./Checkbox";

function CheckboxExample({ checked: initial, indeterminate, ...props }: CheckboxProps) {
  const [checked, setChecked] = useState(initial);
  return (
    <Checkbox
      {...props}
      checked={checked}
      indeterminate={Boolean(indeterminate) && !checked}
      onCheckedChange={setChecked}
    />
  );
}
const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: {
    label: "Include selected records",
    checked: false,
    onCheckedChange: (_checked: boolean) => {},
  },
  render: (args) => <CheckboxExample {...args} />,
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
export const Disabled: Story = {
  args: { disabled: true, description: "Available after verification" },
};
export const Invalid: Story = {
  args: { description: "Confirm acknowledgement", error: "Acknowledgement required" },
};
export const TokenOverrides: Story = {
  args: {
    label: "I acknowledge the admission requirements",
  },
  render: (args) => (
    <CheckboxExample {...args} style={{ "--kb-checkbox-size": "2rem" } as CSSProperties} />
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("checkbox");
    const mark = canvasElement.querySelector(".kb-checkbox-mark");
    if (!(mark instanceof HTMLElement)) throw new Error("Missing checkbox mark");
    expect(input.getBoundingClientRect().width).toBe(32);
    expect(mark.getBoundingClientRect().width).toBe(32);
    expect(
      Math.abs(input.getBoundingClientRect().top - mark.getBoundingClientRect().top),
    ).toBeLessThan(1);
  },
};
