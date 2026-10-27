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
      {["First", "Second", "Third"].map((name) => (
        <Card key={name}>
          <h2>{name}</h2>
          <p>Content in equal columns.</p>
        </Card>
      ))}
    </Grid>
  ),
};
export const Dark: Story = {
  tags: ["!dev", "!autodocs"],
  ...Default,
  globals: { theme: "dark" },
};
export const StackedList: Story = {
  render: () => (
    <Grid as="ul" layout="stack" aria-label="Projects">
      <Card as="li" appearance="plain">
        First
      </Card>
      <Card as="li" appearance="plain">
        Second
      </Card>
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("list", { name: "Projects" })).toBeVisible();
    expect(canvas.getAllByRole("listitem")).toHaveLength(2);
    const items = canvas.getAllByRole("listitem").map((item) => item.getBoundingClientRect());
    const [first, second] = items;
    if (!first || !second) throw new Error("Expected two list items");
    expect(second.top).toBeGreaterThan(first.bottom);
  },
};
export const Responsive: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "1rem" }}>
      {[280, 720, 1040].map((width) => (
        <div key={width} style={{ width, maxWidth: "100%" }}>
          <Grid data-testid={`grid-${width}`}>
            {["First", "Second", "Third"].map((name) => (
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
