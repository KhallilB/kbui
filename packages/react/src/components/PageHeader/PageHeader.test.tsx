import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { PageHeader, type PageHeaderHeadingLevel, type PageHeaderSize } from "./PageHeader";

const sizes: PageHeaderSize[] = ["sm", "md", "lg"];
const levels: PageHeaderHeadingLevel[] = [1, 2, 3];

describe("PageHeader", () => {
  test("renders title as h1 by default inside a non-landmark root and forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<PageHeader ref={ref} title="Orders" />);
    const root = container.querySelector(".kb-pageheader");
    expect(ref.current).toBe(root);
    expect(root?.tagName).toBe("DIV");
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).not.toHaveAttribute("data-divider");
    expect(screen.queryByRole("banner")).toBeNull();

    const heading = screen.getByRole("heading", { level: 1, name: "Orders" });
    expect(heading).toHaveClass("kb-pageheader-title");
  });

  test("omits wrappers for absent optional regions", () => {
    const { container } = render(<PageHeader title="Orders" />);
    for (const part of ["navigation", "eyebrow", "meta", "description", "actions", "body"]) {
      expect(container.querySelector(`.kb-pageheader-${part}`)).toBeNull();
    }
  });

  test("renders every region in reading order: navigation, heading, actions, body", () => {
    const { container } = render(
      <PageHeader
        navigation={<a href="/orders">Back to orders</a>}
        eyebrow="Order"
        title="#10482"
        meta={<span>Paid</span>}
        description="Placed on 12 October 2026 by Ana Ruiz."
        actions={
          <>
            <button type="button">Refund</button>
            <button type="button">Fulfil order</button>
          </>
        }
      >
        <nav aria-label="Order sections">Summary</nav>
      </PageHeader>,
    );
    const parts = [
      ...container.querySelectorAll(
        ".kb-pageheader-navigation, .kb-pageheader-eyebrow, .kb-pageheader-title, .kb-pageheader-meta, .kb-pageheader-description, .kb-pageheader-actions, .kb-pageheader-body",
      ),
    ].map((node) => node.className.replace("kb-pageheader-", ""));
    expect(parts).toEqual([
      "navigation",
      "eyebrow",
      "title",
      "meta",
      "description",
      "actions",
      "body",
    ]);
    expect(container.querySelector(".kb-pageheader-heading")).toContainElement(
      container.querySelector<HTMLElement>(".kb-pageheader-description"),
    );
    expect(container.querySelector(".kb-pageheader-headline")).toContainElement(
      container.querySelector<HTMLElement>(".kb-pageheader-meta"),
    );
    expect(screen.getByRole("link", { name: "Back to orders" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Fulfil order" })).toBeVisible();
    expect(screen.getByRole("navigation", { name: "Order sections" })).toBeVisible();
  });

  test("keeps meta outside the heading's accessible name", () => {
    render(<PageHeader title="Checkout" meta={<span>Draft</span>} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName("Checkout");
  });

  test.each(levels)("headingLevel %i renders the matching heading rank", (level) => {
    render(<PageHeader headingLevel={level} title="Billing" />);
    expect(screen.getByRole("heading", { level, name: "Billing" })).toBeVisible();
  });

  test.each(sizes)("size %s sets data-size", (size) => {
    const { container } = render(<PageHeader size={size} title="Billing" />);
    expect(container.querySelector(".kb-pageheader")).toHaveAttribute("data-size", size);
  });

  test("divider sets data-divider", () => {
    const { container } = render(<PageHeader divider title="Billing" />);
    expect(container.querySelector(".kb-pageheader")).toHaveAttribute("data-divider", "");
  });

  test("passes native props through while keeping its own class and data attributes", () => {
    const { container } = render(
      <PageHeader
        id="page-header"
        className="app-header"
        data-size="lg"
        aria-describedby="help"
        title="Billing"
      />,
    );
    const root = container.querySelector("#page-header");
    expect(root).toHaveClass("kb-pageheader", "app-header");
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).toHaveAttribute("aria-describedby", "help");
  });
});
