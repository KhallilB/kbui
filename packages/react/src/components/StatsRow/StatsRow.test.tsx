import { render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { StatsRow, type StatsRowTone, type StatsRowTrend } from "./StatsRow";

const trends: StatsRowTrend[] = ["up", "down", "flat"];
const tones: StatsRowTone[] = ["positive", "negative", "neutral"];

describe("StatsRow", () => {
  test("renders a named list of metric items and forwards refs", () => {
    const ref = createRef<HTMLUListElement>();
    const itemRef = createRef<HTMLLIElement>();
    render(
      <StatsRow ref={ref} aria-label="Sales, last 30 days">
        <StatsRow.Item ref={itemRef} label="Orders" value="625" />
        <StatsRow.Item label="Conversion rate" value="3.42%" />
      </StatsRow>,
    );
    const list = screen.getByRole("list", { name: "Sales, last 30 days" });
    expect(ref.current).toBe(list);
    expect(list.tagName).toBe("UL");
    expect(list).toHaveClass("kb-statsrow");
    expect(list).toHaveAttribute("data-appearance", "plain");

    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(itemRef.current).toBe(items[0]);
    expect(items[0]).toHaveClass("kb-statsrow-item");
  });

  test("keeps WebKit list semantics with an explicit list role", () => {
    render(<StatsRow aria-label="Totals" />);
    expect(screen.getByRole("list")).toHaveAttribute("role", "list");
  });

  test("reads label, value, change, context and link in that order", () => {
    const { container } = render(
      <StatsRow>
        <StatsRow.Item
          label="Total revenue"
          value="$48,250"
          change="+12.8%"
          trend="up"
          tone="positive"
          context="vs. previous month"
          link={<a href="/revenue">View revenue</a>}
        />
      </StatsRow>,
    );
    const item = screen.getByRole("listitem");
    expect(item).toHaveTextContent("Total revenue$48,250+12.8% vs. previous monthView revenue", {
      normalizeWhitespace: false,
    });
    const parts = [
      ...container.querySelectorAll(
        ".kb-stat-label, .kb-stat-value, .kb-statsrow-change, .kb-statsrow-context, .kb-statsrow-link",
      ),
    ].map((node) => node.classList[0]);
    expect(parts).toEqual([
      "kb-stat-label",
      "kb-stat-value",
      "kb-statsrow-change",
      "kb-statsrow-context",
      "kb-statsrow-link",
    ]);
    expect(container.querySelector(".kb-statsrow-item > .kb-stat")).not.toBeNull();
    expect(screen.getByRole("link", { name: "View revenue" })).toBeVisible();
  });

  test("omits trend and link wrappers when an item has neither", () => {
    const { container } = render(
      <StatsRow>
        <StatsRow.Item label="Orders" value="625" />
      </StatsRow>,
    );
    for (const part of ["trend", "change", "glyph", "context", "link"]) {
      expect(container.querySelector(`.kb-statsrow-${part}`)).toBeNull();
    }
  });

  test("renders context without a change or glyph", () => {
    const { container } = render(
      <StatsRow>
        <StatsRow.Item label="Orders" value="625" context="Updated 5 minutes ago" />
      </StatsRow>,
    );
    expect(container.querySelector(".kb-statsrow-trend")).toHaveTextContent(
      "Updated 5 minutes ago",
    );
    expect(container.querySelector(".kb-statsrow-change")).toBeNull();
  });

  test.each(trends)("trend %s draws a hidden direction glyph beside the change text", (trend) => {
    const { container } = render(
      <StatsRow>
        <StatsRow.Item label="Orders" value="625" change="8.7%" trend={trend} />
      </StatsRow>,
    );
    const change = container.querySelector(".kb-statsrow-change");
    expect(change).toHaveAttribute("data-trend", trend);
    const glyph = change?.querySelector(".kb-statsrow-glyph");
    expect(glyph).toHaveAttribute("aria-hidden", "true");
    expect(change?.textContent).toBe("8.7%");
  });

  test("draws no glyph when trend is unset", () => {
    const { container } = render(
      <StatsRow>
        <StatsRow.Item label="Orders" value="625" change="+8.7%" />
      </StatsRow>,
    );
    const change = container.querySelector(".kb-statsrow-change");
    expect(change).not.toHaveAttribute("data-trend");
    expect(change?.querySelector(".kb-statsrow-glyph")).toBeNull();
  });

  test("tone defaults to neutral and is independent of direction", () => {
    const { container, rerender } = render(
      <StatsRow>
        <StatsRow.Item label="Refunds" value="12" change="+3" trend="up" />
      </StatsRow>,
    );
    expect(container.querySelector(".kb-statsrow-change")).toHaveAttribute("data-tone", "neutral");
    for (const tone of tones) {
      rerender(
        <StatsRow>
          <StatsRow.Item label="Refunds" value="12" change="+3" trend="up" tone={tone} />
        </StatsRow>,
      );
      expect(container.querySelector(".kb-statsrow-change")).toHaveAttribute("data-tone", tone);
    }
  });

  test("forwards stat, label and value classes to the inner Stat", () => {
    const { container } = render(
      <StatsRow>
        <StatsRow.Item
          label="Orders"
          value="625"
          classNames={{ stat: "s", label: "l", value: "v" }}
        />
      </StatsRow>,
    );
    expect(container.querySelector(".kb-stat")).toHaveClass("s");
    expect(container.querySelector(".kb-stat-label")).toHaveClass("l");
    expect(container.querySelector(".kb-stat-value")).toHaveClass("v");
  });

  test("outlined appearance sets data-appearance", () => {
    render(<StatsRow appearance="outlined" />);
    expect(screen.getByRole("list")).toHaveAttribute("data-appearance", "outlined");
  });

  test("passes native props through while keeping its own class and data attributes", () => {
    render(
      <StatsRow id="metrics" className="app-metrics" data-appearance="outlined">
        <StatsRow.Item id="orders" className="app-metric" label="Orders" value="625" />
      </StatsRow>,
    );
    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("id", "metrics");
    expect(list).toHaveClass("kb-statsrow", "app-metrics");
    expect(list).toHaveAttribute("data-appearance", "plain");
    expect(screen.getByRole("listitem")).toHaveAttribute("id", "orders");
    expect(screen.getByRole("listitem")).toHaveClass("kb-statsrow-item", "app-metric");
  });
});
