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

  test("loading keeps the name and focus while blocking clicks, keys and form submission", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onSubmit = vi.fn((event) => event.preventDefault());
    const form = (loading: boolean) => (
      <form onSubmit={onSubmit}>
        <Button type="submit" onClick={onClick} loading={loading}>
          Save changes
        </Button>
      </form>
    );
    const { rerender } = render(form(false));
    const button = screen.getByRole("button", { name: "Save changes" });
    await user.tab();
    expect(button).toHaveFocus();

    rerender(form(true));
    expect(screen.getByRole("button", { name: "Save changes" })).toBe(button);
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button.querySelector(".kb-spinner")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await user.click(button);
    await user.keyboard("{Enter} ");
    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();

    rerender(form(false));
    expect(button).toHaveFocus();
    expect(button).not.toHaveAttribute("aria-busy");
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  test("loading preserves explicit native disabled behavior", () => {
    render(
      <Button loading disabled>
        Save
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
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

  test("a render callback can provide a fallback label when idle", () => {
    render(
      <Button
        render={(props) => (
          <button type="button" {...props}>
            {props.children ?? "Fallback"}
          </button>
        )}
      />,
    );
    expect(screen.getByRole("button", { name: "Fallback" })).toBeInTheDocument();
  });

  test("loading preserves a render element's name and ref while blocking its action", async () => {
    const onClick = vi.fn();
    const linkRef = createRef<HTMLAnchorElement>();
    render(
      <Button
        loading
        nativeButton={false}
        role="link"
        render={
          <a aria-busy={false} href="/docs" ref={linkRef} onClick={onClick}>
            Docs
          </a>
        }
      />,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(linkRef.current).toBe(link);
    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link.querySelector(".kb-button-spinner")).toBeInTheDocument();
    await userEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("loading keeps busy state when a render callback supplies its own label and click handler", async () => {
    const onClick = vi.fn();
    render(
      <Button
        loading
        render={(props) => (
          <button type="button" {...props} onClick={onClick}>
            Save
          </button>
        )}
      />,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.querySelector(".kb-button-spinner")).toBeInTheDocument();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
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
