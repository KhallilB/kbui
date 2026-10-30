import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Button } from "../Button/Button";
import { EmptyState } from "./EmptyState";

function FolderGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M2.5 5.5A1.5 1.5 0 0 1 4 4h4l2 2h6a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 16 16H4a1.5 1.5 0 0 1-1.5-1.5v-9Z" />
    </svg>
  );
}

function SearchGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13.2 13.2 3.8 3.8" strokeLinecap="round" />
    </svg>
  );
}

function AlertGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M10 3 18 17H2L10 3Z" strokeLinejoin="round" />
      <path d="M10 8v4M10 14.5h.01" strokeLinecap="round" />
    </svg>
  );
}

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: {
    eyebrow: "Pipelines",
    title: "No release pipelines configured",
    description:
      "Create a pipeline to validate builds, run automated checks, and publish signed packages.",
    variant: "surface",
    size: "md",
    tone: "neutral",
  },
  argTypes: {
    variant: { control: "select", options: ["surface", "subtle", "plain"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    tone: { control: "select", options: ["neutral", "info", "warning", "danger"] },
    headingLevel: { control: "select", options: [2, 3, 4] },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

const box = { width: "100%" } as const;

export const Default: Story = {
  render: (args) => (
    <div style={box}>
      <EmptyState
        {...args}
        icon={<FolderGlyph />}
        actions={
          <>
            <Button size="sm">Create pipeline</Button>
            <Button size="sm" variant="secondary">
              Import template
            </Button>
          </>
        }
        footer="Pipelines can also be provisioned from a repository manifest."
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(".kb-emptystate");
    expect(root).not.toBeNull();
    expect(root?.querySelector(".kb-emptystate-title")?.tagName).toBe("H3");
  },
};

export const FilteredZeroResults: Story = {
  render: () => (
    <div style={box}>
      <EmptyState
        variant="subtle"
        tone="info"
        icon={<SearchGlyph />}
        eyebrow="0 matching records"
        title="No audit events match the active filters"
        description="No events were recorded for environment 'staging' in the last 15 minutes."
        actions={
          <>
            <Button size="sm" variant="secondary">
              Clear filters
            </Button>
            <Button size="sm" variant="ghost">
              Expand to 24 hours
            </Button>
          </>
        }
        live
      />
    </div>
  ),
};

export const RecoverableFailure: Story = {
  render: () => (
    <div style={box}>
      <EmptyState
        tone="danger"
        icon={<AlertGlyph />}
        eyebrow="Connection interrupted"
        title="Unable to load deployment history"
        description="The upstream registry did not respond before the 10s request timeout elapsed."
        actions={
          <>
            <Button size="sm">Retry request</Button>
            <Button size="sm" variant="secondary">
              Check service status
            </Button>
          </>
        }
        footer="Error code: REGISTRY_TIMEOUT_504"
        live
      />
    </div>
  ),
};

export const VariantsAndSizes: Story = {
  render: () => (
    <div style={{ ...box, display: "grid", gap: "1rem" }}>
      {(["surface", "subtle", "plain"] as const).map((variant) => (
        <EmptyState
          key={variant}
          variant={variant}
          size="sm"
          title={`${variant[0]?.toUpperCase()}${variant.slice(1)} container`}
          description="Matches surrounding surface hierarchy without competing with primary data."
          actions={
            <Button size="sm" variant="secondary">
              Configure
            </Button>
          }
        />
      ))}
    </div>
  ),
};
