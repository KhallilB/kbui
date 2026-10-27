import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useRef } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Tooltip } from "./Tooltip";

function Stop() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="4" y="4" width="8" height="8" rx="1" />
    </svg>
  );
}

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  args: {
    content: "Stop worker",
    delay: 0,
    children: (
      <Button size="icon" variant="secondary" aria-label="Stop">
        <Stop />
      </Button>
    ),
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnHover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("button", { name: "Stop" }));
    const popup = await within(document.body).findByText("Stop worker");
    await waitFor(() => expect(popup).toBeVisible());
  },
};
export const OnHoverDark: Story = {
  tags: ["!dev", "!autodocs"],
  ...OnHover,
  globals: { theme: "dark" },
};

export const NestedTheme: Story = {
  tags: ["!dev", "!autodocs"],
  render: function NestedTheme(args) {
    const host = useRef<HTMLDivElement>(null);
    return (
      <div
        ref={host}
        style={
          {
            "--kb-popup-background": "#fff2df",
            "--kb-color-fg": "#261b22",
            "--kb-popup-border": "#261b22",
            "--kb-popup-motion-duration": "180ms",
          } as CSSProperties
        }
      >
        <Tooltip {...args} container={host} className="surface-hint" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("button", { name: "Stop" }));
    const hint = await within(canvasElement).findByText("Stop worker");
    await waitFor(() => expect(hint).toBeVisible());
    await expect(getComputedStyle(hint).backgroundColor).toBe("rgb(255, 242, 223)");
    await expect(getComputedStyle(hint).transitionDuration).toBe(
      matchMedia("(prefers-reduced-motion: reduce)").matches ? "0s" : "0.18s",
    );
  },
};
