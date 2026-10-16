import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
      <Button render={<a href="/docs" />} nativeButton={false}>
        Docs
      </Button>,
    );
    // Base UI sets role="button" on non-native elements.
    const link = screen.getByRole("button", { name: "Docs" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveClass("kb-button");
  });
});
