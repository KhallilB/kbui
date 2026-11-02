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
const variantLabels: Record<SpinnerVariant, string> = {
  ring: "Ring",
  orbit: "Orbit",
  dots: "Dots",
  bars: "Bars",
};
const variants = Object.keys(variantLabels) as SpinnerVariant[];
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

const expectMotion = (canvasElement: HTMLElement) => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  for (const spinner of canvasElement.querySelectorAll(".kb-spinner")) {
    expect(spinner.getAnimations({ subtree: true }).length > 0).toBe(!reducedMotion);
  }
};

export const Variants: Story = {
  render: () => (
    <Inline gap="lg" align="center">
      {variants.map((variant) => (
        <Spinner
          key={variant}
          variant={variant}
          size="lg"
          label={variantLabels[variant]}
          showLabel
        />
      ))}
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    for (const variant of variants) {
      expect(canvasElement.querySelector(`[data-variant="${variant}"]`)).not.toBeNull();
    }
    expectMotion(canvasElement);
  },
};

export const Pill: Story = {
  render: () => (
    <Inline gap="sm" align="center">
      <Spinner variant="orbit" appearance="pill" label="Saving changes…" showLabel />
      <Spinner variant="dots" appearance="pill" tone="info" label="Uploading files…" showLabel />
      <Spinner variant="bars" appearance="pill" tone="success" label="Syncing data…" showLabel />
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelectorAll('[data-appearance="pill"]')).toHaveLength(3);
    expectMotion(canvasElement);
  },
};

export const WithLabel: Story = {
  args: {
    label: "Updating search index…",
    showLabel: true,
  },
};

export const BusyButton: Story = {
  render: () => {
    const [saving, setSaving] = useState(true);
    return (
      <Inline gap="sm" align="center">
        <Button disabled={saving} onClick={() => setSaving(true)}>
          {saving ? <Spinner decorative size="sm" tone="current" variant="orbit" /> : null}
          {saving ? "Publishing…" : "Publish"}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setSaving((prev) => !prev)}>
          {saving ? "Finish" : "Start"}
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
          <Spinner key={size} size={size} label={size} showLabel />
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
