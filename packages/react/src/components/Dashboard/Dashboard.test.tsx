import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test } from "vitest";
import { PageHeader } from "../PageHeader/PageHeader";
import { Stat } from "../Stat/Stat";
import { Dashboard } from "./Dashboard";

afterEach(cleanup);

const regionClasses = (root: Element | null) =>
  [...(root?.children ?? [])].map((node) => node.className);

describe("Dashboard", () => {
  test("renders header, metrics and panels regions in reading order", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Dashboard
        ref={ref}
        header={<PageHeader title="Sales" />}
        metrics={<Stat label="Revenue" value="$128,450" />}
        primary={<p>Channels</p>}
        secondary={<p>Goals</p>}
      />,
    );
    const root = container.querySelector(".kb-dashboard");
    expect(ref.current).toBe(root);
    expect(regionClasses(root)).toEqual([
      "kb-dashboard-header",
      "kb-dashboard-metrics",
      "kb-dashboard-panels",
    ]);
    expect(regionClasses(root?.querySelector(".kb-dashboard-panels") ?? null)).toEqual([
      "kb-dashboard-primary",
      "kb-dashboard-secondary",
    ]);
    expect(screen.getByRole("heading", { level: 1, name: "Sales" })).toBeDefined();
    expect(root?.textContent).toBe("SalesRevenue$128,450ChannelsGoals");
  });

  test("omits regions that are unset", () => {
    const { container } = render(<Dashboard primary={<p>Only panel</p>} />);
    const root = container.querySelector(".kb-dashboard");
    expect(regionClasses(root)).toEqual(["kb-dashboard-panels"]);
    expect(regionClasses(root?.querySelector(".kb-dashboard-panels") ?? null)).toEqual([
      "kb-dashboard-primary",
    ]);
  });

  test("leaves out the panels region without primary or secondary content", () => {
    const { container } = render(<Dashboard header={<PageHeader title="Sales" />} />);
    expect(container.querySelector(".kb-dashboard-panels")).toBeNull();
  });

  test("passes native attributes to the root", () => {
    const { container } = render(
      <Dashboard
        role="region"
        aria-label="Store overview"
        id="overview"
        className="app-dashboard"
      />,
    );
    const root = container.querySelector(".kb-dashboard");
    expect(root).toHaveAttribute("id", "overview");
    expect(root).toHaveAttribute("aria-label", "Store overview");
    expect(root).toHaveClass("app-dashboard");
  });
});
