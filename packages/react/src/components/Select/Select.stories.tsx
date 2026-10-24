import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Select } from "./Select";

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
    onValueChange: () => {},
  },
  render: function Example(args) {
    const [value, setValue] = useState<string | null>(args.value);
    return <Select {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox"));
    await userEvent.click(
      await within(document.body).findByRole("option", { name: "All records" }),
    );
    await expect(within(canvasElement).getByRole("combobox")).toHaveTextContent("All records");
  },
};
export const Dark: Story = { globals: { theme: "dark" } };
export const Invalid: Story = {
  args: { description: "Choose a view", error: "Select a valid view" },
};
export const Empty: Story = {
  args: { options: [] },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox"));
    const list = await within(document.body).findByRole("listbox");
    await waitFor(() => expect(list).toBeVisible());
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const Editorial: Story = {
  args: {
    style: {
      fontFamily: "Georgia, serif",
      "--kb-input-radius": "0px",
      "--kb-input-height-md": "3rem",
    } as CSSProperties,
  },
};
