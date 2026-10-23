import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Button" },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg", "icon"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Danger: Story = { args: { variant: "danger" } };
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};
export const Disabled: Story = { args: { disabled: true } };
export const AsLink: Story = {
  // biome-ignore lint/a11y/useAnchorContent: Base UI render injects children
  args: { render: <a href="#docs" />, nativeButton: false, role: "link", children: "Link" },
};
export const IconOnly: Story = {
  args: {
    size: "icon",
    variant: "secondary",
    "aria-label": "Stop",
    children: (
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <rect x="4" y="4" width="8" height="8" rx="1" />
      </svg>
    ),
  },
};
