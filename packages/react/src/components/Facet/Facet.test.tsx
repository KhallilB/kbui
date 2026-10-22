import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Facet } from "./Facet";

describe("Facet", () => {
  test("renders a section with default tone, cut, rail and density", () => {
    const { container } = render(<Facet>body</Facet>);
    const root = container.querySelector("section.kb-facet");
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("data-tone", "default");
    expect(root).toHaveAttribute("data-cut", "none");
    expect(root).toHaveAttribute("data-rail", "none");
    expect(root).toHaveAttribute("data-density", "standard");
    expect(root).toHaveTextContent("body");
  });

  test("applies tone, cut, rail, density and extra className", () => {
    const { container } = render(
      <Facet tone="active" cut="start" rail="accent" density="compact" className="extra">
        x
      </Facet>,
    );
    const root = container.querySelector(".kb-facet");
    expect(root).toHaveAttribute("data-tone", "active");
    expect(root).toHaveAttribute("data-cut", "start");
    expect(root).toHaveAttribute("data-rail", "accent");
    expect(root).toHaveAttribute("data-density", "compact");
    expect(root).toHaveClass("kb-facet", "extra");
  });

  test("renders a decorative rail only when rail is not none", () => {
    const { container, rerender } = render(<Facet>x</Facet>);
    expect(container.querySelector(".kb-facet-rail")).toBeNull();
    rerender(<Facet rail="status">x</Facet>);
    const rail = container.querySelector(".kb-facet-rail");
    expect(rail).toHaveAttribute("aria-hidden", "true");
  });

  test("renders header, body and footer parts", () => {
    const { container } = render(
      <Facet>
        <Facet.Header>Head</Facet.Header>
        <Facet.Body>Body</Facet.Body>
        <Facet.Footer>Foot</Facet.Footer>
      </Facet>,
    );
    expect(container.querySelector(".kb-facet > .kb-facet-header")).toHaveTextContent("Head");
    expect(container.querySelector(".kb-facet > .kb-facet-body")).toHaveTextContent("Body");
    expect(container.querySelector(".kb-facet > .kb-facet-footer")).toHaveTextContent("Foot");
  });

  test("is a named region when aria-labelledby points at the header title", () => {
    render(
      <Facet aria-labelledby="facet-title">
        <Facet.Header>
          <h2 id="facet-title">Queue</h2>
        </Facet.Header>
      </Facet>,
    );
    expect(screen.getByRole("region", { name: "Queue" })).toHaveClass("kb-facet");
  });

  test("forwards ref to the section element", () => {
    const ref = createRef<HTMLElement>();
    render(<Facet ref={ref}>x</Facet>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe("SECTION");
  });

  test("keeps a focused child reachable and never clips the root itself", async () => {
    const { container } = render(
      <Facet cut="start" rail="accent">
        <Facet.Body>
          <button type="button">Act</button>
        </Facet.Body>
      </Facet>,
    );
    await userEvent.tab();
    const btn = screen.getByRole("button", { name: "Act" });
    expect(btn).toHaveFocus();
    const root = container.querySelector(".kb-facet") as HTMLElement;
    expect(root.style.clipPath).toBe("");
    expect(root).not.toHaveAttribute("style");
  });
});
