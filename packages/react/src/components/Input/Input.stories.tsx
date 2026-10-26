import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: { label: "Email", placeholder: "you@example.com" },
  argTypes: { size: { control: "select", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescription: Story = { args: { description: "We never share it." } };
export const WithError: Story = { args: { error: "Email is required." } };
export const Disabled: Story = { args: { disabled: true } };
export const HiddenLabel: Story = {
  args: { label: "Search", visuallyHidden: true, placeholder: "Search" },
};
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16, width: "100%" }}>
      <Input {...args} label="Small" size="sm" />
      <Input {...args} label="Medium" size="md" />
      <Input {...args} label="Large" size="lg" />
    </div>
  ),
};
