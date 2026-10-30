import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { expect, within } from "storybook/test";
import { Badge } from "../Badge/Badge";
import { Card } from "../Card/Card";
import { CollectionList } from "../CollectionList/CollectionList";
import { CollectionRow } from "../CollectionRow/CollectionRow";
import { Grid } from "../Grid/Grid";
import { Inline } from "../Inline/Inline";
import { PageHeader } from "../PageHeader/PageHeader";
import { Panel } from "../Panel/Panel";
import { Progress } from "../Progress/Progress";
import { Select } from "../Select/Select";
import { Stat } from "../Stat/Stat";
import { Status } from "../Status/Status";
import { Table } from "../Table/Table";
import { Text } from "../Text/Text";
import { Dashboard } from "./Dashboard";

const meta = {
  title: "Layout/Dashboard",
  component: Dashboard,
  tags: ["autodocs"],
} satisfies Meta<typeof Dashboard>;
export default meta;
type Story = StoryObj<typeof meta>;

const ranges = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];
const metrics = [
  { label: "Total revenue", value: "$128,450", change: "+12.4% vs last period" },
  { label: "Orders", value: "2,184", change: "+8.1% vs last period" },
  { label: "Conversion rate", value: "3.42%", change: "+0.3 pts vs last period" },
  { label: "Average order value", value: "$58.82", change: "+3.9% vs last period" },
];
const channels = [
  { name: "Organic search", revenue: "$46,240", share: "36%" },
  { name: "Paid ads", revenue: "$32,110", share: "25%" },
  { name: "Email", revenue: "$24,380", share: "19%" },
  { name: "Social", revenue: "$15,410", share: "12%" },
  { name: "Direct", revenue: "$10,310", share: "8%" },
];
const goals = [
  { label: "Revenue", value: 86, valueText: "$128k of $150k" },
  { label: "Orders", value: 73, valueText: "2,184 of 3,000" },
  { label: "Conversion", value: 68, valueText: "3.42% of 5%" },
];
const products = [
  {
    name: "Wireless noise-cancelling headphones",
    category: "Electronics",
    units: 412,
    revenue: "$32,960",
    trend: "+14%",
  },
  {
    name: "Smart fitness watch",
    category: "Wearables",
    units: 356,
    revenue: "$28,480",
    trend: "+9%",
  },
  {
    name: "Ergonomic office chair",
    category: "Furniture",
    units: 148,
    revenue: "$22,200",
    trend: "+5%",
  },
  {
    name: "Portable Bluetooth speaker",
    category: "Electronics",
    units: 503,
    revenue: "$20,120",
    trend: "+11%",
  },
  {
    name: "Organic cotton hoodie",
    category: "Apparel",
    units: 389,
    revenue: "$15,560",
    trend: "-2%",
  },
];

