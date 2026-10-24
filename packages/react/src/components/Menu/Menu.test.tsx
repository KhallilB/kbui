import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { Menu } from "./Menu";

describe("Menu", () => {
  test("opens from its trigger and runs an item", async () => {
    const onCopy = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Menu onOpenChange={onOpenChange}>
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
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.any(Object));
    expect(menu).toHaveClass("kb-menu");
    const items = screen.getAllByRole("menuitem");
    expect(items.map((i) => i.textContent)).toEqual(["Copy output", "Stop"]);
    expect(items[0]).toHaveClass("kb-menu-item");
    expect(menu.querySelector(".kb-menu-separator")).not.toBeNull();
    await userEvent.click(items[0] as HTMLElement);
    expect(onCopy).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.any(Object));
  });
  test("keeps popup in caller's theme host", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    render(
      <Menu>
        <Menu.Trigger>Theme actions</Menu.Trigger>
        <Menu.Content container={host}>
          <Menu.Item>Copy</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Theme actions" }));
    expect(host).toContainElement(await screen.findByRole("menu"));
    host.remove();
  });
});
