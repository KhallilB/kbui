import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Separator } from "./Separator";

describe("Separator", () => {
  test("renders a native thematic break without a tab stop", () => {
    render(<Separator />);
    const separator = screen.getByRole("separator");
    expect(separator.tagName).toBe("HR");
    expect(separator).toHaveClass("kb-separator");
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
    expect(separator).toHaveAttribute("aria-orientation", "horizontal");
    expect(separator).not.toHaveAttribute("tabindex");
  });
  test("announces vertical orientation and forwards native props and ref", () => {
    const ref = createRef<HTMLHRElement>();
    render(
      <Separator
        ref={ref}
        orientation="vertical"
        aria-label="Groups"
        className="rule"
        id="groups"
        data-orientation="horizontal"
      />,
    );
    expect(screen.getByRole("separator", { name: "Groups" })).toBe(ref.current);
    expect(ref.current).toHaveClass("kb-separator", "rule");
    expect(ref.current).toHaveAttribute("aria-orientation", "vertical");
    expect(ref.current).toHaveAttribute("data-orientation", "vertical");
    expect(ref.current).toHaveAttribute("id", "groups");
  });
  test("hides decorative dividers from assistive technology", () => {
    const { container } = render(<Separator decorative />);
    expect(screen.queryByRole("separator")).toBeNull();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
