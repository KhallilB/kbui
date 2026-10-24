import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useRef } from "react";
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
  },
};
export const DefaultDark: Story = { ...Default, globals: { theme: "dark" } };

export const NestedTheme: Story = {
  render: function NestedTheme() {
    const host = useRef<HTMLDivElement>(null);
    return (
      <div
        ref={host}
        style={
          {
            "--kb-popup-background": "#152b2b",
            "--kb-color-fg": "#e5eeeb",
            "--kb-popup-border": "#bdcdc8",
            "--kb-color-surface": "#203a38",
            "--kb-color-muted": "#bdcdc8",
            "--kb-popup-motion-duration": "140ms",
          } as CSSProperties
        }
      >
        <Menu>
          <Menu.Trigger render={<Button />}>Workspace actions</Menu.Trigger>
          <Menu.Content container={host}>
            <Menu.Item>Inspect assignment</Menu.Item>
            <Menu.Item disabled>Unavailable action</Menu.Item>
          </Menu.Content>
        </Menu>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Workspace actions" }));
    const menu = await within(canvasElement).findByRole("menu");
    await waitFor(() => expect(menu).toBeVisible());
    await expect(getComputedStyle(menu).backgroundColor).toBe("rgb(21, 43, 43)");
    await expect(getComputedStyle(menu).transitionDuration).toBe(
      matchMedia("(prefers-reduced-motion: reduce)").matches ? "0s" : "0.14s",
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        within(canvasElement).getByRole("button", { name: "Workspace actions" }),
      ).toHaveFocus(),
    );
  },
};
