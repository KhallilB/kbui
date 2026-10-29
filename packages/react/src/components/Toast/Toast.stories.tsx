import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";
import { Button } from "../Button/Button";
import { Inline } from "../Inline/Inline";
import { Spinner } from "../Spinner/Spinner";
import { Toast, type ToastTone, useToastManager } from "./Toast";

function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <path d="m3.5 8.5 3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarningGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M8 2 14.5 13.5h-13L8 2Z" strokeLinejoin="round" />
      <path d="M8 6.2v3.3M8 11.5h.01" strokeLinecap="round" />
    </svg>
  );
}

const tones: ToastTone[] = ["neutral", "info", "success", "warning", "danger", "loading"];

const meta = {
  title: "Components/Toast",
  component: Toast,
  tags: ["autodocs"],
  args: {
    tone: "success",
    title: "Configuration saved",
    description: "Edge routing rules were propagated to all 14 regions.",
  },
  argTypes: {
    tone: { control: "select", options: tones },
    closable: { control: "boolean" },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

const box = { width: "100%" } as const;

export const Default: Story = {
  render: (args) => (
    <div style={box}>
      <Toast {...args} icon={<CheckGlyph />} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const toast = canvasElement.querySelector<HTMLElement>(".kb-toast");
    expect(toast).not.toBeNull();
    expect(toast?.getAttribute("data-tone")).toBe("success");
  },
};

export const WithRecoveryAction: Story = {
  render: () => (
    <div style={box}>
      <Toast
        tone="danger"
        icon={<WarningGlyph />}
        title="Webhook delivery failed"
        description="Endpoint returned HTTP 503 during event dispatch."
        actionLabel="Retry delivery"
        onAction={() => {}}
      />
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ ...box, display: "grid", gap: "0.75rem" }}>
      {tones.map((tone) => (
        <Toast
          key={tone}
          tone={tone}
          title={`Tone: ${tone}`}
          description="Non-modal status notification with semantic border and icon ink."
        />
      ))}
    </div>
  ),
};

function AsyncSubmissionTrigger() {
  const toastManager = useToastManager();
  const [submitting, setSubmitting] = useState(false);

  const runSubmission = (shouldFail: boolean) => {
    setSubmitting(true);
    const id = toastManager.add({
      type: "loading",
      title: "Publishing release v2.5.0",
      description: "Signing provenance attestation and uploading artifacts…",
    });

    setTimeout(() => {
      setSubmitting(false);
      if (shouldFail) {
        toastManager.update(id, {
          type: "error",
          title: "Release publish failed",
          description: "Registry mirror timed out while verifying signature.",
          actionProps: {
            children: "Retry publish",
            onClick: () => {
              toastManager.close(id);
              runSubmission(false);
            },
          },
        });
      } else {
        toastManager.update(id, {
          type: "success",
          title: "Release v2.5.0 published",
          description: "Signed package is now available on the registry.",
        });
      }
    }, 350);
  };

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <Inline gap="sm" align="center">
        <Button size="sm" disabled={submitting} onClick={() => runSubmission(false)}>
          {submitting ? <Spinner decorative size="sm" tone="current" /> : null}
          {submitting ? "Publishing…" : "Publish release"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={submitting}
          onClick={() => runSubmission(true)}
        >
          Simulate recoverable failure
        </Button>
      </Inline>
    </div>
  );
}

export const AsyncSubmissionAndRetry: Story = {
  render: () => (
    <div style={{ width: "100%", display: "grid", gap: "0.75rem" }}>
      <Toast.Provider timeout={0}>
        <AsyncSubmissionTrigger />
        <Toast.Viewport portal={false} inline>
          <Toast
            tone="warning"
            icon={<WarningGlyph />}
            title="Transient timeout on replica-eu-west"
            description="Automatic retry scheduled; use manual retry to force immediate sync."
            actionLabel="Retry now"
            onAction={() => {}}
          />
        </Toast.Viewport>
      </Toast.Provider>
    </div>
  ),
};
