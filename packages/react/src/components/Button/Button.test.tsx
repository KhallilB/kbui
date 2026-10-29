import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  test("renders a button with default variant and size", () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toHaveClass("kb-button");
    expect(btn).toHaveAttribute("data-variant", "primary");
    expect(btn).toHaveAttribute("data-size", "md");
  });

  test("applies variant, size and extra className", () => {
    render(
      <Button variant="ghost" size="sm" className="extra">
        X
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-variant", "ghost");
    expect(btn).toHaveAttribute("data-size", "sm");
    expect(btn).toHaveClass("kb-button", "extra");
  });

  test("typed variant and size win over raw data attributes", () => {
    const raw = { "data-variant": "primary", "data-size": "sm" } as object;
    render(
      <Button variant="ghost" size="lg" {...raw}>
        x
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-variant", "ghost");
    expect(btn).toHaveAttribute("data-size", "lg");
  });

  test("forwards ref to the button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>x</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  test("fires onClick and passes native attributes", async () => {
    const onClick = vi.fn();
    render(
      <Button type="submit" onClick={onClick}>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  test("disabled sets data-disabled and blocks clicks", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        No
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-disabled");
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("render prop swaps the element", () => {
    render(
      <Button render={<a href="/docs" />} nativeButton={false} role="link">
        Docs
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveClass("kb-button");
  });

  test("icon size renders a square button named by aria-label", () => {
    render(
      <Button size="icon" aria-label="Stop">
        <svg aria-hidden="true" />
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Stop" })).toHaveAttribute("data-size", "icon");
  });

  test("icon size requires aria-label at the type level", () => {
    // @ts-expect-error icon-only buttons need an accessible name
    const el = <Button size="icon">x</Button>;
    expect(el).toBeTruthy();
  });
});
