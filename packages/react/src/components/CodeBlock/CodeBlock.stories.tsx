import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, userEvent, within } from "storybook/test";
import { CodeBlock } from "./CodeBlock";

const meta = {
  title: "Components/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  args: { title: "Terminal", language: "bash", children: "bun add @kb.ui/react" },
} satisfies Meta<typeof CodeBlock>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Source: Story = {
  args: {
    title: "src/RequestReference.tsx",
    language: "tsx",
    lineNumbers: true,
    highlightLines: [5],
    children: `import { CopyableText } from "@kb.ui/react";

export function RequestReference() {
  return (
    <CopyableText label="Request ID" value="req_A7k2" copyLabel="Copy ID" />
  );
}`,
  },
};
export const Configuration: Story = {
  args: {
    title: "webhook.json",
    language: "json",
    lineNumbers: true,
    children:
      '{\n  "event": "deployment.ready",\n  "environment": "production",\n  "url": "https://example.com/hooks/deployments"\n}',
  },
};
export const Collapsible: Story = {
  args: {
    title: "scripts/deploy.sh",
    collapsible: true,
    defaultCollapsed: true,
    collapsedLines: 3,
    lineNumbers: true,
    children:
      "#!/usr/bin/env bash\nset -euo pipefail\n\nbun install --frozen-lockfile\nbun run check\nbun run build\n\n# Inspect build output before deployment.\nls dist",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Expand code" });
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("region", { name: "scripts/deploy.sh" })).toHaveAttribute(
      "tabindex",
      "0",
    );
    await userEvent.click(button);
    const root = canvasElement.querySelector<HTMLElement>(".kb-codeblock");
    if (!root) throw new Error("Missing code block");
    const width = root.style.inlineSize;
    for (const size of [160, 288]) {
      root.style.inlineSize = `${size}px`;
      const bounds = root.getBoundingClientRect();
      for (const action of root.querySelectorAll("button")) {
        const actionBounds = action.getBoundingClientRect();
        expect(actionBounds.right).toBeLessThanOrEqual(bounds.right + 1);
        expect(actionBounds.left).toBeGreaterThanOrEqual(bounds.left - 1);
      }
    }
    root.style.inlineSize = width;
  },
};
export const LongCommand: Story = {
  args: {
    title: "One command, exact arguments",
    children:
      'curl --request POST "https://api.example.com/v1/workspaces/production/events?include=deployment,environment,commit" --header "Content-Type: application/json"',
    maxHeight: "12rem",
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(".kb-codeblock");
    if (!root) throw new Error("Missing code block");
    const width = root.style.inlineSize;
    for (const size of [160, 288]) {
      root.style.inlineSize = `${size}px`;
      expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
      const viewport = within(root).getByRole("region");
      viewport.focus();
      await expect(viewport).toHaveFocus();
      viewport.scrollLeft = 80;
      expect(viewport.scrollLeft).toBeGreaterThan(0);
    }
    root.style.inlineSize = width;
  },
};
export const ReadOnly: Story = { args: { copyable: false } };
export const Disabled: Story = { args: { disabled: true } };
export const CopyFeedback: Story = {
  args: { feedbackDuration: 0 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    let copied = "";
    try {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            copied = value;
          },
        },
      });
      const button = canvas.getByRole("button", { name: "Copy code" });
      button.focus();
      await userEvent.keyboard(" ");
      await expect(button).toHaveTextContent("Copied");
      expect(copied).toBe(args.children);
      await expect(canvas.getByRole("status")).toHaveTextContent("Code copied to clipboard");
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
      await userEvent.click(canvas.getByRole("button", { name: "Copy code" }));
      await expect(canvas.getByRole("button", { name: "Copy failed" })).toBeEnabled();
      await expect(canvas.getByRole("status")).toBeVisible();
      await expect(canvas.getByRole("status")).toHaveTextContent(
        "Select and copy the text manually.",
      );
      await expect(canvas.getByRole("region", { name: "Terminal" })).toHaveTextContent(
        "bun add @kb.ui/react",
      );
    } finally {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  },
};

export const Localized: Story = {
  args: {
    title: "Installation",
    copyLabel: "In Zwischenablage kopieren",
    copyingLabel: "Wird kopiert…",
    copiedLabel: "Kopiert",
    copyErrorLabel: "Erneut kopieren",
    successMessage: "Befehl kopiert",
    errorMessage: "Kopieren fehlgeschlagen. Text markieren und manuell kopieren.",
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(".kb-codeblock");
    if (!root) throw new Error("Missing code block");
    const width = root.style.inlineSize;
    root.style.inlineSize = "160px";
    const button = within(root).getByRole("button", { name: "In Zwischenablage kopieren" });
    const bounds = root.getBoundingClientRect();
    expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(bounds.right + 1);
    expect(button.getBoundingClientRect().left).toBeGreaterThanOrEqual(bounds.left - 1);
    root.style.inlineSize = width;
  },
};

export const Colorful: Story = {
  render: () => (
    <CodeBlock
      title="src/Reference.tsx"
      language="tsx"
      lineNumbers
      style={
        {
          "--kb-code-syntax-keyword": "var(--kb-color-accent-ink)",
          "--kb-code-syntax-string": "var(--kb-color-success)",
          "--kb-code-syntax-tag": "var(--kb-color-info)",
          "--kb-code-syntax-function": "var(--kb-color-info)",
          "--kb-code-syntax-attribute": "var(--kb-color-warning)",
        } as CSSProperties
      }
    >
      {`import { CopyableText } from "@kb.ui/react";

export function Reference() {
  return <CopyableText tone="accent" value="release/2026.10" />;
}`}
    </CodeBlock>
  ),
};
