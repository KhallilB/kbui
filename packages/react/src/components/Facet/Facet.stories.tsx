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
    tone: { control: "select", options: ["quiet", "default", "sunken", "active", "critical"] },
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
      {(["quiet", "default", "sunken", "active", "critical"] as const).map((tone) => (
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

/** Per-side depth comes from --kb-facet-cut-start and --kb-facet-cut-end; the seam follows the edge. */
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

function expectDepth(canvas: HTMLElement) {
  const facets = [...canvas.querySelectorAll<HTMLElement>(".kb-facet:not([data-nested])")];
  expect(facets.length).toBeGreaterThan(0);
  for (const facet of facets) {
    expect(getComputedStyle(facet).clipPath).toBe("none");
    expect(getComputedStyle(facet).filter).toBe("none");
    const frame = facet.querySelector<HTMLElement>(":scope > .kb-facet-frame");
    const plate = frame?.querySelector<HTMLElement>(".kb-facet-plate");
    expect(frame && getComputedStyle(frame).filter).toContain("drop-shadow");
    expect(frame && getComputedStyle(frame).pointerEvents).toBe("none");
    expect(plate && getComputedStyle(plate).backgroundImage).toContain("linear-gradient");
    expect(plate && getComputedStyle(plate).clipPath).toContain("polygon");
    const header = facet.querySelector<HTMLElement>(".kb-facet-header");
    if (header) {
      expect(getComputedStyle(header, "::after").backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    }
  }
}

/** Default depth: lifted plate, lit top and bevel edges, divider, recessed well. */
export const Depth: Story = {
  args: { cut: "start", rail: "status" },
  render: (args) => (
    <div style={row}>
      {(["default", "active", "critical"] as const).map((tone) => (
        <Facet
          {...args}
          key={tone}
          tone={tone}
          aria-labelledby={`depth-${tone}`}
          style={{ width: 320 }}
        >
          <Facet.Header>
            <h3 id={`depth-${tone}`}>{`Depth ${tone}`}</h3>
            <Status
              tone={tone === "critical" ? "blocked" : tone === "active" ? "running" : "neutral"}
            >
              {tone === "critical" ? "Blocked" : tone === "active" ? "Running" : "Idle"}
            </Status>
          </Facet.Header>
          <Facet.Body>
            <Facet.Well>
              <code>step 3 of 5: checking</code>
            </Facet.Well>
          </Facet.Body>
        </Facet>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => expectDepth(canvasElement),
};

export const DepthDark: Story = { ...Depth, globals: { theme: "dark" } };

/** A wrapper-scoped --kb-facet-cut must reach the plate; per-side hooks stay optional. */
export const ScopedCut: Story = {
  args: { cut: "both" },
  render: (args) => (
    <div style={{ "--kb-facet-cut": "2rem" } as object}>
      <Sample {...args} id="scoped-cut" title="Scoped cut" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const plate = canvasElement.querySelector<HTMLElement>(".kb-facet-plate");
    expect(plate && getComputedStyle(plate).clipPath).toContain("32px 0px");
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

/** The focus ring must stay whole: clip and shadow live on the decorative plate, never on the root. */
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
    expect(getComputedStyle(root).filter).toBe("none");
    const plate = root.querySelector(".kb-facet-plate") as HTMLElement;
    expect(getComputedStyle(plate).clipPath).not.toBe("none");
    expect(
      getComputedStyle(root.querySelector(".kb-facet-frame") as HTMLElement).pointerEvents,
    ).toBe("none");
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
      {(["quiet", "default", "sunken", "active", "critical"] as const).map((tone) => (
        <Sample {...args} key={tone} id={`dark-${tone}`} tone={tone} cut="both" title={tone} />
      ))}
    </div>
  ),
};
