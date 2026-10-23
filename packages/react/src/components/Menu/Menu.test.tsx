import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { Menu } from "./Menu";

describe("Menu", () => {
  test("opens from its trigger and runs an item", async () => {
    const onCopy = vi.fn();
    render(
      <Menu>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item onClick={onCopy}>Copy output</Menu.Item>
          <Menu.Separator />
          <Menu.Item>Stop</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    const menu = await screen.findByRole("menu");
    expect(menu).toHaveClass("kb-menu");
    const items = screen.getAllByRole("menuitem");
    expect(items.map((i) => i.textContent)).toEqual(["Copy output", "Stop"]);
    expect(items[0]).toHaveClass("kb-menu-item");
    expect(menu.querySelector(".kb-menu-separator")).not.toBeNull();
    await userEvent.click(items[0] as HTMLElement);
    expect(onCopy).toHaveBeenCalledOnce();
  });
});
