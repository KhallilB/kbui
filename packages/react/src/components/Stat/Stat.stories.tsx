import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stat } from "./Stat";

const meta = {
  title: "Components/Stat",
  component: Stat,
  tags: ["autodocs"],
  args: { label: "Elapsed", value: "04:12" },
  argTypes: { size: { control: "select", options: ["md", "display"] } },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Display: Story = { args: { size: "display" } };
export const Row: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 32 }}>
      <Stat label="Running" value={1} />
      <Stat label="Blocked" value={1} />
      <Stat label="Finished" value={3} />
    </div>
  ),
};
export const DisplayDark: Story = { ...Display, globals: { theme: "dark" } };
