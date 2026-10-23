import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Status } from "../Status/Status";
import { Facet, type FacetProps } from "./Facet";

const meta = {
  title: "Components/Facet",
  component: Facet,
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "select", options: ["quiet", "default", "active", "critical"] },
    cut: { control: "select", options: ["none", "start", "end", "both"] },
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
      {(["none", "start", "end", "both"] as const).map((cut) => (
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

/** Optional hooks --kb-facet-cut-start and --kb-facet-cut-end override --kb-facet-cut per side; the seam follows the edge. */
export const Geometry: Story = {
  args: { cut: "both", tone: "active" },
  render: (args) => (
    <div style={row}>
      <Sample {...args} id="geo-default" title="Token depth" />
      <div style={{ "--kb-facet-cut-start": "2rem", "--kb-facet-cut-end": "0.5rem" } as object}>
        <Sample {...args} id="geo-custom" title="Deep start, shallow end" />
      </div>
    </div>
  ),
};

/** A wrapper-scoped --kb-facet-cut must reach the facet; per-side names stay optional hooks. */
export const ScopedCut: Story = {
  args: { cut: "both" },
  render: (args) => (
    <div style={{ "--kb-facet-cut": "2rem" } as object}>
      <Sample {...args} id="scoped-cut" title="Scoped cut" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const facet = canvasElement.querySelector(".kb-facet") as HTMLElement;
    expect(getComputedStyle(facet, "::before").clipPath).toContain("32px 0px");
  },
};

export const Toolbar: Story = {
  render: (args) => (
    <Facet {...args} aria-labelledby="toolbar-title" style={{ width: 360 }}>
      <Facet.Header>
        <h3 id="toolbar-title">With toolbar</h3>
        <Facet.Toolbar>
          <Button variant="ghost" size="sm">
            Filter
          </Button>
          <Button variant="secondary" size="sm">
            Export
          </Button>
        </Facet.Toolbar>
      </Facet.Header>
      <Facet.Body>Header actions sit in a toolbar at the inline end.</Facet.Body>
    </Facet>
  ),
};

export const Collapsible: Story = {
  args: { cut: "end" },
  render: (args) => (
    <Facet
      {...args}
      collapsible
      defaultOpen
      aria-labelledby="collapse-title"
      style={{ width: 360 }}
    >
      <Facet.Header>
        <h3 id="collapse-title">Collapsible body</h3>
        <Facet.Toggle>Toggle</Facet.Toggle>
      </Facet.Header>
      <Facet.Body>Only the body collapses; header and footer stay.</Facet.Body>
      <Facet.Footer>
        <Status>Idle</Status>
      </Facet.Footer>
    </Facet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: "Toggle" });
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(canvas.queryByText(/Only the body/)).toBeNull();
    await userEvent.click(toggle);
    await expect(canvas.getByText(/Only the body/)).toBeVisible();
  },
};

export const Nested: Story = {
  render: (args) => (
    <Facet {...args} cut="start" aria-labelledby="outer-title" style={{ width: 420 }}>
      <Facet.Header>
        <h3 id="outer-title">Outer</h3>
      </Facet.Header>
      <Facet.Body>
        <Facet tone="quiet" aria-labelledby="inner-a">
          <Facet.Header>
            <h4 id="inner-a">Inner, quiet</h4>
          </Facet.Header>
          <Facet.Body>Nested facets tighten their padding.</Facet.Body>
        </Facet>
      </Facet.Body>
    </Facet>
  ),
};

export const Group: Story = {
  render: (args) => (
    <Facet.Group direction="row" style={{ width: 720 }}>
      <Sample {...args} id="g1" title="First" cut="start" />
      <Sample {...args} id="g2" title="Second" tone="active" />
      <Sample {...args} id="g3" title="Third" cut="end" />
    </Facet.Group>
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
        <Sample {...args} key={tone} id={`dark-${tone}`} tone={tone} cut="both" title={tone} />
      ))}
    </div>
  ),
};
