import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Heading } from "./Heading";

describe("Heading", () => {
  test("defaults to a section heading", () => {
    render(<Heading>Installation</Heading>);
    expect(screen.getByRole("heading", { level: 2, name: "Installation" })).toHaveClass(
      "kb-heading",
    );
  });

  test.each([
    [1, "xl"],
    [2, "lg"],
    [3, "md"],
    [4, "sm"],
    [5, "sm"],
    [6, "sm"],
  ] as const)("level %i sets native rank and default size %s", (level, size) => {
    render(<Heading level={level}>Section</Heading>);
    expect(screen.getByRole("heading", { level })).toHaveAttribute("data-size", size);
  });

  test("visual size preserves rank, native attributes, class and ref", () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <Heading level={3} size="display" id="title" ref={ref} className="extra" data-size="sm">
        Overview
      </Heading>,
    );
    expect(ref.current).toBe(screen.getByRole("heading", { level: 3 }));
    expect(ref.current).toHaveAttribute("data-size", "display");
    expect(ref.current).toHaveAttribute("id", "title");
    expect(ref.current).toHaveClass("kb-heading", "extra");
  });
});