// Rebuilds M2 prompt d01: a sales dashboard showing revenue, orders, conversion and top products.
function SalesDashboard() {
  const [range, setRange] = useState<string | null>("30d");
  const id = useId();
  return (
    <Dashboard
      header={
        <PageHeader
          title="Sales dashboard"
          description="Performance overview for your online store."
          meta={<Status tone="success">Updated 5 minutes ago</Status>}
          actions={
            <Select label="Date range" options={ranges} value={range} onValueChange={setRange} />
          }
        />
      }
      metrics={
        <Grid as="ul" aria-label="Key metrics" minItemWidth="sm" gap="md">
          {metrics.map((metric) => (
            <Card as="li" key={metric.label}>
              <Stat label={metric.label} value={metric.value} />
              <Text size="sm" tone="muted">
                {metric.change}
              </Text>
            </Card>
          ))}
        </Grid>
      }
      primary={
        <>
          <Panel aria-labelledby={`${id}-channels`}>
            <Panel.Header>
              <h2 id={`${id}-channels`}>Revenue by channel</h2>
            </Panel.Header>
            <Panel.Body>
              <Table.ScrollContainer label="Channel revenue table">
                <Table density="dense">
                  <Table.Head>
                    <Table.Row>
                      <Table.ColumnHeader>Channel</Table.ColumnHeader>
                      <Table.ColumnHeader align="end">Revenue</Table.ColumnHeader>
                      <Table.ColumnHeader align="end">Share</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {channels.map((channel) => (
                      <Table.Row key={channel.name}>
                        <Table.RowHeader>{channel.name}</Table.RowHeader>
                        <Table.Cell align="end">{channel.revenue}</Table.Cell>
                        <Table.Cell align="end">{channel.share}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Table.ScrollContainer>
            </Panel.Body>
          </Panel>
          <Panel aria-labelledby={`${id}-products`}>
            <Panel.Header>
              <h2 id={`${id}-products`}>Top products</h2>
            </Panel.Header>
            <Panel.Body>
              <CollectionList aria-label="Top products" density="dense">
                {products.map((product) => (
                  <CollectionRow
                    key={product.name}
                    title={product.name}
                    description={`${product.category} · ${product.units} units sold`}
                    metadata={
                      <Inline gap="sm" align="center">
                        <Text as="span">{product.revenue}</Text>
                        <Badge tone={product.trend.startsWith("-") ? "danger" : "success"}>
                          {product.trend}
                        </Badge>
                      </Inline>
                    }
                  />
                ))}
              </CollectionList>
            </Panel.Body>
          </Panel>
        </>
      }
      secondary={
        <Panel aria-labelledby={`${id}-goals`}>
          <Panel.Header>
            <h2 id={`${id}-goals`}>Monthly goals</h2>
          </Panel.Header>
          <Panel.Body>
            {goals.map((goal) => (
              <Progress
                key={goal.label}
                label={goal.label}
                value={goal.value}
                valueText={goal.valueText}
              />
            ))}
          </Panel.Body>
        </Panel>
      }
    />
  );
}

export const SalesOverview: Story = { render: () => <SalesDashboard /> };

export const MetricsAndPrimary: Story = {
  render: () => (
    <Dashboard
      header={<PageHeader title="Store health" description="Today, compared with yesterday." />}
      metrics={
        <Grid as="ul" aria-label="Key metrics" minItemWidth="sm" gap="md">
          {metrics.slice(0, 3).map((metric) => (
            <Card as="li" key={metric.label}>
              <Stat label={metric.label} value={metric.value} />
            </Card>
          ))}
        </Grid>
      }
      primary={
        <Panel aria-labelledby="orders-title">
          <Panel.Header>
            <h2 id="orders-title">Recent orders</h2>
          </Panel.Header>
          <Panel.Body>
            <Text tone="muted">No secondary panels, so the primary region fills the page.</Text>
          </Panel.Body>
        </Panel>
      }
    />
  ),
};

const widths = [390, 768, 1440] as const;
const targetSelector =
  "a[href], button, input:not([type='hidden']), select, textarea, [tabindex]:not([tabindex='-1'])";
const rem = 16;

// Fails on sideways overflow, pointer targets under 24px (WCAG 2.5.8) or overlapping targets.
function expectUsable(frame: HTMLElement) {
  expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
  const box = frame.getBoundingClientRect();
  const targets = [...frame.querySelectorAll<HTMLElement>(targetSelector)]
    .filter((el) => !el.closest("[aria-hidden='true'], [hidden]"))
    .map((el) => ({ el, rect: el.getBoundingClientRect() }));
  expect(targets.length).toBeGreaterThan(0);
  for (const { el, rect } of targets) {
    const name = el.getAttribute("aria-label") ?? el.textContent;
    expect(rect.width, `${name} width`).toBeGreaterThanOrEqual(24);
    expect(rect.height, `${name} height`).toBeGreaterThanOrEqual(24);
    expect(rect.left, `${name} left`).toBeGreaterThanOrEqual(box.left - 0.5);
    expect(rect.right, `${name} right`).toBeLessThanOrEqual(box.right + 0.5);
  }
  for (const [i, a] of targets.entries()) {
    for (const b of targets.slice(i + 1)) {
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const overlapX = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
      const overlapY = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
      expect(
        overlapX > 0.5 && overlapY > 0.5,
        `${a.el.textContent} overlaps ${b.el.textContent}`,
      ).toBe(false);
    }
  }
}

// Page fills up to 80rem with 1, 1.5 or 2rem gutters; regions fill it; panels split from 60rem.
function expectPlacement(frame: HTMLElement) {
  const frameBox = frame.getBoundingClientRect();
  const root = frame.querySelector<HTMLElement>(".kb-dashboard");
  if (!root) throw new Error("Expected a dashboard");
  const page = root.getBoundingClientRect();
  expect(page.width).toBeCloseTo(Math.min(frameBox.width, 80 * rem), 0);
  expect(page.left - frameBox.left).toBeCloseTo(frameBox.right - page.right, 0);
  const gutter = frameBox.width >= 64 * rem ? 2 : frameBox.width >= 48 * rem ? 1.5 : 1;
  const style = getComputedStyle(root);
  expect(Number.parseFloat(style.paddingInlineStart)).toBeCloseTo(gutter * rem, 1);
  expect(Number.parseFloat(style.paddingInlineEnd)).toBeCloseTo(gutter * rem, 1);
  const content = page.width - 2 * gutter * rem;
  for (const region of root.querySelectorAll<HTMLElement>(":scope > *")) {
    expect(region.getBoundingClientRect().width, region.className).toBeCloseTo(content, 0);
  }
  const panels = root.querySelector(".kb-dashboard-panels")?.getBoundingClientRect();
  const primary = root.querySelector(".kb-dashboard-primary")?.getBoundingClientRect();
  const secondary = root.querySelector(".kb-dashboard-secondary")?.getBoundingClientRect();
  if (!panels || !primary || !secondary) throw new Error("Expected primary and secondary");
  if (panels.width < 60 * rem) {
    expect(secondary.top).toBeGreaterThanOrEqual(primary.bottom);
    expect(primary.width).toBeCloseTo(panels.width, 0);
    expect(secondary.width).toBeCloseTo(panels.width, 0);
  } else {
    expect(secondary.top).toBeCloseTo(primary.top, 0);
    expect(secondary.left).toBeGreaterThan(primary.right);
    expect(primary.width / secondary.width).toBeCloseTo(2, 1);
  }
}

export const ResponsiveGeometry: Story = {
  tags: ["!dev", "!autodocs"],
  // Three copies of one screen repeat its panel names by design; every other rule still runs.
  parameters: { a11y: { config: { rules: [{ id: "landmark-unique", enabled: false }] } } },
  // The 1200px default canvas never reaches the 80rem cap.
  globals: { viewport: { value: "desktop", isRotated: false } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {widths.map((width) => (
        <div
          key={width}
          data-testid={`frame-${width}`}
          style={{ inlineSize: width, maxInlineSize: "100%" }}
        >
          <SalesDashboard />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const available = canvasElement.getBoundingClientRect().width;
    // Frames clamp to the canvas; at 80rem or less the page cap is never exercised.
    expect(available).toBeGreaterThan(80 * rem);
    for (const width of widths) {
      const frame = within(canvasElement).getByTestId(`frame-${width}`);
      expect(frame.getBoundingClientRect().width).toBeCloseTo(Math.min(width, available), 0);
      expectUsable(frame);
      expectPlacement(frame);
    }
  },
};
