import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { FilterChip } from "./FilterChip";

describe("FilterChip", () => {
  test("keeps pressed semantics on the selection button when a caller supplies a raw attribute", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      // @ts-expect-error FilterChip owns aria-pressed through selected.
      <FilterChip
        ref={ref}
        label="Available now"
        selected
        onSelectedChange={vi.fn()}
        aria-pressed="false"
      />,
    );

    expect(ref.current).not.toHaveAttribute("aria-pressed");
    expect(screen.getByRole("button", { name: "Available now", pressed: true })).toBeVisible();
  });

  test("requests selection changes and exposes the controlled state under a stable name", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    const { rerender } = render(
      <FilterChip label="Available now" selected={false} onSelectedChange={onSelectedChange} />,
    );
    const toggle = screen.getByRole("button", { name: "Available now", pressed: false });

    await user.tab();
    expect(toggle).toHaveFocus();
    await user.keyboard(" ");
    expect(onSelectedChange).toHaveBeenCalledExactlyOnceWith(true);
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    rerender(<FilterChip label="Available now" selected onSelectedChange={onSelectedChange} />);
    expect(screen.getByRole("button", { name: "Available now", pressed: true })).toBe(toggle);
    expect(toggle).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSelectedChange).toHaveBeenLastCalledWith(false);
  });

  test("labels removal, forwards the root ref and keeps a remove-only label out of the Tab order", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const ref = createRef<HTMLSpanElement>();
    render(
      <FilterChip label="My team" onRemove={onRemove} ref={ref} id="team" className="custom" />,
    );
    const remove = screen.getByRole("button", { name: "Remove My team" });

    expect(ref.current).toHaveAttribute("id", "team");
    expect(ref.current).toHaveClass("kb-filterchip", "custom");
    expect(ref.current).toContainElement(remove);
    expect(screen.getByText("My team").tagName).toBe("SPAN");
    await user.tab();
    expect(remove).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  test("keeps select and remove independent and never submits their surrounding form", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    const onRemove = vi.fn();
    const onSubmit = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <FilterChip
          label="Expédiés"
          selected
          onSelectedChange={onSelectedChange}
          onRemove={onRemove}
          removeLabel="Retirer Expédiés"
        />
      </form>,
    );
    const toggle = screen.getByRole("button", { name: "Expédiés", pressed: true });
    const remove = screen.getByRole("button", { name: "Retirer Expédiés" });
    expect(toggle).not.toContainElement(remove);
    expect(remove).not.toHaveAttribute("aria-pressed");

    await user.click(remove);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onSelectedChange).not.toHaveBeenCalled();
    await user.click(toggle);
    expect(onSelectedChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("disables both actions and skips them in the Tab order", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    const onRemove = vi.fn();
    render(
      <>
        <FilterChip
          label="Restricted"
          selected
          onSelectedChange={onSelectedChange}
          onRemove={onRemove}
          disabled
        />
        <button type="button">Next control</button>
      </>,
    );
    const toggle = screen.getByRole("button", { name: "Restricted", pressed: true });
    const remove = screen.getByRole("button", { name: "Remove Restricted" });

    expect(toggle).toBeDisabled();
    expect(remove).toBeDisabled();
    await user.tab();
    expect(screen.getByRole("button", { name: "Next control" })).toHaveFocus();
    await user.click(toggle);
    await user.click(remove);
    expect(onSelectedChange).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
  });
});
