import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Stat } from "./Stat";

describe("Stat", () => {
  test("renders the label before the value", () => {
    const { container } = render(<Stat label="Elapsed" value="04:12" />);
    const root = container.querySelector(".kb-stat");
    expect(root).toHaveAttribute("data-size", "md");
    const [label, value] = Array.from(root?.children ?? []);
    expect(label).toHaveClass("kb-stat-label");
    expect(label).toHaveTextContent("Elapsed");
    expect(value).toHaveClass("kb-stat-value");
    expect(value).toHaveTextContent("04:12");
  });

  // StatsRow places these two parts on subgrid rows; a third part breaks its alignment.
  test("keeps exactly a label and a value", () => {
    const { container } = render(<Stat label="Revenue" value="$12k" />);
    const parts = Array.from(container.querySelector(".kb-stat")?.children ?? []);
    expect(parts.map((part) => part.className)).toEqual(["kb-stat-label", "kb-stat-value"]);
  });

  test("display size and ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Stat ref={ref} size="display" label="Running" value={3} />);
    expect(ref.current).toHaveAttribute("data-size", "display");
    expect(screen.getByText("3")).toHaveClass("kb-stat-value");
  });
});
