import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test } from "vitest";
import { SupportingPane } from "./SupportingPane";

afterEach(cleanup);

describe("SupportingPane", () => {
  test("renders main then a named complementary aside in source order", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <main>
        <SupportingPane ref={ref} aside={<p>Total $245.75</p>} asideLabel="Order summary">
          <h1>Your cart</h1>
        </SupportingPane>
      </main>,
    );
    const root = container.querySelector(".kb-supportingpane");
    expect(ref.current).toBe(root);
    expect([...(root?.children ?? [])].map((node) => [node.tagName, node.className])).toEqual([
      ["DIV", "kb-supportingpane-main"],
      ["ASIDE", "kb-supportingpane-aside"],
    ]);
    // Adds no landmark of its own; the page owns main.
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Your cart" })).toBeDefined();
    expect(screen.getByRole("complementary", { name: "Order summary" })).toBe(root?.lastChild);
  });

  test("names the aside from a visible heading", () => {
    render(
      <SupportingPane
        aside={<h2 id="summary-title">Order summary</h2>}
        asideLabelledBy="summary-title"
      >
        Items
      </SupportingPane>,
    );
    const aside = screen.getByRole("complementary", { name: "Order summary" });
    expect(aside).toHaveAttribute("aria-labelledby", "summary-title");
    expect(aside).not.toHaveAttribute("aria-label");
  });

  test("omits the aside when unset", () => {
    const { container } = render(<SupportingPane>Items</SupportingPane>);
    expect(container.querySelector(".kb-supportingpane-aside")).toBeNull();
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  test("passes native attributes to the root", () => {
    const { container } = render(
      <SupportingPane
        id="checkout"
        className="app-cart"
        data-testid="pane"
        aside="x"
        asideLabel="x"
      >
        Items
      </SupportingPane>,
    );
    const root = container.querySelector(".kb-supportingpane");
    expect(root).toHaveAttribute("id", "checkout");
    expect(root).toHaveAttribute("data-testid", "pane");
    expect(root).toHaveClass("app-cart");
  });
});
