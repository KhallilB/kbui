import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { ToggleButton } from "./ToggleButton";

const meta = {
  title: "Components/ToggleButton",
  component: ToggleButton,
  tags: ["autodocs"],
  args: { children: "Show grid" },
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Show grid", pressed: false });
    const indicator = button.querySelector(".kb-togglebutton-indicator");
    expect(indicator).not.toBeVisible();
    const { width, height } = button.getBoundingClientRect();
    expect(width).toBeGreaterThanOrEqual(24);
    expect(height).toBeGreaterThanOrEqual(24);

    await userEvent.tab();
    expect(button).toHaveFocus();
    expect(getComputedStyle(button).outlineStyle).toBe("solid");
    await userEvent.keyboard(" ");
    expect(button).toHaveFocus();
    expect(canvas.getByRole("button", { name: "Show grid", pressed: true })).toBe(button);
    expect(indicator).toBeVisible();
    expect(button.getBoundingClientRect().width).toBe(width);
    expect(button.getBoundingClientRect().height).toBe(height);

    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(indicator).not.toBeVisible();
  },
};

function PinActivity() {
  const [pinned, setPinned] = useState(true);
  return (
    <ToggleButton pressed={pinned} onPressedChange={setPinned}>
      Pin activity
    </ToggleButton>
  );
}

export const Controlled: Story = { render: () => <PinActivity /> };

export const Disabled: Story = {
  args: { children: "Snap to grid", disabled: true, defaultPressed: true },
};

export const ForcedColors: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    if (!matchMedia("(forced-colors: active)").matches) return;
    const button = within(canvasElement).getByRole("button", {
      name: "Show grid",
      pressed: false,
    });
    const off = getComputedStyle(button).backgroundColor;
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(button).toHaveFocus();
    expect(getComputedStyle(button).outlineStyle).toBe("solid");
    expect(getComputedStyle(button).backgroundColor).not.toBe(off);
    expect(button.querySelector(".kb-togglebutton-indicator")).toBeVisible();
  },
};
