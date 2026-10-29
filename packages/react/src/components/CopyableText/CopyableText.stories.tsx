import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { CopyableText } from "./CopyableText";

const meta = {
  title: "Components/CopyableText",
  component: CopyableText,
  tags: ["autodocs"],
  args: { label: "Request ID", value: "req_01JCP6NF8B4M2WQ9K7X3", copyLabel: "Copy ID" },
} satisfies Meta<typeof CopyableText>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const References: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--kb-space-4)", inlineSize: "100%" }}>
      <CopyableText label="Support reference" value="INC-2026-0042" copyLabel="Copy reference" />
      <CopyableText
        label="Webhook endpoint"
        value="https://api.example.com/v1/workspaces/production/events"
        copyLabel="Copy URL"
      />
      <CopyableText
        label="Share with your teammate"
        mono={false}
        value="Workspace invitation: https://example.com/invite/design-systems"
        copyLabel="Copy invitation"
      />
    </div>
  ),
};
export const Inline: Story = {
  render: () => (
    <p>
      Quote{" "}
      <CopyableText appearance="plain" size="sm" value="INC-2026-0042" copyLabel="Copy reference" />{" "}
      when contacting support.
    </p>
  ),
};
export const LongValue: Story = {
  args: {
    label: "Artifact digest",
    copyLabel: "Copy digest",
    tone: "accent",
    value: "sha256:1a9284d56be789d01a9284d56be789d01a9284d56be789d01a9284d56be789d0",
    truncate: true,
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(".kb-copyabletext");
    if (!root) throw new Error("Missing copyable content");
    const canvas = within(root);
    const width = root.style.inlineSize;
    for (const size of [160, 288]) {
      root.style.inlineSize = `${size}px`;
      expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
      const toggle = canvas.getByRole("button", { name: "Show full value" });
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await userEvent.click(toggle);
      await expect(toggle).toHaveTextContent("Show less");
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await expect(toggle).toHaveFocus();
      const content = root.querySelector<HTMLElement>(".kb-copyabletext-value");
      if (!content) throw new Error("Missing value");
      expect(content.clientWidth).toBeGreaterThan(root.clientWidth * 0.7);
      expect(content.scrollWidth).toBeLessThanOrEqual(content.clientWidth);
      expect(getComputedStyle(content).whiteSpace).toBe("pre-wrap");
      expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
      expect(
        canvas.getByRole("button", { name: "Copy digest" }).getBoundingClientRect().height,
      ).toBeGreaterThanOrEqual(24);
      await userEvent.keyboard(" ");
      await expect(toggle).toHaveTextContent("Show full value");
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
    }
    root.style.inlineSize = width;
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const Localized: Story = {
  args: {
    label: "Référence",
    value: "DOSSIER-2048",
    copyLabel: "Copier",
    copyingLabel: "Copie…",
    copiedLabel: "Copié",
    copyErrorLabel: "Réessayer",
    successMessage: "Référence copiée",
    errorMessage: "Échec de la copie. Sélectionnez et copiez le texte manuellement.",
  },
};
export const CopyFeedback: Story = {
  args: { feedbackDuration: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    let resolve!: () => void;
    let writes = 0;
    try {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: () => {
            writes++;
            return new Promise<void>((done) => {
              resolve = done;
            });
          },
        },
      });
      const button = canvas.getByRole("button", { name: "Copy ID" });
      button.focus();
      await userEvent.keyboard("{Enter}");
      await expect(button).toHaveTextContent("Copying…");
      await expect(button).toHaveFocus();
      await userEvent.click(button);
      expect(writes).toBe(1);
      resolve();
      await waitFor(() => expect(button).toHaveTextContent("Copied"));
      await expect(canvas.getByRole("status")).toHaveTextContent("Copied to clipboard");
      await expect(button).toHaveFocus();
    } finally {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  },
};
export const CopyFailure: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    try {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => {
            throw new Error("Permission denied");
          },
        },
      });
      await userEvent.click(canvas.getByRole("button", { name: "Copy ID" }));
      await expect(canvas.getByRole("button", { name: "Retry copy" })).toBeEnabled();
      await expect(canvas.getByRole("status")).toHaveTextContent(
        "Select and copy the text manually.",
      );
      await expect(canvas.getByText("req_01JCP6NF8B4M2WQ9K7X3")).toBeVisible();
    } finally {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  },
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--kb-space-3)", inlineSize: "100%" }}>
      <CopyableText
        label="Request"
        value="req_01JCP6NF8B4M"
        tone="neutral"
        copyLabel="Copy request"
      />
      <CopyableText
        label="Branch"
        value="release/copyable-content"
        tone="accent"
        copyLabel="Copy branch"
      />
      <CopyableText
        label="Endpoint"
        value="https://api.example.com/v1/events"
        tone="info"
        linkify
        copyLabel="Copy URL"
      />
      <CopyableText
        label="Verified signature"
        value="sig_verified_01JCP6NF"
        tone="success"
        copyLabel="Copy signature"
      />
      <CopyableText
        label="Expiring reference"
        value="invite_expires_in_24h"
        tone="warning"
        copyLabel="Copy reference"
      />
      <CopyableText
        label="Diagnostic code"
        value="ERR_PERMISSION_DENIED"
        tone="danger"
        copyLabel="Copy diagnostic"
      />
    </div>
  ),
};

export const RichContent: Story = {
  args: {
    label: "Deployment handoff",
    value:
      "Deployment ready for production. Read https://example.com/releases/v2 and https://example.com/support?request=req_A7k2 for details.",
    mono: false,
    highlight: ["production", "req_A7k2"],
    copyLabel: "Copy handoff",
  },
  play: async ({ canvasElement, args }) => {
    const root = canvasElement.querySelector<HTMLElement>(".kb-copyabletext");
    if (!root) throw new Error("Missing copyable content");
    const canvas = within(root);
    expect(canvas.getAllByRole("link")).toHaveLength(2);
    expect(root.querySelector(".kb-copyabletext-value")?.textContent).toBe(args.value);
    const width = root.style.inlineSize;
    for (const size of [160, 288]) {
      root.style.inlineSize = `${size}px`;
      expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
      const link = canvas.getAllByRole("link")[0];
      if (!link) throw new Error("Missing link");
      link.focus();
      await expect(link).toHaveFocus();
      expect(getComputedStyle(link).textDecorationLine).toContain("underline");
    }
    root.style.inlineSize = width;
  },
};

export const Automatic: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--kb-space-4)", inlineSize: "100%" }}>
      <CopyableText
        label="Support handoff"
        mono={false}
        value="Email help+deployments@example.com, visit www.example.com/docs, then run `bun run check`."
        copyLabel="Copy support details"
      />
      <CopyableText
        label="Detected TypeScript"
        value={'const ready = true;\nconsole.log("deployment.ready", ready);'}
        copyLabel="Copy source"
      />
      <CopyableText
        label="Detected JSON"
        value={'{ "environment": "production", "ready": true }'}
        copyLabel="Copy configuration"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("link", { name: "help+deployments@example.com" }),
    ).toHaveAttribute("href", "mailto:help%2Bdeployments@example.com");
    await expect(canvas.getByRole("link", { name: "www.example.com/docs" })).toHaveAttribute(
      "href",
      "https://www.example.com/docs",
    );
    expect(canvasElement.querySelectorAll(".kb-copyabletext-code")).toHaveLength(3);
    expect(canvasElement.querySelectorAll("[data-syntax]").length).toBeGreaterThan(0);
  },
};
