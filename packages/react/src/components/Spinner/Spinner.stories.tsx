import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";
import { Button } from "../Button/Button";
import { Inline } from "../Inline/Inline";
import { Spinner, type SpinnerSize, type SpinnerTone } from "./Spinner";

const sizes: SpinnerSize[] = ["sm", "md", "lg"];
const tones: SpinnerTone[] = ["accent", "neutral", "info", "success", "warning", "danger"];

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  args: {
    label: "Loading workspace",
    size: "md",
    tone: "accent",
    showLabel: false,
  },
  argTypes: {
    size: { control: "select", options: sizes },
    tone: { control: "select", options: ["current", ...tones] },
    showLabel: { control: "boolean" },
    decorative: { control: "boolean" },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const spinner = canvasElement.querySelector<HTMLElement>(".kb-spinner");
    expect(spinner).not.toBeNull();
    expect(spinner?.getAttribute("role")).toBe("status");
  },
};

export const WithVisibleLabel: Story = {
  args: {
    label: "Reindexing search catalog…",
    showLabel: true,
    tone: "info",
  },
};

export const BusyButton: Story = {
  render: () => {
    const [saving, setSaving] = useState(true);
    return (
      <Inline gap="sm" align="center">
        <Button disabled={saving} onClick={() => setSaving(true)}>
          {saving ? <Spinner decorative size="sm" tone="current" /> : null}
          {saving ? "Deploying release…" : "Deploy release"}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setSaving((prev) => !prev)}>
          {saving ? "Mark complete" : "Simulate busy"}
        </Button>
      </Inline>
    );
  },
  play: async ({ canvasElement }) => {
    const decorativeSpinner = canvasElement.querySelector<HTMLElement>(".kb-button .kb-spinner");
    expect(decorativeSpinner).not.toBeNull();
    expect(decorativeSpinner?.getAttribute("aria-hidden")).toBe("true");
  },
};

export const SizesAndTones: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      <Inline gap="md" align="center">
        {sizes.map((size) => (
          <Spinner key={size} size={size} label={`Size ${size}`} showLabel />
        ))}
      </Inline>
      <Inline gap="md" align="center">
        {tones.map((tone) => (
          <Spinner key={tone} tone={tone} label={tone} showLabel />
        ))}
      </Inline>
    </div>
  ),
};
