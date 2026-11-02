import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Avatar } from "../Avatar/Avatar";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Card } from "../Card/Card";
import { Heading } from "../Heading/Heading";
import { Inline } from "../Inline/Inline";
import { Stack } from "../Stack/Stack";
import { Status } from "../Status/Status";
import { Text } from "../Text/Text";
import { Skeleton, type SkeletonAnimation, type SkeletonTone } from "./Skeleton";

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
    variant: { control: "select", options: ["text", "rect", "circle", "pill", "auto"] },
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

const animationLabels: Record<Exclude<SkeletonAnimation, "none">, string> = {
  shimmer: "Shimmer",
  pulse: "Pulse",
  wave: "Wave",
};
const toneLabels: Record<SkeletonTone, string> = {
  default: "Default",
  subtle: "Subtle",
  accent: "Accent",
};

const expectMotion = (canvasElement: HTMLElement) => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  for (const skeleton of canvasElement.querySelectorAll(".kb-skeleton")) {
    expect(skeleton.getAnimations({ subtree: true }).length > 0).toBe(!reducedMotion);
  }
};

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

export const Animations: Story = {
  render: () => (
    <Stack gap="md" style={box}>
      {Object.entries(animationLabels).map(([animation, label]) => (
        <Stack key={animation} gap="sm">
          <Text size="sm" tone="muted">
            {label}
          </Text>
          <Skeleton lines={3} animation={animation as SkeletonAnimation} />
        </Stack>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    for (const animation of Object.keys(animationLabels)) {
      expect(canvasElement.querySelector(`[data-animation="${animation}"]`)).not.toBeNull();
    }
    expectMotion(canvasElement);
  },
};

export const Tones: Story = {
  render: () => (
    <Stack gap="md" style={box}>
      {Object.entries(toneLabels).map(([tone, label]) => (
        <Stack key={tone} gap="sm">
          <Text size="sm" tone="muted">
            {label}
          </Text>
          <Skeleton lines={2} tone={tone as SkeletonTone} />
        </Stack>
      ))}
    </Stack>
  ),
};

export const ProfileCard: Story = {
  render: () => (
    <div style={box}>
      <Card aria-busy="true" aria-label="Loading profile">
        <Stack gap="md">
          <Inline gap="md" align="center">
            <Skeleton variant="circle" size="md" />
            <Stack gap="sm" style={{ flex: 1, minWidth: 0 }}>
              <Skeleton variant="text" size="md" width="55%" />
              <Skeleton variant="text" size="sm" width="35%" />
            </Stack>
            <Skeleton variant="pill" size="sm" />
          </Inline>
          <Skeleton variant="rect" height="4.5rem" />
          <Skeleton variant="text" lines={2} size="sm" />
        </Stack>
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
            {loading ? "Loading metrics…" : "Metrics loaded"}
          </Status>
          <Button variant="secondary" size="sm" onClick={() => setLoading((prev) => !prev)}>
            {loading ? "Finish loading" : "Load again"}
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

const ada = {
  name: "Ada Lovelace",
  role: "Staff engineer",
  team: "Platform",
  bio: "Leads the build and release tooling used by every product team.",
};

function PersonCard({ person }: { person?: typeof ada | undefined }) {
  return (
    <Card>
      <Stack gap="md">
        <Inline gap="md" align="center">
          <Avatar size="lg" name={person?.name ?? ""} decorative />
          <Stack gap="sm" style={{ flex: 1, minWidth: 0 }}>
            <Heading level={3} size="sm">
              {person?.name}
            </Heading>
            <Text size="sm" tone="muted">
              {person?.role}
            </Text>
          </Stack>
          <Badge>{person?.team}</Badge>
        </Inline>
        <Text>{person?.bio}</Text>
        <Inline gap="sm">
          <Button size="sm">Follow</Button>
          <Button size="sm" variant="secondary">
            Message
          </Button>
        </Inline>
      </Stack>
    </Card>
  );
}

export const Auto: Story = {
  render: () => {
    const [loading, setLoading] = useState(true);
    return (
      <Stack gap="sm" style={box}>
        <Inline justify="end">
          <Button variant="secondary" size="sm" onClick={() => setLoading((prev) => !prev)}>
            {loading ? "Finish loading" : "Load again"}
          </Button>
        </Inline>
        <Skeleton variant="auto" loading={loading} label="Loading profile">
          <PersonCard person={loading ? undefined : ada} />
        </Skeleton>
      </Stack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvasElement.querySelector<HTMLElement>(".kb-skeleton-content");
    expect(content?.inert).toBe(true);
    expect(canvas.getByRole("status")).toHaveTextContent("Loading profile");

    // Empty fields still reserve a visible placeholder.
    for (const selector of [".kb-heading", ".kb-text", ".kb-badge", ".kb-avatar"]) {
      const rect = content?.querySelector(selector)?.getBoundingClientRect();
      expect(rect?.width).toBeGreaterThan(0);
      expect(rect?.height).toBeGreaterThan(0);
    }
    const follow = content?.querySelector<HTMLElement>(".kb-button");
    expect(follow && getComputedStyle(follow).color).toBe("rgba(0, 0, 0, 0)");
    expectMotion(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Finish loading" }));
    expect(content?.inert).toBe(false);
    expect(canvas.queryByRole("status")).toBeNull();
    expect(canvas.getByRole("heading", { name: "Ada Lovelace" })).toBeVisible();
    // Controls ease their color back in.
    await waitFor(() =>
      expect(follow && getComputedStyle(follow).color).not.toBe("rgba(0, 0, 0, 0)"),
    );
  },
};
