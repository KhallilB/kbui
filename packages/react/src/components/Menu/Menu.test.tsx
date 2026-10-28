import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { Menu } from "./Menu";

describe("Menu", () => {
  test("opens from its trigger, forwards refs and runs an item", async () => {
    const onCopy = vi.fn();
    const onOpenChange = vi.fn();
    const contentRef = createRef<HTMLDivElement>();
    const itemRef = createRef<HTMLDivElement>();
    const separatorRef = createRef<HTMLDivElement>();
    render(
      <Menu onOpenChange={onOpenChange}>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content ref={contentRef}>
          <Menu.Item ref={itemRef} onClick={onCopy}>
            Copy output
          </Menu.Item>
          <Menu.Separator ref={separatorRef} className="custom-separator" />
          <Menu.Item>Stop</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    const menu = await screen.findByRole("menu");
    expect(contentRef.current).toBe(menu);
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.any(Object));
    expect(menu).toHaveClass("kb-menu");
    const items = screen.getAllByRole("menuitem");
    expect(itemRef.current).toBe(items[0]);
    expect(items.map((i) => i.textContent)).toEqual(["Copy output", "Stop"]);
    expect(items[0]).toHaveClass("kb-menu-item");
    const separator = menu.querySelector(".kb-menu-separator");
    expect(separator).not.toBeNull();
    expect(separatorRef.current).toBe(separator);
    expect(separator).toHaveClass("custom-separator");
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
