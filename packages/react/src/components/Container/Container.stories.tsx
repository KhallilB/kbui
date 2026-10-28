import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Grid } from "../Grid/Grid";
import { Heading } from "../Heading/Heading";
import { Inline } from "../Inline/Inline";
import { Link } from "../Link/Link";
import { Separator } from "../Separator/Separator";
import { Split } from "../Split/Split";
import { Text } from "../Text/Text";
import { Container } from "./Container";

const meta = { title: "Layout/Container", component: Container, tags: ["autodocs"] } satisfies Meta<
  typeof Container
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <Container>
      <Heading level={2}>Project workspace</Heading>
      <Text>Review active projects and shared updates.</Text>
    </Container>
  ),
};
export const Sizes: Story = {
  render: () => (
    <Grid layout="stack">
      {(["sm", "md", "lg", "full"] as const).map((size) => (
        <Container key={size} size={size}>
          <Text>{size} page width</Text>
          <Separator decorative />
        </Container>
      ))}
    </Grid>
  ),
};
export const Responsive: Story = {
  render: () => (
    <Grid layout="stack">
      {[280, 720, 1440].map((width) => (
        <div key={width} style={{ inlineSize: width, maxInlineSize: "100%" }}>
          <Container data-testid={`container-${width}`} size="sm">
            <Text>Content stays inside shared gutters.</Text>
          </Container>
        </div>
      ))}
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    for (const width of [280, 720, 1440]) {
      const container = within(canvasElement).getByTestId(`container-${width}`);
      const parent = container.parentElement;
      if (!parent) throw new Error("Expected width fixture");
      const bounds = container.getBoundingClientRect();
      const style = getComputedStyle(container);
      expect(bounds.width).toBeCloseTo(Math.min(parent.clientWidth, 640), 0);
      expect(bounds.left - parent.getBoundingClientRect().left).toBeCloseTo(
        (parent.clientWidth - bounds.width) / 2,
        0,
      );
      expect(parseFloat(style.paddingInlineStart)).toBeGreaterThanOrEqual(16);
      expect(style.paddingInlineStart).toBe(style.paddingInlineEnd);
      expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth);
    }
  },
};
export const Page: Story = {
  render: () => (
    <Container as="main">
      <Grid layout="stack">
        <Inline justify="between">
          <Heading level={1} size="lg">
            Workspace
          </Heading>
          <Inline gap="sm">
            <Link href="#layout-projects">Projects</Link>
            <Button size="sm">New project</Button>
          </Inline>
        </Inline>
        <Separator />
        <Split ratio="wide-start">
          <section aria-labelledby="layout-projects">
            <Grid layout="stack">
              <Heading level={2} id="layout-projects" size="md">
                Projects
              </Heading>
              <Text>
                Keep shared gutters at the page boundary. Compose sections with intrinsic layouts.
              </Text>
              <Inline gap="sm">
                <Button>Open project</Button>
                <Button variant="secondary">View activity</Button>
              </Inline>
            </Grid>
          </section>
          <aside aria-label="Project context">
            <Grid layout="stack">
              <Heading level={2} size="sm">
                At a glance
              </Heading>
              <Text tone="muted">
                Secondary context follows primary content when columns collapse.
              </Text>
            </Grid>
          </aside>
        </Split>
      </Grid>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("main")).toBeVisible();
    const frame = canvas.getByRole("main").closest(".component-preview");
    expect(frame).toHaveAttribute("data-component", "container");
    expect(frame).toHaveAttribute("data-layout", "layout");
    expect(canvas.getByRole("complementary", { name: "Project context" })).toBeVisible();
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
