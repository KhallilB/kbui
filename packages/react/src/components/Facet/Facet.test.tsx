import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Facet, type FacetTone } from "./Facet";

describe("Facet", () => {
  test("renders a section with default tone, rail and density", () => {
    const { container } = render(<Facet>body</Facet>);
    const root = container.querySelector("section.kb-facet");
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("data-tone", "default");
    expect(root).not.toHaveAttribute("data-cut");
    expect(root).toHaveAttribute("data-rail", "none");
    expect(root).toHaveAttribute("data-density", "standard");
    expect(root).toHaveTextContent("body");
  });

  test("applies tone, rail, density and extra className", () => {
    const { container } = render(
      <Facet tone="active" rail="accent" density="compact" className="extra">
        x
      </Facet>,
    );
    const root = container.querySelector(".kb-facet");
    expect(root).toHaveAttribute("data-tone", "active");
    expect(root).toHaveAttribute("data-rail", "accent");
    expect(root).toHaveAttribute("data-density", "compact");
    expect(root).toHaveClass("kb-facet", "extra");
  });

  test("accepts the sunken tone for recessed planes", () => {
    const tone: FacetTone = "sunken";
    const { container } = render(<Facet tone={tone}>x</Facet>);
    expect(container.querySelector(".kb-facet")).toHaveAttribute("data-tone", "sunken");
  });

  test("renders decorative glow and plate layers first, hidden from assistive tech", () => {
    const { container } = render(<Facet>x</Facet>);
    const root = container.querySelector(".kb-facet");
    const [glow, plate] = Array.from(root?.children ?? []);
    expect(glow).toHaveClass("kb-facet-glow");
    expect(glow).toHaveAttribute("aria-hidden", "true");
    expect(plate).toHaveClass("kb-facet-plate");
    expect(plate).toHaveAttribute("aria-hidden", "true");
    expect(root?.querySelector(".kb-facet-frame")).toBeNull();
  });

  test("renders the rail inside the plate only when rail is not none", () => {
    const { container, rerender } = render(<Facet>x</Facet>);
    expect(container.querySelector(".kb-facet-rail")).toBeNull();
    rerender(<Facet rail="status">x</Facet>);
    expect(container.querySelector(".kb-facet-plate > .kb-facet-rail")).not.toBeNull();
  });

  test("renders a recessed well part", () => {
    const { container } = render(
      <Facet>
        <Facet.Body>
          <Facet.Well>output</Facet.Well>
        </Facet.Body>
      </Facet>,
    );
    expect(container.querySelector(".kb-facet-body > .kb-facet-well")).toHaveTextContent("output");
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

  test("renders a toolbar part inside the header", () => {
    const { container } = render(
      <Facet>
        <Facet.Header>
          <h2>Title</h2>
          <Facet.Toolbar>
            <button type="button">A</button>
          </Facet.Toolbar>
        </Facet.Header>
      </Facet>,
    );
    const toolbar = container.querySelector(".kb-facet-header > .kb-facet-toolbar");
    expect(toolbar).not.toBeNull();
    expect(toolbar?.querySelector("button")).toHaveTextContent("A");
  });

  test("marks a facet nested inside another facet", () => {
    const { container } = render(
      <Facet>
        <Facet.Body>
          <Facet>
            <Facet.Body>inner</Facet.Body>
          </Facet>
        </Facet.Body>
      </Facet>,
    );
    const [outer, inner] = Array.from(container.querySelectorAll(".kb-facet"));
    expect(outer).not.toHaveAttribute("data-nested");
    expect(inner).toHaveAttribute("data-nested", "");
  });

  test("groups facets with a direction", () => {
    const { container } = render(
      <Facet.Group direction="row">
        <Facet>a</Facet>
        <Facet>b</Facet>
      </Facet.Group>,
    );
    const group = container.querySelector(".kb-facet-group");
    expect(group).toHaveAttribute("data-direction", "row");
    expect(group?.querySelectorAll(":scope > .kb-facet")).toHaveLength(2);
  });

  test("collapsible facet toggles its body from the toggle", async () => {
    render(
      <Facet collapsible defaultOpen aria-labelledby="c-title">
        <Facet.Header>
          <h2 id="c-title">Log</h2>
          <Facet.Toggle>Toggle</Facet.Toggle>
        </Facet.Header>
        <Facet.Body>lines</Facet.Body>
      </Facet>,
    );
    const root = screen.getByRole("region", { name: "Log" });
    expect(root.tagName).toBe("SECTION");
    expect(root).toHaveAttribute("data-collapsible", "");
    expect(root).toHaveAttribute("data-open");
    const toggle = screen.getByRole("button", { name: "Toggle" });
    expect(toggle).toHaveClass("kb-facet-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("lines")).toBeVisible();
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(root).not.toHaveAttribute("data-open");
    expect(screen.queryByText("lines")).toBeNull();
  });

  test("keeps a focused child reachable and never clips the root itself", async () => {
    const { container } = render(
      <Facet rail="accent">
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
