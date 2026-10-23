import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollArea } from "./ScrollArea";

const lines = Array.from({ length: 40 }, (_, i) => `line ${i + 1}: compiling package ${i % 7}`);

const meta = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  args: {
    label: "Output",
    maxHeight: "12rem",
    children: (
      <pre style={{ margin: 0, fontFamily: "var(--kb-font-mono)", fontSize: 12 }}>
        {lines.join("\n")}
      </pre>
    ),
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 360 }}>
      <ScrollArea {...args} />
    </div>
  ),
};
export const DefaultDark: Story = { ...Default, globals: { theme: "dark" } };
