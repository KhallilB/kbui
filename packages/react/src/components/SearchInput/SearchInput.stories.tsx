import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { SearchInput, type SearchInputProps } from "./SearchInput";

function SearchExample({ value: initial, ...props }: SearchInputProps) {
  const [query, setQuery] = useState(initial);
  return <SearchInput {...props} value={query} onValueChange={setQuery} />;
}

const meta = {
  title: "Components/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  args: { label: "Search components", value: "", onValueChange: (_value: string) => {} },
  render: (args) => <SearchExample {...args} />,
} satisfies Meta<typeof SearchInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("searchbox", { name: "Search components" });
    await userEvent.type(input, "panel");
    expect(input).toHaveValue("panel");
    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
  },
};
export const WithQuery: Story = { args: { value: "panel" } };
export const WithDescription: Story = {
  args: { description: "Search by component name or category." },
};
export const WithError: Story = { args: { value: "?", error: "Use at least two letters." } };
export const Disabled: Story = { args: { value: "panel", disabled: true } };
export const ReadOnly: Story = { args: { value: "panel", readOnly: true } };
export const HiddenLabel: Story = {
  args: { visuallyHidden: true, placeholder: "Find a component…" },
};
export const LongLabel: Story = {
  args: {
    label: "Search your workspace components, descriptions and shared categories",
    value: "A longer search query to check narrow layouts",
  },
};
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16, width: "100%" }}>
      <SearchExample {...args} label="Small search" value="panel" size="sm" />
      <SearchExample {...args} label="Medium search" value="panel" />
      <SearchExample {...args} label="Large search" value="panel" size="lg" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const input of within(canvasElement).getAllByRole("searchbox")) {
      const root = input.closest(".kb-searchinput");
      if (!(root instanceof HTMLElement)) throw new Error("Missing search field");
      const button = within(root).getByRole("button", { name: "Clear search" });
      const field = input.getBoundingClientRect();
      const action = button.getBoundingClientRect();
      expect(action.top).toBeGreaterThanOrEqual(field.top);
      expect(action.bottom).toBeLessThanOrEqual(field.bottom);
      expect(action.left).toBeGreaterThanOrEqual(field.left);
      expect(action.right).toBeLessThanOrEqual(field.right);
    }
  },
};
