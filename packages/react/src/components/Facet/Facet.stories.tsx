import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Status } from "../Status/Status";
import { Facet, type FacetProps } from "./Facet";

const meta = {
  title: "Components/Facet",
  component: Facet,
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "select", options: ["quiet", "default", "active", "critical"] },
    cut: { control: "select", options: ["none", "start", "end"] },
    rail: { control: "select", options: ["none", "accent", "status"] },
    density: { control: "select", options: ["compact", "standard"] },
  },
  args: { tone: "default", cut: "none", rail: "none", density: "standard" },
} satisfies Meta<typeof Facet>;

export default meta;
type Story = StoryObj<typeof meta>;

function Sample({ id, title, ...args }: FacetProps & { id: string; title: string }) {
  return (
    <Facet {...args} aria-labelledby={`${id}-title`} style={{ width: 320 }}>
      <Facet.Header>
        <h3 id={`${id}-title`}>{title}</h3>
        <Status tone={args.tone === "critical" ? "blocked" : "neutral"}>
          {args.tone === "critical" ? "Blocked" : "Idle"}
        </Status>
      </Facet.Header>
      <Facet.Body>One clipped corner marks the boundary; the seam stays quiet.</Facet.Body>
      <Facet.Footer>
        <Button variant="ghost" size="sm">
          Details
        </Button>
      </Facet.Footer>
    </Facet>
  );
}

const row = { display: "flex", flexWrap: "wrap", gap: 16 } as const;

export const Default: Story = {
  render: (args) => <Sample {...args} id="default" title="Default facet" />,
};

export const Tones: Story = {
  render: (args) => (
    <div style={row}>
      {(["quiet", "default", "active", "critical"] as const).map((tone) => (
        <Sample {...args} key={tone} id={tone} tone={tone} title={`Tone ${tone}`} />
      ))}
    </div>
  ),
};

export const Cuts: Story = {
  render: (args) => (
    <div style={row}>
      {(["none", "start", "end"] as const).map((cut) => (
        <Sample {...args} key={cut} id={`cut-${cut}`} cut={cut} title={`Cut ${cut}`} />
      ))}
    </div>
  ),
};

export const Rails: Story = {
  render: (args) => (
    <div style={row}>
      <Sample {...args} id="rail-accent" rail="accent" title="Rail accent" />
      <Sample {...args} id="rail-status-active" rail="status" tone="active" title="Rail status" />
      <Sample
        {...args}
        id="rail-status-critical"
        rail="status"
        tone="critical"
        title="Rail status, critical"
      />
    </div>
  ),
};

export const Compact: Story = {
  args: { density: "compact", cut: "end" },
  render: (args) => <Sample {...args} id="compact" title="Compact facet" />,
};

/** The focus ring must stay whole: the clip lives on ::before, never on the root. */
export const FocusInsideCut: Story = {
  args: { cut: "start", rail: "accent", tone: "active" },
  render: (args) => (
    <Facet {...args} aria-labelledby="focus-title" style={{ width: 320 }}>
      <Facet.Header>
        <h3 id="focus-title">Focus stays visible</h3>
      </Facet.Header>
      <Facet.Body>
        <Button size="sm">Retry</Button>
      </Facet.Body>
    </Facet>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Retry" });
    button.focus();
    await expect(button).toHaveFocus();
    const root = canvasElement.querySelector(".kb-facet") as HTMLElement;
    expect(getComputedStyle(root).clipPath).toBe("none");
    expect(getComputedStyle(root, "::before").clipPath).not.toBe("none");
    expect(getComputedStyle(root, "::before").pointerEvents).toBe("none");
    const outer = root.getBoundingClientRect();
    const inner = button.getBoundingClientRect();
    expect(inner.left).toBeGreaterThanOrEqual(outer.left);
    expect(inner.right).toBeLessThanOrEqual(outer.right);
    expect(inner.top).toBeGreaterThanOrEqual(outer.top);
    expect(inner.bottom).toBeLessThanOrEqual(outer.bottom);
  },
};

export const Dark: Story = {
  globals: { theme: "dark" },
  render: (args) => (
    <div style={row}>
      {(["quiet", "default", "active", "critical"] as const).map((tone) => (
        <Sample {...args} key={tone} id={`dark-${tone}`} tone={tone} cut="start" title={tone} />
      ))}
    </div>
  ),
};
