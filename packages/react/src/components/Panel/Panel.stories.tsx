import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Status } from "../Status/Status";
import { Panel, type PanelProps } from "./Panel";

const meta = {
  title: "Components/Panel",
  component: Panel,
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "select", options: ["quiet", "default", "sunken", "active", "critical"] },
    rail: { control: "select", options: ["none", "accent", "status"] },
    density: { control: "select", options: ["compact", "standard"] },
  },
  args: { tone: "default", rail: "none", density: "standard" },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

function Sample({ id, title, ...args }: PanelProps & { id: string; title: string }) {
  return (
    <Panel
      {...args}
      aria-labelledby={`${id}-title`}
      style={{ width: "100%", flex: "1 1 280px", minWidth: 0 }}
    >
      <Panel.Header>
        <h3 id={`${id}-title`}>{title}</h3>
        <Status tone={args.tone === "critical" ? "blocked" : "neutral"}>
          {args.tone === "critical" ? "Blocked" : "Idle"}
        </Status>
      </Panel.Header>
      <Panel.Body>A lit rim marks the boundary; the plane stays quiet.</Panel.Body>
      <Panel.Footer>
        <Button variant="ghost" size="sm">
          Details
        </Button>
      </Panel.Footer>
    </Panel>
  );
}

const row = { display: "flex", flexWrap: "wrap", gap: 16 } as const;

export const Default: Story = {
  render: (args) => <Sample {...args} id="default" title="Default panel" />,
};

