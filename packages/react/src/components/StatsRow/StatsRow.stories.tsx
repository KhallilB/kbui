import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Link } from "../Link/Link";
import { StatsRow } from "./StatsRow";

const meta = {
  title: "Components/StatsRow",
  component: StatsRow,
  tags: ["autodocs"],
  args: { appearance: "plain" },
  argTypes: { appearance: { control: "select", options: ["plain", "outlined"] } },
} satisfies Meta<typeof StatsRow>;

export default meta;
type Story = StoryObj<typeof meta>;

const box = { width: "100%" } as const;

// Metrics row from the M2 sales dashboard prompt (d01).
const sales = [
  { id: "revenue", label: "Total revenue", value: "$48,250", change: "+12.8%", href: "#revenue" },
  { id: "orders", label: "Orders", value: "625", change: "+8.7%", href: "#orders" },
  {
    id: "conversion",
    label: "Conversion rate",
    value: "3.42%",
    change: "+0.36 pp",
    href: "#funnel",
  },
  { id: "aov", label: "Average order value", value: "$77.20", change: "+3.8%", href: "#basket" },
];

function rows(list: HTMLElement) {
  const byTop = new Map<number, HTMLElement[]>();
  for (const item of within(list).getAllByRole("listitem")) {
    const top = Math.round(item.getBoundingClientRect().top);
    byTop.set(top, [...(byTop.get(top) ?? []), item]);
  }
  return [...byTop.values()];
}

async function expectAlignedRows(list: HTMLElement) {
  await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
  for (const row of rows(list)) {
    const valueTops = row.map((item) =>
      Math.round(item.querySelector(".kb-stat-value")?.getBoundingClientRect().top ?? -1),
    );
    await expect(new Set(valueTops).size).toBe(1);
  }
}

export const Default: Story = {
  render: (args) => (
    <div style={box}>
      <StatsRow {...args} aria-label="Store performance, September 2026">
        {sales.map((metric) => (
          <StatsRow.Item
            key={metric.id}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            trend="up"
            tone="positive"
            context="vs. previous month"
          />
        ))}
      </StatsRow>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list", { name: "Store performance, September 2026" });
    await expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    await expectAlignedRows(list);
  },
};

export const Outlined: Story = {
  args: { appearance: "outlined" },
  render: (args) => (
    <div style={box}>
      <StatsRow {...args} aria-label="Store performance, September 2026">
        {sales.map((metric) => (
          <StatsRow.Item
            key={metric.id}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            trend="up"
            tone="positive"
            context="vs. previous month"
            link={<Link href={metric.href}>View {metric.label.toLowerCase()}</Link>}
          />
        ))}
      </StatsRow>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "View orders" })).toBeVisible();
    const links = canvas.getAllByRole("link").map((link) => link.getBoundingClientRect().top);
    await expect(new Set(links.map(Math.round)).size).toBe(1);
  },
};

export const DirectionAndTone: Story = {
  render: () => (
    <div style={box}>
      <StatsRow aria-label="Support, this week">
        <StatsRow.Item
          label="Tickets resolved"
          value="1,284"
          change="+6.2%"
          trend="up"
          tone="positive"
          context="vs. last week"
        />
        <StatsRow.Item
          label="Refund requests"
          value="38"
          change="+12 requests"
          trend="up"
          tone="negative"
          context="vs. last week"
        />
        <StatsRow.Item
          label="Median first reply"
          value="42 min"
          change="−9 min"
          trend="down"
          tone="positive"
          context="vs. last week"
        />
        <StatsRow.Item
          label="Satisfaction"
          value="4.6 / 5"
          change="No change"
          trend="flat"
          context="vs. last week"
        />
      </StatsRow>
    </div>
  ),
};

const widths = [
  { label: "390px screen", width: "22.375rem" },
  { label: "768px screen", width: "46rem" },
];

export const Wrap: Story = {
  render: () => (
    <div style={{ ...box, display: "grid", gap: "2rem" }}>
      {widths.map(({ label, width }) => (
        <div key={label} style={{ maxWidth: width }} data-frame={label}>
          <StatsRow appearance="outlined" aria-label={`Store performance at ${label}`}>
            {[
              ...sales,
              {
                id: "returning",
                label: "Repeat purchase rate, last 90 days",
                value: "41%",
                change: "+2 pp",
              },
              { id: "refunds", label: "Refunds", value: "$1,180", change: "−4.1%" },
            ].map((metric) => (
              <StatsRow.Item
                key={metric.id}
                label={metric.label}
                value={metric.value}
                change={metric.change}
                context="vs. previous month"
              />
            ))}
          </StatsRow>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const { label } of widths) {
      const list = canvas.getByRole("list", { name: `Store performance at ${label}` });
      await expect(rows(list).length).toBeGreaterThan(1);
      const labels = [...list.querySelectorAll<HTMLElement>(".kb-stat-label")];
      const heights = labels.map((label) => Math.round(label.getBoundingClientRect().height));
      // A wrapped label proves values align through the shared track, not by equal label heights.
      await expect(new Set(heights).size).toBeGreaterThan(1);
      await expectAlignedRows(list);
    }
  },
};
