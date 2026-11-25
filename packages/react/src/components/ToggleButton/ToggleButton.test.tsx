import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { ToggleButton } from "./ToggleButton";

describe("ToggleButton", () => {
  test("toggles with Space and Enter while retaining its name, focus and form safety", async () => {
    const pressedChange = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    const ref = createRef<HTMLButtonElement>();
    render(
      <form onSubmit={submit}>
        <ToggleButton ref={ref} className="custom-toggle" onPressedChange={pressedChange}>
          Show grid
        </ToggleButton>
      </form>,
    );

    const toggle = screen.getByRole("button", { name: "Show grid", pressed: false });
    expect(toggle).toHaveClass("kb-togglebutton", "custom-toggle");
    expect(ref.current).toBe(toggle);

    const user = userEvent.setup();
    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "Show grid", pressed: true })).toBe(toggle);
    expect(toggle).toHaveFocus();
    expect(pressedChange).toHaveBeenLastCalledWith(true, expect.anything());

    await user.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(pressedChange).toHaveBeenLastCalledWith(false, expect.anything());
    expect(submit).not.toHaveBeenCalled();
  });

  test("exposes its control size, defaulting to md", () => {
    render(
      <>
        <ToggleButton>Default</ToggleButton>
        <ToggleButton size="sm">Small</ToggleButton>
        <ToggleButton size="lg">Large</ToggleButton>
      </>,
    );
    expect(screen.getByRole("button", { name: "Default" })).toHaveAttribute("data-size", "md");
    expect(screen.getByRole("button", { name: "Small" })).toHaveAttribute("data-size", "sm");
    expect(screen.getByRole("button", { name: "Large" })).toHaveAttribute("data-size", "lg");
  });

  test("leaves controlled pressed state to the parent", async () => {
    const pressedChange = vi.fn();
    const { rerender } = render(
      <ToggleButton pressed={false} onPressedChange={pressedChange}>
        Pin activity
      </ToggleButton>,
    );
    const toggle = screen.getByRole("button", { name: "Pin activity", pressed: false });
    await userEvent.click(toggle);

    expect(pressedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    rerender(
      <ToggleButton pressed onPressedChange={pressedChange}>
        Pin activity
      </ToggleButton>,
    );
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  test("keeps a disabled toggle pressed and ignores activation", async () => {
    const pressedChange = vi.fn();
    render(
      <ToggleButton defaultPressed disabled onPressedChange={pressedChange}>
        Snap to grid
      </ToggleButton>,
    );

    const toggle = screen.getByRole("button", { name: "Snap to grid", pressed: true });
    expect(toggle).toBeDisabled();
    await userEvent.click(toggle);
    expect(pressedChange).not.toHaveBeenCalled();
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  test("keeps native activation, its label and its indicator when given a replacement element", async () => {
    const submit = vi.fn((event) => event.preventDefault());
    const replacement = (
      <button type="submit" aria-pressed={false}>
        Replacement
      </button>
    );
    render(
      <form onSubmit={submit}>
        {/* @ts-expect-error ToggleButton owns its native element. */}
        <ToggleButton defaultPressed render={replacement} nativeButton={false} role="link">
          Show grid
        </ToggleButton>
      </form>,
    );

    const toggle = screen.getByRole("button", { name: "Show grid", pressed: true });
    expect(toggle).toHaveAttribute("type", "button");
    expect(toggle.querySelector(".kb-togglebutton-indicator")).not.toBeNull();
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(submit).not.toHaveBeenCalled();
  });

  test("takes the announced pressed state from the component when given a raw ARIA attribute", () => {
    render(
      // @ts-expect-error The pressed state comes from the pressed or defaultPressed prop.
      <ToggleButton aria-pressed={false} defaultPressed>
        Show grid
      </ToggleButton>,
    );

    expect(screen.getByRole("button", { name: "Show grid", pressed: true })).toBeInTheDocument();
  });
});