export const Tones: Story = {
  render: (args) => (
    <div style={row}>
      {(["quiet", "default", "sunken", "active", "critical"] as const).map((tone) => (
        <Sample {...args} key={tone} id={tone} tone={tone} title={`Tone ${tone}`} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Every tone keeps a hairline edge; quiet only drops fill, lift and light.
    const quiet = canvasElement.querySelector<HTMLElement>('.kb-panel[data-tone="quiet"]');
    expect(quiet && getComputedStyle(quiet).getPropertyValue("--_panel-seam").trim()).not.toBe(
      "transparent",
    );
  },
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
  play: async ({ canvasElement }) => {
    const rails = canvasElement.querySelectorAll<HTMLElement>(".kb-panel-rail");
    expect(rails.length).toBeGreaterThan(0);
    for (const rail of rails) expect(rail.getBoundingClientRect().width).toBeLessThanOrEqual(2);
  },
};

function expectDepth(canvas: HTMLElement) {
  const panels = [...canvas.querySelectorAll<HTMLElement>(".kb-panel:not([data-nested])")];
  expect(panels.length).toBeGreaterThan(0);
  for (const panel of panels) {
    expect(getComputedStyle(panel).clipPath).toBe("none");
    expect(getComputedStyle(panel).filter).toBe("none");
    const glow = panel.querySelector<HTMLElement>(":scope > .kb-panel-glow");
    const plate = panel.querySelector<HTMLElement>(":scope > .kb-panel-plate");
    expect(glow && getComputedStyle(glow).pointerEvents).toBe("none");
    expect(plate && getComputedStyle(plate).pointerEvents).toBe("none");
    expect(plate && getComputedStyle(plate).borderTopLeftRadius).toBe(
      getComputedStyle(panel).borderTopLeftRadius,
    );
    expect(plate && getComputedStyle(plate).boxShadow).not.toBe("none");
    expect(plate && getComputedStyle(plate, "::before").maskComposite).toContain("exclude");
    const header = panel.querySelector<HTMLElement>(".kb-panel-header");
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
        <Panel
          {...args}
          key={tone}
          tone={tone}
          aria-labelledby={`depth-${tone}`}
          style={{ width: "100%", flex: "1 1 280px", minWidth: 0 }}
        >
          <Panel.Header>
            <h3 id={`depth-${tone}`}>{`Depth ${tone}`}</h3>
            <Status
              tone={tone === "critical" ? "blocked" : tone === "active" ? "running" : "neutral"}
            >
              {tone === "critical" ? "Blocked" : tone === "active" ? "Running" : "Idle"}
            </Status>
          </Panel.Header>
          <Panel.Body>
            <Panel.Well>
              <code>step 3 of 5: checking</code>
            </Panel.Well>
          </Panel.Body>
        </Panel>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => expectDepth(canvasElement),
};

export const DepthDark: Story = {
  tags: ["!dev", "!autodocs"],
  ...Depth,
  globals: { theme: "dark" },
};

/** Optional tokens set on a wrapper: sheen, glass, tone-colored light, pill chips. Layout is unchanged. */
const overrides = {
  "--kb-panel-radius": "24px",
  "--kb-panel-sheen": "color-mix(in oklab, var(--kb-color-fg) 6%, transparent)",
  "--kb-panel-backdrop": "blur(28px) saturate(150%)",
  "--kb-panel-glow-active": "color-mix(in oklab, var(--kb-color-info) 45%, transparent)",
  "--kb-panel-glow-critical": "color-mix(in oklab, var(--kb-color-danger) 45%, transparent)",
  "--kb-panel-rim-top": "color-mix(in oklab, var(--kb-color-fg) 24%, transparent)",
  "--kb-status-radius": "999px",
  "--kb-status-glow": "4px",
} as object;

export const TokenOverrides: Story = {
  tags: ["!dev", "!autodocs"],
  globals: { theme: "dark" },
  render: (args) => (
    <div style={{ ...row, ...overrides, padding: 24 }}>
      {(["default", "active", "critical"] as const).map((tone) => (
        <Panel
          {...args}
          key={tone}
          tone={tone}
          aria-labelledby={`lit-${tone}`}
          style={{ width: "100%", flex: "1 1 280px", minWidth: 0 }}
        >
          <Panel.Header>
            <h3 id={`lit-${tone}`}>{`Lit ${tone}`}</h3>
            <Status
              appearance="chip"
              tone={tone === "critical" ? "blocked" : tone === "active" ? "running" : "neutral"}
            >
              {tone === "critical" ? "Blocked" : tone === "active" ? "Running" : "Idle"}
            </Status>
          </Panel.Header>
          <Panel.Body>
            <Panel.Well>
              <code>step 3 of 5: checking</code>
            </Panel.Well>
          </Panel.Body>
        </Panel>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    expectDepth(canvasElement);
    for (const tone of ["active", "critical"]) {
      const glow = canvasElement.querySelector<HTMLElement>(
        `[data-tone="${tone}"] > .kb-panel-glow`,
      );
      expect(glow && getComputedStyle(glow).backgroundImage).not.toContain(
        "rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)",
      );
      // Light hugs the plane: blurred spill past any edge stays within 32px.
      const panel = canvasElement.querySelector<HTMLElement>(`.kb-panel[data-tone="${tone}"]`);
      if (!glow || !panel) throw new Error(`no ${tone} panel glow`);
      const blur = Number(/blur\(([\d.]+)px\)/.exec(getComputedStyle(glow).filter)?.[1] ?? 0);
      const p = panel.getBoundingClientRect();
      const g = glow.getBoundingClientRect();
      const edge = Math.max(
        g.bottom - p.bottom,
        p.top - g.top,
        p.left - g.left,
        g.right - p.right,
        0,
      );
      expect(edge + 2 * blur).toBeLessThanOrEqual(32);
    }
    const plate = canvasElement.querySelector<HTMLElement>(".kb-panel-plate");
    expect(plate && getComputedStyle(plate).borderTopLeftRadius).toBe("24px");
  },
};

export const TokenOverridesLight: Story = {
  tags: ["!dev", "!autodocs"],
  ...TokenOverrides,
  globals: { theme: "light" },
};

export const Toolbar: Story = {
  render: (args) => (
    <Panel
      {...args}
      aria-labelledby="toolbar-title"
      style={{ width: "100%", flex: "1 1 280px", minWidth: 0 }}
    >
      <Panel.Header>
        <h3 id="toolbar-title">With toolbar</h3>
        <Panel.Toolbar>
          <Button variant="ghost" size="sm">
            Filter
          </Button>
          <Button variant="secondary" size="sm">
            Export
          </Button>
        </Panel.Toolbar>
      </Panel.Header>
      <Panel.Body>Header actions sit in a toolbar at the inline end.</Panel.Body>
    </Panel>
  ),
};

export const Collapsible: Story = {
  render: (args) => (
    <Panel
      {...args}
      collapsible
      defaultOpen
      aria-labelledby="collapse-title"
      style={{ width: "100%", flex: "1 1 280px", minWidth: 0 }}
    >
      <Panel.Header>
        <h3 id="collapse-title">Collapsible body</h3>
        <Panel.Toggle>Toggle</Panel.Toggle>
      </Panel.Header>
      <Panel.Body>Only the body collapses; header and footer stay.</Panel.Body>
      <Panel.Footer>
        <Status>Idle</Status>
      </Panel.Footer>
    </Panel>
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
    <Panel
      {...args}
      aria-labelledby="outer-title"
      style={{ width: "100%", flex: "1 1 280px", minWidth: 0 }}
    >
      <Panel.Header>
        <h3 id="outer-title">Outer</h3>
      </Panel.Header>
      <Panel.Body>
        <Panel tone="quiet" aria-labelledby="inner-a">
          <Panel.Header>
            <h4 id="inner-a">Inner, quiet</h4>
          </Panel.Header>
          <Panel.Body>Nested panels tighten their padding.</Panel.Body>
        </Panel>
      </Panel.Body>
    </Panel>
  ),
};

export const Group: Story = {
  render: (args) => (
    <Panel.Group direction="row" style={{ width: "100%" }}>
      <Sample {...args} id="g1" title="First" />
      <Sample {...args} id="g2" title="Second" tone="active" />
      <Sample {...args} id="g3" title="Third" />
    </Panel.Group>
  ),
};

export const Resizable: Story = {
  render: (args) => (
    <Panel.Group direction="row" style={{ width: "100%", minHeight: 220 }}>
      <Panel {...args} aria-labelledby="r1-title">
        <Panel.Header>
          <h3 id="r1-title">Code</h3>
        </Panel.Header>
        <Panel.Body>Drag the handle, or focus it and use the arrow keys.</Panel.Body>
      </Panel>
      <Panel.Handle aria-label="Resize code" defaultSize={50} min={25} max={75} />
      <Panel {...args} aria-labelledby="r2-title">
        <Panel.Header>
          <h3 id="r2-title">Picture</h3>
        </Panel.Header>
        <Panel.Body>Enter collapses the code panel to its minimum and restores it.</Panel.Body>
      </Panel>
    </Panel.Group>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole("separator", { name: "Resize code" });
    const code = canvas.getByRole("region", { name: "Code" });
    const before = code.getBoundingClientRect().width;
    handle.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(handle).toHaveAttribute("aria-valuenow", "55");
    await expect(code.getBoundingClientRect().width).toBeGreaterThan(before);
    await userEvent.keyboard("{Enter}");
    await expect(handle).toHaveAttribute("aria-valuenow", "25");
    await userEvent.keyboard("{Enter}");
    await expect(handle).toHaveAttribute("aria-valuenow", "55");
  },
};

export const Compact: Story = {
  args: { density: "compact" },
  render: (args) => <Sample {...args} id="compact" title="Compact panel" />,
};

/** The focus ring must stay whole: the root never clips, filters or hides overflow. */
export const FocusVisible: Story = {
  tags: ["!dev", "!autodocs"],
  args: { rail: "accent", tone: "active" },
  render: (args) => (
    <Panel
      {...args}
      aria-labelledby="focus-title"
      style={{ width: "100%", flex: "1 1 280px", minWidth: 0 }}
    >
      <Panel.Header>
        <h3 id="focus-title">Focus stays visible</h3>
      </Panel.Header>
      <Panel.Body>
        <Button size="sm">Retry</Button>
      </Panel.Body>
    </Panel>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Retry" });
    button.focus();
    await expect(button).toHaveFocus();
    const root = canvasElement.querySelector(".kb-panel") as HTMLElement;
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
  tags: ["!dev", "!autodocs"],
  globals: { theme: "dark" },
  render: (args) => (
    <div style={row}>
      {(["quiet", "default", "sunken", "active", "critical"] as const).map((tone) => (
        <Sample {...args} key={tone} id={`dark-${tone}`} tone={tone} title={tone} />
      ))}
    </div>
  ),
};
