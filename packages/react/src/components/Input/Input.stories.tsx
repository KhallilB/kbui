import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Input, type InputProps } from "./Input";

function SearchExample(props: InputProps) {
  const [query, setQuery] = useState("");
  const control = useRef<HTMLInputElement>(null);
  return (
    <Input
      {...props}
      ref={control}
      type="search"
      value={query}
      onValueChange={setQuery}
      startAdornment={
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="8.5" cy="8.5" r="5.5" />
          <path d="m13 13 4 4" />
        </svg>
      }
      endAdornment={
        query && !props.disabled && !props.readOnly ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              control.current?.focus();
            }}
          >
            <span aria-hidden="true">×</span>
          </Button>
        ) : undefined
      }
    />
  );
}

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: { label: "Email", placeholder: "you@example.com" },
  argTypes: { size: { control: "select", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescription: Story = { args: { description: "We never share it." } };
export const WithError: Story = { args: { error: "Email is required." } };
export const Disabled: Story = { args: { disabled: true } };
export const HiddenLabel: Story = {
  args: { label: "Search", visuallyHidden: true, placeholder: "Search" },
};
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16, width: "100%" }}>
      <Input {...args} label="Small" size="sm" />
      <Input {...args} label="Medium" size="md" />
      <Input {...args} label="Large" size="lg" />
    </div>
  ),
};

export const WithAdornments: Story = {
  args: { label: "Search components", placeholder: "Find a component…" },
  render: (args) => <SearchExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("searchbox", { name: "Search components" });
    expect(canvas.queryByRole("button", { name: "Clear search" })).toBeNull();
    await userEvent.type(input, "panel");
    expect(input).toHaveValue("panel");
    expect(canvas.getByRole("searchbox", { name: "Search components" })).toBe(input);
    const clear = canvas.getByRole("button", { name: "Clear search" });
    expect(clear).toHaveAttribute("type", "button");
    await userEvent.click(clear);
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(canvas.queryByRole("button", { name: "Clear search" })).toBeNull();
  },
};
