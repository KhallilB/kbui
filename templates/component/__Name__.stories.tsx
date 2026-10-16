import type { Meta, StoryObj } from "@storybook/react-vite";
import { __Name__ } from "./__Name__";

const meta = {
  title: "Components/__Name__",
  component: __Name__,
  tags: ["autodocs"],
  args: { children: "__Name__" },
} satisfies Meta<typeof __Name__>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
