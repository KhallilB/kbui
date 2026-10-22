import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Panel, type PanelTone } from "./Panel";

describe("Panel", () => {
  test("renders a section with default tone, rail and density", () => {
    const { container } = render(<Panel>body</Panel>);
    const root = container.querySelector("section.kb-panel");
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("data-tone", "default");
    expect(root).not.toHaveAttribute("data-cut");
    expect(root).toHaveAttribute("data-rail", "none");
    expect(root).toHaveAttribute("data-density", "standard");
    expect(root).toHaveTextContent("body");
  });

  test("applies tone, rail, density and extra className", () => {
    const { container } = render(
      <Panel tone="active" rail="accent" density="compact" className="extra">
        x
      </Panel>,
    );
    const root = container.querySelector(".kb-panel");
    expect(root).toHaveAttribute("data-tone", "active");
    expect(root).toHaveAttribute("data-rail", "accent");
    expect(root).toHaveAttribute("data-density", "compact");
    expect(root).toHaveClass("kb-panel", "extra");
  });

  test("accepts the sunken tone for recessed planes", () => {
    const tone: PanelTone = "sunken";
    const { container } = render(<Panel tone={tone}>x</Panel>);
    expect(container.querySelector(".kb-panel")).toHaveAttribute("data-tone", "sunken");
  });

  test("renders decorative glow and plate layers first, hidden from assistive tech", () => {
    const { container } = render(<Panel>x</Panel>);
    const root = container.querySelector(".kb-panel");
    const [glow, plate] = Array.from(root?.children ?? []);
    expect(glow).toHaveClass("kb-panel-glow");
    expect(glow).toHaveAttribute("aria-hidden", "true");
    expect(plate).toHaveClass("kb-panel-plate");
    expect(plate).toHaveAttribute("aria-hidden", "true");
    expect(root?.querySelector(".kb-panel-frame")).toBeNull();
  });

  test("renders the rail inside the plate only when rail is not none", () => {
    const { container, rerender } = render(<Panel>x</Panel>);
    expect(container.querySelector(".kb-panel-rail")).toBeNull();
    rerender(<Panel rail="status">x</Panel>);
    expect(container.querySelector(".kb-panel-plate > .kb-panel-rail")).not.toBeNull();
  });

  test("renders a recessed well part", () => {
    const { container } = render(
      <Panel>
        <Panel.Body>
          <Panel.Well>output</Panel.Well>
        </Panel.Body>
      </Panel>,
    );
    expect(container.querySelector(".kb-panel-body > .kb-panel-well")).toHaveTextContent("output");
  });

  test("renders header, body and footer parts", () => {
    const { container } = render(
      <Panel>
        <Panel.Header>Head</Panel.Header>
        <Panel.Body>Body</Panel.Body>
        <Panel.Footer>Foot</Panel.Footer>
      </Panel>,
    );
    expect(container.querySelector(".kb-panel > .kb-panel-header")).toHaveTextContent("Head");
    expect(container.querySelector(".kb-panel > .kb-panel-body")).toHaveTextContent("Body");
    expect(container.querySelector(".kb-panel > .kb-panel-footer")).toHaveTextContent("Foot");
  });

  test("is a named region when aria-labelledby points at the header title", () => {
    render(
      <Panel aria-labelledby="panel-title">
        <Panel.Header>
          <h2 id="panel-title">Queue</h2>
        </Panel.Header>
      </Panel>,
    );
    expect(screen.getByRole("region", { name: "Queue" })).toHaveClass("kb-panel");
  });

  test("forwards ref to the section element", () => {
    const ref = createRef<HTMLElement>();
    render(<Panel ref={ref}>x</Panel>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe("SECTION");
  });

  test("renders a toolbar part inside the header", () => {
    const { container } = render(
      <Panel>
        <Panel.Header>
          <h2>Title</h2>
          <Panel.Toolbar>
            <button type="button">A</button>
          </Panel.Toolbar>
        </Panel.Header>
      </Panel>,
    );
    const toolbar = container.querySelector(".kb-panel-header > .kb-panel-toolbar");
    expect(toolbar).not.toBeNull();
    expect(toolbar?.querySelector("button")).toHaveTextContent("A");
  });

  test("marks a panel nested inside another panel", () => {
    const { container } = render(
      <Panel>
        <Panel.Body>
          <Panel>
            <Panel.Body>inner</Panel.Body>
          </Panel>
        </Panel.Body>
      </Panel>,
    );
    const [outer, inner] = Array.from(container.querySelectorAll(".kb-panel"));
    expect(outer).not.toHaveAttribute("data-nested");
    expect(inner).toHaveAttribute("data-nested", "");
  });

  test("groups panels with a direction", () => {
    const { container } = render(
      <Panel.Group direction="row">
        <Panel>a</Panel>
        <Panel>b</Panel>
      </Panel.Group>,
    );
    const group = container.querySelector(".kb-panel-group");
    expect(group).toHaveAttribute("data-direction", "row");
    expect(group?.querySelectorAll(":scope > .kb-panel")).toHaveLength(2);
  });

  test("collapsible panel toggles its body from the toggle", async () => {
    render(
      <Panel collapsible defaultOpen aria-labelledby="c-title">
        <Panel.Header>
          <h2 id="c-title">Log</h2>
          <Panel.Toggle>Toggle</Panel.Toggle>
        </Panel.Header>
        <Panel.Body>lines</Panel.Body>
      </Panel>,
    );
    const root = screen.getByRole("region", { name: "Log" });
    expect(root.tagName).toBe("SECTION");
    expect(root).toHaveAttribute("data-collapsible", "");
    expect(root).toHaveAttribute("data-open");
    const toggle = screen.getByRole("button", { name: "Toggle" });
    expect(toggle).toHaveClass("kb-panel-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("lines")).toBeVisible();
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(root).not.toHaveAttribute("data-open");
    expect(screen.queryByText("lines")).toBeNull();
  });

  test("keeps a focused child reachable and never clips the root itself", async () => {
    const { container } = render(
      <Panel rail="accent">
        <Panel.Body>
          <button type="button">Act</button>
        </Panel.Body>
      </Panel>,
    );
    await userEvent.tab();
    const btn = screen.getByRole("button", { name: "Act" });
    expect(btn).toHaveFocus();
    const root = container.querySelector(".kb-panel") as HTMLElement;
    expect(root.style.clipPath).toBe("");
    expect(root).not.toHaveAttribute("style");
  });
});
