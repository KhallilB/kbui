import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Select, type SelectProps } from "./Select";

function SelectExample({ value: initial, ...props }: SelectProps) {
  const [value, setValue] = useState<string | null>(initial);
  return <Select {...props} value={value} onValueChange={setValue} />;
}
const meta = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  args: {
    label: "View",
    value: null,
    options: [
      { value: "recent", label: "Recent" },
      { value: "all", label: "All records" },
      { value: "locked", label: "Unavailable", disabled: true },
    ],
    onValueChange: (_value: string | null) => {},
  },
  render: (args) => <SelectExample {...args} />,
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "View" });
    expect(getComputedStyle(trigger).backgroundImage).not.toBe("none");
    expect(getComputedStyle(trigger).boxShadow).toContain("inset");
    await userEvent.click(trigger);
    const list = await within(document.body).findByRole("listbox", { name: "View" });
    await waitFor(() => expect(list).toBeVisible());
    expect(document.body.style.overflowY).not.toBe("hidden");
    await userEvent.click(within(list).getByRole("option", { name: "All records" }));
    await expect(trigger).toHaveTextContent("All records");
    await waitFor(() => expect(within(document.body).queryByRole("listbox")).toBeNull());
    await waitFor(() => expect(getComputedStyle(trigger).outlineStyle).toBe("none"));
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const keyboardList = await within(document.body).findByRole("listbox", { name: "View" });
    await waitFor(() => expect(keyboardList.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(getComputedStyle(trigger).outlineStyle).toBe("solid");
    expect(getComputedStyle(trigger).outlineOffset).toBe("-2px");
    await userEvent.click(trigger);
    const mixedList = await within(document.body).findByRole("listbox", { name: "View" });
    await waitFor(() => expect(mixedList.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard("{Home}{Enter}");
    await waitFor(() => expect(within(document.body).queryByRole("listbox")).toBeNull());
    expect(trigger).toHaveTextContent("Recent");
    expect(trigger).toHaveFocus();
    expect(getComputedStyle(trigger).outlineStyle).toBe("solid");
    expect(getComputedStyle(trigger).outlineOffset).toBe("-2px");
  },
};
export const Invalid: Story = {
  args: { description: "Choose a view", error: "Select a valid view" },
};
export const Empty: Story = {
  args: { options: [] },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox");
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAccessibleDescription("No options available");
  },
};
export const Disabled: Story = {
  args: { disabled: true, description: "Available after verification" },
};
export const ReadOnly: Story = { args: { value: "recent", readOnly: true } };
export const TokenOverrides: Story = {
  render: (args) => (
    <SelectExample
      {...args}
      style={{ "--kb-input-radius": "0px", "--kb-input-height-md": "3rem" } as CSSProperties}
    />
  ),
};
