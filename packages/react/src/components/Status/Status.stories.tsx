import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Status, type StatusTone } from "./Status";

const tones: StatusTone[] = ["neutral", "info", "running", "success", "warning", "blocked"];
const labels: Record<StatusTone, string> = {
  neutral: "Idle",
  info: "Queued",
  running: "Running",
  success: "Passed",
  warning: "Degraded",
  blocked: "Blocked",
};

/** Sample caller-provided icon; kbui ships none. */
function Dot() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="8" r="5" />
    </svg>
  );
}

const meta = {
  title: "Components/Status",
  component: Status,
  tags: ["autodocs"],
  args: { children: "Idle", tone: "neutral" },
  argTypes: {
    tone: { control: "select", options: tones },
    appearance: { control: "select", options: ["plain", "chip"] },
    icon: { control: false },
  },
} satisfies Meta<typeof Status>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = { display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" } as const;

export const Default: Story = {};

export const Tones: Story = {
  render: (args) => (
    <div style={row}>
      {tones.map((tone) => (
        <Status {...args} key={tone} tone={tone}>
          {labels[tone]}
        </Status>
      ))}
    </div>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <div style={row}>
      {tones.map((tone) => (
        <Status {...args} key={tone} tone={tone} icon={<Dot />}>
          {labels[tone]}
        </Status>
      ))}
    </div>
  ),
};

export const Compact: Story = {
  render: (args) => (
    <div style={row}>
      {tones.map((tone) => (
        <Status {...args} key={tone} tone={tone} compact icon={<Dot />}>
          {labels[tone]}
        </Status>
      ))}
    </div>
  ),
};

function chips(canvasElement: HTMLElement) {
  const found = [...canvasElement.querySelectorAll<HTMLElement>(".kb-status")];
  expect(found).toHaveLength(tones.length);
  return found;
}

/** Chip tints each tone from its own ink; text and icon stay the signal. */
export const Chip: Story = {
  args: { appearance: "chip" },
  render: (args) => (
    <div style={row}>
      {tones.map((tone) => (
        <Status {...args} key={tone} tone={tone} icon={<Dot />}>
          {labels[tone]}
        </Status>
      ))}
    </div>
  ),
  // Icon replaces the dot: no bullet, icon sits flush with the inline padding.
  play: async ({ canvasElement }) => {
    for (const chip of chips(canvasElement)) {
      const icon = chip.querySelector<HTMLElement>(".kb-status-icon");
      if (!icon) throw new Error("Missing status icon");
      const style = getComputedStyle(chip);
      expect(getComputedStyle(chip, "::before").content).toBe("none");
      expect(style.paddingInlineStart).toBe(style.paddingInlineEnd);
      const inset = Number.parseFloat(style.borderLeftWidth) + Number.parseFloat(style.paddingLeft);
      expect(icon.getBoundingClientRect().left - chip.getBoundingClientRect().left).toBeCloseTo(
        inset,
        1,
      );
    }
  },
};

/** Without an icon, the chip leads with a dot in the tone's ink. */
export const ChipWithoutIcon: Story = {
  args: { appearance: "chip" },
  render: (args) => (
    <div style={row}>
      {tones.map((tone) => (
        <Status {...args} key={tone} tone={tone}>
          {labels[tone]}
        </Status>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const chip of chips(canvasElement)) {
      const dot = getComputedStyle(chip, "::before");
      expect(dot.content).toBe('""');
      expect(dot.borderRadius).toBe("50%");
    }
  },
};

/** live only adds role="status"; assistive tech announces changes to the text. */
export const Live: Story = {
  args: { live: true, tone: "running", children: "Running", icon: <Dot /> },
};
