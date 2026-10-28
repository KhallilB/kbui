import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
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
export const Mono: Story = {
  args: { mono: true, children: "writes" },
  play: async ({ canvasElement }) => {
    const badge = canvasElement.querySelector<HTMLElement>(".kb-badge");
    expect(badge?.innerText).toBe("WRITES");
  },
};

// Branch names and paths are case-sensitive; uppercasing would change them.
export const PlainMonoPreserveCase: Story = {
  args: { appearance: "plain", mono: true, preserveCase: true, children: "feat/control-room" },
  play: async ({ canvasElement }) => {
    const badge = canvasElement.querySelector<HTMLElement>(".kb-badge");
    expect(badge?.innerText).toBe("feat/control-room");
    expect(badge && getComputedStyle(badge).fontFamily).toMatch(/mono/i);
  },
};
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
export const TonesDark: Story = {
  tags: ["!dev", "!autodocs"],
  ...Tones,
  globals: { theme: "dark" },
};
export const PlainMono: Story = {
  args: { appearance: "plain", mono: true, children: "production · read/write" },
};
