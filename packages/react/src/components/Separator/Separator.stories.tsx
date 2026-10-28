import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Inline } from "../Inline/Inline";
import { Text } from "../Text/Text";
import { Separator } from "./Separator";

const meta = { title: "Layout/Separator", component: Separator, tags: ["autodocs"] } satisfies Meta<
  typeof Separator
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <div>
      <Text>Project overview</Text>
      <Separator />
      <Text>Activity</Text>
    </div>
  ),
};
export const Vertical: Story = {
  render: () => (
    <Inline>
      <Text>Projects</Text>
      <Separator orientation="vertical" />
      <Text>Activity</Text>
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    const separator = within(canvasElement).getByRole("separator");
    const bounds = separator.getBoundingClientRect();
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
    expect(bounds.height).toBeGreaterThanOrEqual(16);
    expect(bounds.width).toBe(1);
  },
};
export const Decorative: Story = {
  render: () => (
    <Inline>
      <Text>Updated today</Text>
      <Separator orientation="vertical" decorative />
      <Text>Three contributors</Text>
    </Inline>
  ),
};
