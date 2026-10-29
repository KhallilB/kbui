import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Card } from "../Card/Card";
import { Grid } from "./Grid";

const meta = { title: "Layout/Grid", component: Grid, tags: ["autodocs"] } satisfies Meta<
  typeof Grid
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <Grid>
      {["Website refresh", "Mobile checkout", "Help center"].map((name) => (
        <Card key={name}>
          <h2>{name}</h2>
          <p>Review the latest draft and share feedback.</p>
        </Card>
      ))}
    </Grid>
  ),
};
export const StackedList: Story = {
  render: () => (
    <Grid as="ul" layout="stack" gap="md" aria-label="Projects">
      <Card as="li">
        <h2>Website refresh</h2>
        <p>Review the latest homepage draft and share launch notes.</p>
      </Card>
      <Card as="li">
        <h2>Mobile checkout</h2>
        <p>Verify payment step latency and error recovery states.</p>
      </Card>
      <Card as="li">
        <h2>Help center</h2>
        <p>Audit search ranking and update onboarding guides.</p>
      </Card>
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list", { name: "Projects" });
    expect(list).toBeVisible();
    const listStyle = getComputedStyle(list);
    expect(listStyle.listStyleType).toBe("none");
    expect(listStyle.paddingLeft).toBe("0px");
    expect(listStyle.marginTop).toBe("0px");
    expect(listStyle.marginBottom).toBe("0px");
    const items = canvas.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    const [first, second, third] = items.map((item) => item.getBoundingClientRect());
    if (!first || !second || !third) throw new Error("Expected three list items");
    expect(second.left).toBeCloseTo(first.left, 0);
    expect(third.left).toBeCloseTo(first.left, 0);
    expect(second.top - first.bottom).toBeCloseTo(16, 0);
    expect(third.top - second.bottom).toBeCloseTo(16, 0);
  },
};
export const Columns: Story = {
  render: () => (
    <Grid layout="stack" gap="lg">
      <Grid columns={2} gap="md" data-testid="columns-2">
        {["Overview", "Milestones"].map((name) => (
          <Card key={name}>
            <h2>{name}</h2>
            <p>Two equal columns on wider viewports, stacked on mobile.</p>
          </Card>
        ))}
      </Grid>
      <Grid columns={3} gap="md" data-testid="columns-3">
        {["Design", "Engineering", "Research"].map((name) => (
          <Card key={name}>
            <h2>{name}</h2>
            <p>Three equal columns when room allows.</p>
          </Card>
        ))}
      </Grid>
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const two = canvas.getByTestId("columns-2");
    const three = canvas.getByTestId("columns-3");
    const twoCols = getComputedStyle(two).gridTemplateColumns.split(" ").length;
    const threeCols = getComputedStyle(three).gridTemplateColumns.split(" ").length;
    if (window.innerWidth <= 480) {
      expect(twoCols).toBe(1);
      expect(threeCols).toBe(1);
    } else {
      expect(twoCols).toBe(2);
      expect(threeCols).toBe(3);
    }
  },
};
export const ColumnWidths: Story = {
  render: () => (
    <Grid layout="stack" gap="md">
      {(["sm", "md", "lg"] as const).map((minItemWidth) => (
        <div key={minItemWidth} style={{ width: 760, maxWidth: "100%" }}>
          <Grid minItemWidth={minItemWidth} gap="md" data-testid={`min-width-${minItemWidth}`}>
            {["Alpha", "Beta", "Gamma"].map((name) => (
              <Card key={name}>
                <h2>
                  {minItemWidth}: {name}
                </h2>
              </Card>
            ))}
          </Grid>
        </div>
      ))}
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [size, minPx] of [
      ["sm", 224],
      ["md", 300],
      ["lg", 384],
    ] as const) {
      const grid = canvas.getByTestId(`min-width-${size}`);
      const available = grid.getBoundingClientRect().width;
      const columns = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
      const expected = available >= minPx * 3 + 32 ? 3 : available >= minPx * 2 + 16 ? 2 : 1;
      expect(columns).toBe(expected);
      expect(grid.scrollWidth).toBeLessThanOrEqual(Math.ceil(available));
    }
  },
};
export const GapsAndAlignment: Story = {
  render: () => (
    <Grid columns={2} gap="sm" align="start" data-testid="aligned-grid">
      <Card>
        <h2>Compact summary</h2>
        <p>Align start keeps each card at its natural content height.</p>
      </Card>
      <Card>
        <h2>Extended milestone notes</h2>
        <p>Review the latest draft and share feedback with the team.</p>
        <p>Track open questions before the release readiness check.</p>
      </Card>
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByTestId("aligned-grid");
    expect(getComputedStyle(grid).gap).toBe("8px");
    expect(getComputedStyle(grid).alignItems).toBe("start");
    const [first, second] = canvas
      .getAllByRole("article")
      .map((card) => card.getBoundingClientRect());
    if (!first || !second) throw new Error("Expected two cards");
    if (window.innerWidth > 480) {
      expect(first.top).toBeCloseTo(second.top, 0);
      expect(second.height).toBeGreaterThan(first.height);
    }
  },
};
export const Responsive: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "1rem" }}>
      {[280, 720, 1040].map((width) => (
        <div key={width} style={{ width, maxWidth: "100%" }}>
          <Grid data-testid={`grid-${width}`}>
            {["Website refresh", "Mobile checkout", "Help center"].map((name) => (
              <Card key={name}>
                <h2>{name}</h2>
              </Card>
            ))}
          </Grid>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const width of [280, 720, 1040]) {
      const grid = within(canvasElement).getByTestId(`grid-${width}`);
      const columns = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
      const available = grid.getBoundingClientRect().width;
      expect(columns).toBe(available >= 948 ? 3 : available >= 624 ? 2 : 1);
      expect(grid.scrollWidth).toBeLessThanOrEqual(Math.ceil(available));
    }
  },
};
