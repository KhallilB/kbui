import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Grid } from "../Grid/Grid";
import { Text } from "../Text/Text";
import { Inline } from "./Inline";

const meta = { title: "Layout/Inline", component: Inline, tags: ["autodocs"] } satisfies Meta<
  typeof Inline
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <Inline>
      <Button>Save changes</Button>
      <Button variant="secondary">Cancel</Button>
    </Inline>
  ),
};
export const Wrapping: Story = {
  render: () => (
    <div style={{ inlineSize: 240, maxInlineSize: "100%" }}>
      <Inline data-testid="wrapping-actions" gap="sm">
        <Button>Save changes</Button>
        <Button variant="secondary">Review changes</Button>
        <Button variant="ghost">Cancel</Button>
      </Inline>
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByTestId("wrapping-actions");
    const buttons = canvas.getAllByRole("button");
    const [first, second] = buttons;
    if (!first || !second) throw new Error("Expected actions");
    expect(second.getBoundingClientRect().top).toBeGreaterThan(first.getBoundingClientRect().top);
    expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth);
    first.focus();
    await userEvent.tab();
    expect(buttons[1]).toHaveFocus();
    await userEvent.tab();
    expect(buttons[2]).toHaveFocus();
  },
};
export const Alignment: Story = {
  render: () => (
    <Grid layout="stack">
      {(["start", "center", "end", "baseline", "stretch"] as const).map((align) => (
        <Inline key={align} align={align} justify="between">
          <Text size="lg">{align}</Text>
          <Text size="sm">Supporting content</Text>
        </Inline>
      ))}
    </Grid>
  ),
};
export const Gaps: Story = {
  render: () => (
    <Grid layout="stack">
      {(["none", "sm", "md", "lg"] as const).map((gap) => (
        <Inline key={gap} gap={gap}>
          <Text>{gap}</Text>
          <Text>First</Text>
          <Text>Second</Text>
        </Inline>
      ))}
    </Grid>
  ),
};
export const List: Story = {
  render: () => (
    <Inline as="ul" aria-label="Project disciplines" gap="lg">
      <li>Design</li>
      <li>Engineering</li>
      <li>Research</li>
    </Inline>
  ),
};
