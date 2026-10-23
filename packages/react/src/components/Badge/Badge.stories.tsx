import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Reviewer" },
  argTypes: {
    tone: { control: "select", options: ["neutral", "info", "success", "warning", "danger"] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = { display: "flex", flexWrap: "wrap", gap: 8 } as const;

export const Default: Story = {};
export const Mono: Story = { args: { mono: true, children: "writes" } };
export const Tones: Story = {
  render: (args) => (
    <div style={row}>
      {(["neutral", "info", "success", "warning", "danger"] as const).map((tone) => (
        <Badge {...args} key={tone} tone={tone}>
          {tone}
        </Badge>
      ))}
    </div>
  ),
};
export const TonesDark: Story = { ...Tones, globals: { theme: "dark" } };
