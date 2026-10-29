import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Grid } from "./Grid";

describe("Grid", () => {
  test("renders a layout div without interactive grid semantics", () => {
    const { container } = render(
      <Grid>
        <p>One</p>
        <p>Two</p>
      </Grid>,
    );
    expect(container.firstElementChild).toHaveClass("kb-grid");
    expect(container.firstElementChild).toHaveAttribute("data-layout", "auto");
    expect(screen.queryByRole("grid")).toBeNull();
  });
  test("preserves list semantics and stacked layout", () => {
    render(
      <Grid as="ul" layout="stack" aria-label="Work">
        <li>One</li>
        <li>Two</li>
      </Grid>,
    );
    expect(screen.getByRole("list", { name: "Work" })).toHaveAttribute("data-layout", "stack");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
  test("forwards div ref and custom classes", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Grid ref={ref} className="skin">
        Body
      </Grid>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("kb-grid", "skin");
  });
  test("applies columns, minItemWidth, gap, and align data attributes", () => {
    const { container } = render(
      <Grid columns={3} minItemWidth="sm" gap="md" align="start">
        <p>One</p>
        <p>Two</p>
        <p>Three</p>
      </Grid>,
    );
    const grid = container.firstElementChild;
    expect(grid).toHaveAttribute("data-layout", "auto");
    expect(grid).toHaveAttribute("data-columns", "3");
    expect(grid).toHaveAttribute("data-min-item-width", "sm");
    expect(grid).toHaveAttribute("data-gap", "md");
    expect(grid).toHaveAttribute("data-align", "start");
  });
  test("supports ordered list container and omits unset optional data attributes", () => {
    const ref = createRef<HTMLOListElement>();
    render(
      <Grid as="ol" ref={ref} aria-label="Steps" gap="sm">
        <li>First</li>
        <li>Second</li>
      </Grid>,
    );
    const list = screen.getByRole("list", { name: "Steps" });
    expect(ref.current).toBeInstanceOf(HTMLOListElement);
    expect(list).toHaveAttribute("data-layout", "auto");
    expect(list).toHaveAttribute("data-gap", "sm");
    expect(list).not.toHaveAttribute("data-columns");
    expect(list).not.toHaveAttribute("data-min-item-width");
    expect(list).not.toHaveAttribute("data-align");
  });
});
