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
    rail: { control: "select", options: ["none", "accent", "status"] },
    density: { control: "select", options: ["compact", "standard"] },
  },
  args: { tone: "default", rail: "none", density: "standard" },
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

function expectDepth(canvas: HTMLElement) {
  const facets = [...canvas.querySelectorAll<HTMLElement>(".kb-facet:not([data-nested])")];
  expect(facets.length).toBeGreaterThan(0);
  for (const facet of facets) {
    expect(getComputedStyle(facet).clipPath).toBe("none");
    expect(getComputedStyle(facet).filter).toBe("none");
    const glow = facet.querySelector<HTMLElement>(":scope > .kb-facet-glow");
    const plate = facet.querySelector<HTMLElement>(":scope > .kb-facet-plate");
    expect(glow && getComputedStyle(glow).pointerEvents).toBe("none");
    expect(plate && getComputedStyle(plate).pointerEvents).toBe("none");
    expect(plate && getComputedStyle(plate).borderTopLeftRadius).toBe(
      getComputedStyle(facet).borderTopLeftRadius,
    );
    expect(plate && getComputedStyle(plate).boxShadow).not.toBe("none");
    expect(plate && getComputedStyle(plate, "::before").maskComposite).toContain("exclude");
    const header = facet.querySelector<HTMLElement>(".kb-facet-header");
    if (header) {
      expect(getComputedStyle(header, "::after").backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    }
  }
}

/** Default depth: rounded plate, lit rim and top edge, divider, lift and a recessed well. */
export const Depth: Story = {
  args: { rail: "status" },
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

/** Turned-up skin: sheen, glass and tone-colored light. Decorative layers only; layout is unchanged. */
const litRoom = {
  "--kb-facet-radius": "24px",
  "--kb-facet-sheen": "rgb(255 255 255 / 0.06)",
  "--kb-facet-backdrop": "blur(28px) saturate(150%)",
  "--kb-facet-glow-active": "color-mix(in oklab, var(--kb-color-info) 45%, transparent)",
  "--kb-facet-glow-critical": "color-mix(in oklab, var(--kb-color-danger) 45%, transparent)",
  "--kb-facet-rim-top": "rgb(255 255 255 / 0.24)",
  "--kb-status-radius": "999px",
  "--kb-status-glow": "4px",
} as object;

export const LitRoom: Story = {
  globals: { theme: "dark" },
  render: (args) => (
    <div style={{ ...row, ...litRoom, padding: 24 }}>
      {(["default", "active", "critical"] as const).map((tone) => (
        <Facet
          {...args}
          key={tone}
          tone={tone}
          aria-labelledby={`lit-${tone}`}
          style={{ width: 300 }}
        >
          <Facet.Header>
            <h3 id={`lit-${tone}`}>{`Lit ${tone}`}</h3>
            <Status
              appearance="chip"
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
  play: async ({ canvasElement }) => {
    expectDepth(canvasElement);
    for (const tone of ["active", "critical"]) {
      const glow = canvasElement.querySelector<HTMLElement>(
        `[data-tone="${tone}"] > .kb-facet-glow`,
      );
      expect(glow && getComputedStyle(glow).backgroundImage).not.toContain(
        "rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)",
      );
    }
    const plate = canvasElement.querySelector<HTMLElement>(".kb-facet-plate");
    expect(plate && getComputedStyle(plate).borderTopLeftRadius).toBe("24px");
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
    <Facet {...args} aria-labelledby="outer-title" style={{ width: 420 }}>
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
      <Sample {...args} id="g1" title="First" />
      <Sample {...args} id="g2" title="Second" tone="active" />
      <Sample {...args} id="g3" title="Third" />
    </Facet.Group>
  ),
};

export const Compact: Story = {
  args: { density: "compact" },
  render: (args) => <Sample {...args} id="compact" title="Compact facet" />,
};

/** The focus ring must stay whole: the root never clips, filters or hides overflow. */
export const FocusVisible: Story = {
  args: { rail: "accent", tone: "active" },
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
    expect(getComputedStyle(root).overflow).toBe("visible");
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
        <Sample {...args} key={tone} id={`dark-${tone}`} tone={tone} title={tone} />
      ))}
    </div>
  ),
};
