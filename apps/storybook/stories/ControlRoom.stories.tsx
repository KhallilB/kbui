import { Button, Dialog, Facet, type FacetTone, Status, type StatusTone } from "@kbui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { withFacetedSkin } from "./faceted-skin";

type Pane = {
  id: string;
  title: string;
  tone: FacetTone;
  status: { tone: StatusTone; label: string };
  body: ReactNode;
  action?: ReactNode;
};

/** Sample caller-provided icon; kbui ships none. */
function Dot() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="8" r="5" />
    </svg>
  );
}

const longText = Array.from(
  { length: 6 },
  (_, i) =>
    `Line ${i + 1}: the body grows with its content and the plane grows with it, so a long ` +
    "transcript never spills past the seam or hides behind the cut corner.",
).join(" ");

function Pane({ id, title, tone, status, body, action }: Pane) {
  return (
    <Facet
      tone={tone}
      cut={tone === "active" ? "start" : "end"}
      rail={tone === "quiet" ? "none" : "status"}
      aria-labelledby={`${id}-title`}
    >
      <Facet.Header>
        <h2 id={`${id}-title`}>{title}</h2>
        <Status tone={status.tone} icon={<Dot />} live={status.tone === "running"}>
          {status.label}
        </Status>
      </Facet.Header>
      <Facet.Body>{body}</Facet.Body>
      {action ? <Facet.Footer>{action}</Facet.Footer> : null}
    </Facet>
  );
}

function Room({ panes }: { panes: Pane[] }) {
  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
        padding: 16,
        background: "var(--kb-color-bg)",
        color: "var(--kb-color-fg)",
      }}
    >
      {panes.map((pane) => (
        <Pane key={pane.id} {...pane} />
      ))}
    </main>
  );
}

const stop = (
  <Dialog>
    <Dialog.Trigger render={<Button variant="secondary" size="sm" />}>Stop</Dialog.Trigger>
    <Dialog.Content title="Stop this worker?" description="Unsaved output is kept in the log.">
      <Dialog.Actions>
        <Dialog.Close render={<Button variant="ghost" />}>Keep going</Dialog.Close>
        <Dialog.Close render={<Button variant="danger" />}>Stop</Dialog.Close>
      </Dialog.Actions>
    </Dialog.Content>
  </Dialog>
);

const idle: Pane[] = [
  {
    id: "a",
    title: "Worker A",
    tone: "quiet",
    status: { tone: "neutral", label: "Idle" },
    body: "No work assigned.",
    action: <Button size="sm">Assign</Button>,
  },
  {
    id: "b",
    title: "Worker B",
    tone: "default",
    status: { tone: "info", label: "Queued" },
    body: "Waiting for the previous step to finish.",
  },
  {
    id: "c",
    title: "Worker C",
    tone: "default",
    status: { tone: "success", label: "Passed" },
    body: "Finished in 42 s with no warnings.",
    action: (
      <Button variant="ghost" size="sm">
        Open log
      </Button>
    ),
  },
];

const running: Pane[] = [
  { ...(idle[0] as Pane) },
  {
    id: "b",
    title: "Worker B",
    tone: "active",
    status: { tone: "running", label: "Running" },
    body: "Step 3 of 5: building. Output streams below the header without motion.",
    action: stop,
  },
  { ...(idle[2] as Pane) },
];

const blocked: Pane[] = [
  { ...(idle[0] as Pane) },
  {
    id: "b",
    title: "Worker B",
    tone: "critical",
    status: { tone: "blocked", label: "Blocked" },
    body: "Needs an answer before it can continue: overwrite the existing file?",
    action: (
      <>
        <Button variant="ghost" size="sm">
          Skip
        </Button>
        <Button size="sm">Answer</Button>
      </>
    ),
  },
  {
    id: "c",
    title: "Worker C",
    tone: "default",
    status: { tone: "warning", label: "Degraded" },
    body: "Finished, but two checks were skipped.",
  },
];

const longContent: Pane[] = [
  {
    id: "b",
    title: "Worker B",
    tone: "active",
    status: { tone: "running", label: "Running" },
    body: <p style={{ margin: 0 }}>{longText}</p>,
    action: stop,
  },
  { ...(idle[2] as Pane) },
];

const meta = {
  title: "Showcase/Faceted Control Room — Foundation",
  component: Room,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Room>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = { args: { panes: idle } };
export const Running: Story = { args: { panes: running } };
export const Blocked: Story = { args: { panes: blocked } };
export const LongContent: Story = { args: { panes: longContent } };

export const IdleSkinned: Story = { ...Idle, decorators: [withFacetedSkin] };
export const RunningSkinned: Story = { ...Running, decorators: [withFacetedSkin] };
export const BlockedSkinned: Story = { ...Blocked, decorators: [withFacetedSkin] };
export const LongContentSkinned: Story = { ...LongContent, decorators: [withFacetedSkin] };

export const RunningDark: Story = { ...Running, globals: { theme: "dark" } };
export const BlockedSkinnedDark: Story = { ...BlockedSkinned, globals: { theme: "dark" } };
