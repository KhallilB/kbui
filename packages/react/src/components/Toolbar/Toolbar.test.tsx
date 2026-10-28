import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Toolbar } from "./Toolbar";

describe("Toolbar", () => {
  test("is a named toolbar whose buttons share one tab stop, move with arrows and forward refs", async () => {
    const rootRef = createRef<HTMLDivElement>();
    const groupRef = createRef<HTMLDivElement>();
    const buttonRef = createRef<HTMLButtonElement>();
    const separatorRef = createRef<HTMLDivElement>();
    render(
      <Toolbar ref={rootRef} aria-label="Worker actions">
        <Toolbar.Button ref={buttonRef}>Copy</Toolbar.Button>
        <Toolbar.Separator ref={separatorRef} className="custom-separator" />
        <Toolbar.Group ref={groupRef}>
          <Toolbar.Button>Stop</Toolbar.Button>
        </Toolbar.Group>
      </Toolbar>,
    );
    const bar = screen.getByRole("toolbar", { name: "Worker actions" });
    expect(rootRef.current).toBe(bar);
    expect(bar).toHaveClass("kb-toolbar");
    const copy = screen.getByRole("button", { name: "Copy" });
    const stop = screen.getByRole("button", { name: "Stop" });
    expect(buttonRef.current).toBe(copy);
    expect(groupRef.current).toBe(bar.querySelector(".kb-toolbar-group"));
    const separator = bar.querySelector(".kb-toolbar-separator");
    expect(separatorRef.current).toBe(separator);
    expect(separator).toHaveClass("custom-separator");
    expect(copy).toHaveClass("kb-button");
    await userEvent.tab();
    expect(copy).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(stop).toHaveFocus();
  });
});
