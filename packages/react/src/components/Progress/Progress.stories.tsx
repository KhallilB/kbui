import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "./Progress";

const meta = {
  title: "Components/Progress",
  component: Progress,
  tags: ["autodocs"],
  args: { label: "Build", value: 40 },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

const box = { width: "100%" } as const;

export const Default: Story = {
  render: (args) => (
    <div style={box}>
      <Progress {...args} />
    </div>
  ),
};
export const Steps: Story = {
  args: { label: "Step 3: cargo check", value: 3, max: 5, valueText: "3 of 5" },
  render: (args) => (
    <div style={box}>
      <Progress {...args} />
    </div>
  ),
};
export const Complete: Story = {
  args: { label: "Build", value: 100 },
  render: (args) => (
    <div style={box}>
      <Progress {...args} />
    </div>
  ),
};
export const StepsDark: Story = { ...Steps, globals: { theme: "dark" } };
