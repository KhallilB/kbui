import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, within } from "storybook/test";
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

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    if (window.matchMedia("(forced-colors: active)").matches) return;
    const button = within(canvasElement).getByRole("button", { name: "Button" });
    const accent = document.createElement("span");
    accent.style.color = "var(--kb-color-accent)";
    button.append(accent);
    try {
      expect(getComputedStyle(button).backgroundColor).toBe(getComputedStyle(accent).color);
    } finally {
      accent.remove();
    }
    expect(getComputedStyle(button).boxShadow).not.toBe("none");
  },
};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Danger: Story = { args: { variant: "danger" } };
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
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

export const MotionTokens: Story = {
  args: { variant: "secondary" },
  render: (args) => (
    <div style={{ "--kb-button-motion-duration": "300ms" } as CSSProperties}>
      <Button {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    const button = within(canvasElement).getByRole("button", { name: "Button" });
    expect(getComputedStyle(button).transitionDuration).toBe("0.3s, 0.3s, 0.3s, 0.3s");
  },
};
