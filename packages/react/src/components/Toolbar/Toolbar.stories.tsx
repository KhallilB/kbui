import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toolbar } from "./Toolbar";

const meta = {
  title: "Components/Toolbar",
  component: Toolbar,
  tags: ["autodocs"],
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Toolbar aria-label="Worker actions">
      <Toolbar.Group>
        <Toolbar.Button>Copy</Toolbar.Button>
        <Toolbar.Button>Open log</Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Button variant="danger">Stop</Toolbar.Button>
    </Toolbar>
  ),
};
export const DefaultDark: Story = {
  tags: ["!dev", "!autodocs"],
  ...Default,
  globals: { theme: "dark" },
};
