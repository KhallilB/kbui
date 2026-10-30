import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { Panel, type PanelHandleProps, type PanelTone } from "./Panel";

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

  test("marks opaque panels only when asked", () => {
    const { container, rerender } = render(<Panel>x</Panel>);
    expect(container.querySelector(".kb-panel")).not.toHaveAttribute("data-opaque");
    rerender(<Panel opaque>x</Panel>);
    expect(container.querySelector(".kb-panel")).toHaveAttribute("data-opaque", "");
    rerender(
      <Panel opaque collapsible>
        x
      </Panel>,
    );
    expect(container.querySelector(".kb-panel")).toHaveAttribute("data-opaque", "");
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

describe("Panel.Handle", () => {
  function Split({
    direction = "row",
    ...handle
  }: { direction?: "row" | "column" } & Omit<PanelHandleProps, "aria-label" | "aria-labelledby">) {
    return (
      <Panel.Group direction={direction}>
        <Panel>code</Panel>
        <Panel.Handle aria-label="Resize code" {...handle} />
        <Panel>picture</Panel>
      </Panel.Group>
    );
  }
  const separator = () => screen.getByRole("separator", { name: "Resize code" });
  const firstPanel = (container: HTMLElement) =>
    container.querySelector(".kb-panel") as HTMLElement;

  test("is a focusable separator whose orientation crosses the group direction", () => {
    const { unmount } = render(<Split />);
    expect(separator()).toHaveAttribute("tabindex", "0");
    expect(separator()).toHaveAttribute("aria-orientation", "vertical");
    expect(separator()).toHaveClass("kb-panel-handle");
    unmount();
    render(<Split direction="column" />);
    expect(separator()).toHaveAttribute("aria-orientation", "horizontal");
  });

  test("controls the panel before it and reports its size as a percentage", () => {
    const { container } = render(<Split defaultSize={40} min={20} max={70} />);
    const pane = firstPanel(container);
    expect(pane.id).not.toBe("");
    expect(separator()).toHaveAttribute("aria-controls", pane.id);
    expect(separator()).toHaveAttribute("aria-valuenow", "40");
    expect(separator()).toHaveAttribute("aria-valuemin", "20");
    expect(separator()).toHaveAttribute("aria-valuemax", "70");
    expect(pane.style.getPropertyValue("--kb-panel-size")).toBe("40%");
  });

  test("keeps an id the caller already gave the panel", () => {
    render(
      <Panel.Group direction="row">
        <Panel id="editor">code</Panel>
        <Panel.Handle aria-label="Resize code" />
        <Panel>picture</Panel>
      </Panel.Group>,
    );
    expect(separator()).toHaveAttribute("aria-controls", "editor");
  });

  test("moves with the arrows along its axis and stops at the limits", async () => {
    const user = userEvent.setup();
    render(<Split defaultSize={50} min={30} max={60} step={5} />);
    separator().focus();
    await user.keyboard("{ArrowRight}");
    expect(separator()).toHaveAttribute("aria-valuenow", "55");
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(separator()).toHaveAttribute("aria-valuenow", "60");
    await user.keyboard("{ArrowDown}");
    expect(separator()).toHaveAttribute("aria-valuenow", "60");
    await user.keyboard("{ArrowLeft}");
    expect(separator()).toHaveAttribute("aria-valuenow", "55");
    await user.keyboard("{Home}");
    expect(separator()).toHaveAttribute("aria-valuenow", "30");
    await user.keyboard("{End}");
    expect(separator()).toHaveAttribute("aria-valuenow", "60");
  });

  test("uses up and down in a column group", async () => {
    const user = userEvent.setup();
    render(<Split direction="column" defaultSize={50} step={10} />);
    separator().focus();
    await user.keyboard("{ArrowDown}");
    expect(separator()).toHaveAttribute("aria-valuenow", "60");
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(separator()).toHaveAttribute("aria-valuenow", "40");
    await user.keyboard("{ArrowRight}");
    expect(separator()).toHaveAttribute("aria-valuenow", "40");
  });

  test("Enter collapses the panel to its minimum and restores the last size", async () => {
    const user = userEvent.setup();
    render(<Split defaultSize={45} min={15} />);
    separator().focus();
    await user.keyboard("{Enter}");
    expect(separator()).toHaveAttribute("aria-valuenow", "15");
    await user.keyboard("{Enter}");
    expect(separator()).toHaveAttribute("aria-valuenow", "45");
  });

  test("follows a controlled size and reports changes", async () => {
    const user = userEvent.setup();
    const onSizeChange = vi.fn();
    function Controlled() {
      const [size, setSize] = useState(50);
      return (
        <Split
          size={size}
          onSizeChange={(next) => {
            onSizeChange(next);
            setSize(next);
          }}
        />
      );
    }
    render(<Controlled />);
    separator().focus();
    await user.keyboard("{ArrowLeft}");
    expect(onSizeChange).toHaveBeenLastCalledWith(45);
    expect(separator()).toHaveAttribute("aria-valuenow", "45");
  });

  test("stays put when controlled and the owner ignores the change", async () => {
    const user = userEvent.setup();
    render(<Split size={50} />);
    separator().focus();
    await user.keyboard("{ArrowRight}");
    expect(separator()).toHaveAttribute("aria-valuenow", "50");
  });

  test("drags the panel edge with the pointer, within limits", () => {
    const onSizeChange = vi.fn();
    const { container } = render(<Split min={20} max={80} onSizeChange={onSizeChange} />);
    const group = container.querySelector(".kb-panel-group") as HTMLElement;
    const rect = (left: number, top: number, width: number, height: number) =>
      ({ left, top, width, height, right: left + width, bottom: top + height }) as DOMRect;
    group.getBoundingClientRect = () => rect(100, 0, 1000, 400);
    firstPanel(container).getBoundingClientRect = () => rect(100, 0, 500, 400);
    fireEvent.pointerDown(separator(), { pointerId: 1, button: 0, clientX: 600 });
    expect(separator()).toHaveAttribute("data-dragging");
    fireEvent.pointerMove(separator(), { pointerId: 1, clientX: 400 });
    expect(separator()).toHaveAttribute("aria-valuenow", "30");
    fireEvent.pointerMove(separator(), { pointerId: 1, clientX: 1100 });
    expect(separator()).toHaveAttribute("aria-valuenow", "80");
    fireEvent.pointerUp(separator(), { pointerId: 1 });
    expect(separator()).not.toHaveAttribute("data-dragging");
    expect(onSizeChange).toHaveBeenLastCalledWith(80);
  });

  test("forwards ref to the separator element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Panel.Group direction="row">
        <Panel>a</Panel>
        <Panel.Handle ref={ref} aria-label="Resize a" />
        <Panel>b</Panel>
      </Panel.Group>,
    );
    expect(ref.current).toBe(screen.getByRole("separator"));
  });
});
