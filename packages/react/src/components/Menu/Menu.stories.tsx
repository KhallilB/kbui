import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Menu } from "./Menu";

const meta = {
  title: "Components/Menu",
  component: Menu,
  tags: ["autodocs"],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Menu>
      <Menu.Trigger render={<Button variant="secondary" size="sm" />}>Actions</Menu.Trigger>
      <Menu.Content>
        <Menu.Item>Copy output</Menu.Item>
        <Menu.Item>Open log</Menu.Item>
        <Menu.Separator />
        <Menu.Item disabled>Stop</Menu.Item>
      </Menu.Content>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Actions" }));
    const menu = await within(document.body).findByRole("menu");
    await waitFor(() => expect(menu).toBeVisible());
    if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
      expect(getComputedStyle(menu).transitionDuration).toBe("0.08s");
    }
  },
};
export const DefaultDark: Story = { ...Default, globals: { theme: "dark" } };

export const MotionTokens: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const root = document.documentElement;
    root.style.setProperty("--kb-popup-motion-duration", "300ms");
    try {
      await userEvent.click(within(canvasElement).getByRole("button", { name: "Actions" }));
      const menu = await within(document.body).findByRole("menu");
      await waitFor(() => expect(menu).toBeVisible());
      if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
        expect(getComputedStyle(menu).transitionDuration).toBe("0.3s");
      }
    } finally {
      root.style.removeProperty("--kb-popup-motion-duration");
    }
  },
};
