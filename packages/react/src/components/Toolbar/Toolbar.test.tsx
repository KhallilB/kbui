import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { Toolbar } from "./Toolbar";

describe("Toolbar", () => {
  test("is a named toolbar whose buttons share one tab stop and move with arrows", async () => {
    render(
      <Toolbar aria-label="Worker actions">
        <Toolbar.Button>Copy</Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.Group>
          <Toolbar.Button>Stop</Toolbar.Button>
        </Toolbar.Group>
      </Toolbar>,
    );
    const bar = screen.getByRole("toolbar", { name: "Worker actions" });
    expect(bar).toHaveClass("kb-toolbar");
    const copy = screen.getByRole("button", { name: "Copy" });
    const stop = screen.getByRole("button", { name: "Stop" });
    expect(copy).toHaveClass("kb-button");
    await userEvent.tab();
    expect(copy).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(stop).toHaveFocus();
  });
});
