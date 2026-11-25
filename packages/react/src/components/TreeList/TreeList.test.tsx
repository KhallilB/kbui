import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { TreeList, type TreeListItem } from "./TreeList";

const items: readonly TreeListItem[] = [
  {
    id: "guide",
    label: "Guide",
    children: [
      {
        id: "editing",
        label: "Editing",
        children: [{ id: "drafts", label: <a href="#drafts">Drafts</a> }],
      },
    ],
  },
  { id: "help", label: "Help", children: [{ id: "faq", label: "FAQ" }] },
];

describe("TreeList", () => {
  it("renders a named list and keeps closed branches out of the keyboard path", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLUListElement>();
    render(<TreeList aria-label="Topics" id="topics" ref={ref} items={items} />);
    const list = screen.getByRole("list", { name: "Topics" });
    const guide = within(list).getByRole("button", { name: "Guide" });
    const help = within(list).getByRole("button", { name: "Help" });
    const branch = document.getElementById(guide.getAttribute("aria-controls") ?? "");

    expect(ref.current).toBe(list);
    expect(list).toHaveAttribute("id", "topics");
    expect(guide).toHaveAttribute("type", "button");
    expect(guide).toHaveAttribute("aria-expanded", "false");
    expect(branch).toHaveAttribute("hidden");
    expect(screen.queryByRole("button", { name: "Editing" })).toBeNull();

    await user.tab();
    expect(guide).toHaveFocus();
    await user.tab();
    expect(help).toHaveFocus();
    await user.tab({ shift: true });
    await user.keyboard("{Enter}");
    expect(guide).toHaveFocus();
    expect(guide).toHaveAttribute("aria-expanded", "true");
    expect(branch).not.toHaveAttribute("hidden");

    await user.tab();
    const editing = screen.getByRole("button", { name: "Editing" });
    expect(editing).toHaveFocus();
    await user.keyboard(" ");
    expect(editing).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Drafts" })).toHaveFocus();
  });

  it("keeps descendant expansion when an ancestor closes and opens again", async () => {
    const user = userEvent.setup();
    render(<TreeList items={items} defaultExpandedIds={["guide", "editing"]} />);
    const guide = screen.getByRole("button", { name: "Guide" });
    expect(screen.getByRole("link", { name: "Drafts" })).toBeVisible();
    await user.click(guide);
    expect(screen.queryByRole("link", { name: "Drafts" })).toBeNull();
    await user.click(guide);
    expect(screen.getByRole("link", { name: "Drafts" })).toBeVisible();
  });

  it("restores focus after a pointer collapse that would hide the focused leaf", () => {
    render(<TreeList items={items} defaultExpandedIds={["guide", "editing", "help"]} />);
    const guide = screen.getByRole("button", { name: "Guide" });
    const help = screen.getByRole("button", { name: "Help" });
    const drafts = screen.getByRole("link", { name: "Drafts" });
    drafts.focus();

    fireEvent.pointerDown(guide, { button: 0 });
    drafts.blur();
    fireEvent.click(guide, { detail: 1 });

    expect(guide).toHaveAttribute("aria-expanded", "false");
    expect(guide).toHaveFocus();

    fireEvent.pointerDown(help, { button: 0 });
    fireEvent.click(help, { detail: 1 });

    expect(help).toHaveAttribute("aria-expanded", "false");
    expect(guide).toHaveFocus();
  });

  it("requests updates to controlled expansion without changing the supplied state", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const expandedIds = Object.freeze(["help"]);
    const { rerender } = render(
      <TreeList items={items} expandedIds={expandedIds} onExpandedChange={handleChange} />,
    );
    const guide = screen.getByRole("button", { name: "Guide" });

    await user.click(guide);
    expect(handleChange).toHaveBeenLastCalledWith(["help", "guide"]);
    expect(guide).toHaveAttribute("aria-expanded", "false");
    rerender(
      <TreeList items={items} expandedIds={["help", "guide"]} onExpandedChange={handleChange} />,
    );
    expect(screen.getByRole("button", { name: "Editing" })).toBeVisible();
    await user.click(guide);
    expect(handleChange).toHaveBeenLastCalledWith(["help"]);
  });

  it("caps indentation without removing nested list structure or deep actions", () => {
    render(<TreeList items={items} maxVisualDepth={1} defaultExpandedIds={["guide", "editing"]} />);
    const guide = screen.getByRole("button", { name: "Guide" });
    const editing = screen.getByRole("button", { name: "Editing" });
    const firstBranch = document.getElementById(guide.getAttribute("aria-controls") ?? "");
    const cappedBranch = document.getElementById(editing.getAttribute("aria-controls") ?? "");

    expect(firstBranch).not.toHaveAttribute("data-capped");
    expect(cappedBranch).toHaveAttribute("data-capped");
    expect(cappedBranch?.parentElement?.parentElement).toBe(firstBranch);
    expect(within(cappedBranch as HTMLElement).getByRole("link", { name: "Drafts" })).toBeVisible();
  });

  it("creates unique disclosure relationships across separate trees with the same item IDs", () => {
    render(
      <>
        <TreeList items={items} aria-label="First" />
        <TreeList items={items} aria-label="Second" />
      </>,
    );
    const first = screen.getByRole("list", { name: "First" });
    const second = screen.getByRole("list", { name: "Second" });
    const firstControls = within(first).getByRole("button", { name: "Guide" });
    const secondControls = within(second).getByRole("button", { name: "Guide" });
    expect(firstControls.getAttribute("aria-controls")).not.toBe(
      secondControls.getAttribute("aria-controls"),
    );
    expect(first).toContainElement(
      document.getElementById(firstControls.getAttribute("aria-controls") ?? ""),
    );
    expect(second).toContainElement(
      document.getElementById(secondControls.getAttribute("aria-controls") ?? ""),
    );
  });
});
