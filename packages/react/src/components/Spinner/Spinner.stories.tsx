import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";
import { Button } from "../Button/Button";
import { Inline } from "../Inline/Inline";
import {
  Spinner,
  type SpinnerAppearance,
  type SpinnerSize,
  type SpinnerTone,
  type SpinnerVariant,
} from "./Spinner";

const sizes: SpinnerSize[] = ["sm", "md", "lg"];
const tones: SpinnerTone[] = ["accent", "neutral", "info", "success", "warning", "danger"];
const variants: SpinnerVariant[] = ["ring", "orbit", "dots", "bars"];
const appearances: SpinnerAppearance[] = ["plain", "pill"];

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  args: {
    label: "Loading workspace",
    size: "md",
    tone: "accent",
    variant: "ring",
    appearance: "plain",
    showLabel: false,
  },
  argTypes: {
    size: { control: "select", options: sizes },
    tone: { control: "select", options: ["current", ...tones] },
    variant: { control: "select", options: variants },
    appearance: { control: "select", options: appearances },
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

export const FancyVariants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      <Inline gap="md" align="center">
        <Spinner variant="ring" tone="accent" label="Ring" showLabel />
        <Spinner variant="orbit" tone="info" label="Dual orbit" showLabel />
        <Spinner variant="dots" tone="success" label="Wave dots" showLabel />
        <Spinner variant="bars" tone="warning" label="Telemetry bars" showLabel />
      </Inline>
      <Inline gap="sm" align="center">
        <Spinner
          variant="orbit"
          appearance="pill"
          tone="accent"
          label="Synthesizing index…"
          showLabel
        />
        <Spinner variant="dots" appearance="pill" tone="info" label="Streaming events…" showLabel />
        <Spinner variant="bars" appearance="pill" tone="success" label="Replaying log…" showLabel />
      </Inline>
    </div>
  ),
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector('[data-variant="orbit"]')).not.toBeNull();
    expect(canvasElement.querySelector('[data-variant="dots"]')).not.toBeNull();
    expect(canvasElement.querySelector('[data-variant="bars"]')).not.toBeNull();
    expect(canvasElement.querySelector('[data-appearance="pill"]')).not.toBeNull();
  },
};

export const WithVisibleLabel: Story = {
  args: {
    label: "Reindexing search catalog…",
    showLabel: true,
    tone: "info",
    variant: "orbit",
    appearance: "pill",
  },
};

export const BusyButton: Story = {
  render: () => {
    const [saving, setSaving] = useState(true);
    return (
      <Inline gap="sm" align="center">
        <Button disabled={saving} onClick={() => setSaving(true)}>
          {saving ? <Spinner decorative size="sm" tone="current" variant="orbit" /> : null}
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
