import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";
import { Button } from "../Button/Button";
import { Card } from "../Card/Card";
import { Heading } from "../Heading/Heading";
import { Inline } from "../Inline/Inline";
import { Spinner } from "../Spinner/Spinner";
import { Status } from "../Status/Status";
import { Text } from "../Text/Text";
import { Skeleton } from "./Skeleton";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  args: {
    variant: "text",
    size: "md",
    lines: 3,
    animated: true,
    animation: "shimmer",
    tone: "default",
    loading: true,
  },
  argTypes: {
    variant: { control: "select", options: ["text", "rect", "circle", "pill"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    animation: { control: "select", options: ["shimmer", "pulse", "wave", "none"] },
    tone: { control: "select", options: ["default", "subtle", "accent"] },
    lines: { control: { type: "number", min: 1, max: 6 } },
    animated: { control: "boolean" },
    loading: { control: "boolean" },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

const box = { width: "100%" } as const;

export const Default: Story = {
  render: (args) => (
    <div style={box}>
      <Skeleton {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(".kb-skeleton");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("aria-hidden")).toBe("true");
    expect(canvasElement.querySelectorAll(".kb-skeleton-line").length).toBe(3);
  },
};

export const WaveAndPulse: Story = {
  render: () => (
    <div style={{ ...box, display: "grid", gap: "1rem" }}>
      <Card aria-busy="true" aria-label="Synthesizing deployment report">
        <div style={{ display: "grid", gap: "0.875rem" }}>
          <Inline justify="between" align="center">
            <Spinner
              variant="orbit"
              appearance="pill"
              tone="accent"
              size="sm"
              label="Synthesizing release brief…"
              showLabel
            />
            <Skeleton variant="pill" size="sm" tone="accent" animation="pulse" />
          </Inline>
          <Skeleton variant="text" lines={3} animation="wave" tone="accent" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Skeleton variant="rect" height="3.75rem" animation="shimmer" tone="subtle" />
            <Skeleton variant="rect" height="3.75rem" animation="pulse" tone="subtle" />
          </div>
        </div>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector('[data-animation="wave"]')).not.toBeNull();
    expect(canvasElement.querySelector('[data-animation="pulse"]')).not.toBeNull();
    expect(canvasElement.querySelector('[data-tone="accent"]')).not.toBeNull();
  },
};

export const CardPlaceholder: Story = {
  render: () => (
    <div style={box}>
      <Card aria-busy="true" aria-label="Loading release summary">
        <div style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Skeleton variant="circle" size="md" />
            <div style={{ flex: 1, minWidth: 0, display: "grid", gap: "0.375rem" }}>
              <Skeleton variant="text" size="md" width="55%" />
              <Skeleton variant="text" size="sm" width="35%" />
            </div>
            <Skeleton variant="pill" size="sm" />
          </div>
          <Skeleton variant="rect" height="4.5rem" />
          <Skeleton variant="text" lines={2} size="sm" animation="wave" />
        </div>
      </Card>
    </div>
  ),
};

export const ShapesAndSizes: Story = {
  render: () => (
    <div style={{ ...box, display: "grid", gap: "1rem" }}>
      <Inline gap="md" align="center">
        <Skeleton variant="circle" size="sm" />
        <Skeleton variant="circle" size="md" />
        <Skeleton variant="circle" size="lg" />
        <Skeleton variant="pill" size="sm" />
        <Skeleton variant="pill" size="md" />
      </Inline>
      <Skeleton variant="rect" height="4rem" />
      <Skeleton variant="text" lines={2} />
    </div>
  ),
};

export const ContentTransition: Story = {
  render: () => {
    const [loading, setLoading] = useState(true);
    return (
      <div style={{ ...box, display: "grid", gap: "0.75rem" }}>
        <Inline justify="between" align="center">
          <Status tone={loading ? "running" : "success"} appearance="chip" live>
            {loading ? "Fetching metrics…" : "Metrics ready"}
          </Status>
          <Button variant="secondary" size="sm" onClick={() => setLoading((prev) => !prev)}>
            {loading ? "Reveal content" : "Show skeleton"}
          </Button>
        </Inline>
        <Card aria-busy={loading}>
          <Skeleton loading={loading} lines={3} animation="wave">
            <div style={{ display: "grid", gap: "0.25rem" }}>
              <Heading level={3} size="sm">
                Ingestion throughput
              </Heading>
              <Text size="sm" tone="muted">
                99.98% of queued events processed within the 250ms target window over the last 24
                hours.
              </Text>
            </div>
          </Skeleton>
        </Card>
      </div>
    );
  },
};
