import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Text } from "../Text/Text";
import { Code } from "./Code";

const meta = {
  title: "Components/Code",
  component: Code,
  tags: ["autodocs"],
  args: { children: "bun run check" },
} satisfies Meta<typeof Code>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Multiline: Story = {
  render: () => (
    <Code title="src/SaveBanner.tsx" language="tsx">
      {`import { Button, Inline, Status } from "@kb.ui/react";

export function SaveBanner({ dirty }: { dirty: boolean }) {
  return (
    <Inline align="center" justify="between" gap={3}>
      <Status tone={dirty ? "warning" : "success"}>
        {dirty ? "Unsaved changes" : "Saved"}
      </Status>
      <Button variant="primary" size="sm">
        Publish
      </Button>
    </Inline>
  );
}`}
    </Code>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const block = canvasElement.querySelector<HTMLElement>(".kb-code[data-block]");
    expect(block).not.toBeNull();
    expect(canvas.getByText("src/SaveBanner.tsx")).toBeVisible();
    expect(canvas.getByText("TSX")).toBeVisible();
    expect(canvas.getByRole("button", { name: "Copy code" })).toBeVisible();
    expect(canvasElement.querySelectorAll("[data-syntax='keyword']").length).toBeGreaterThan(0);
    expect(canvasElement.querySelectorAll("[data-syntax='tag']").length).toBeGreaterThan(0);
    expect(canvasElement.querySelectorAll("[data-syntax='string']").length).toBeGreaterThan(0);
  },
};

export const LineNumbersAndHighlights: Story = {
  render: () => (
    <Code
      title="packages/css/theme.css"
      language="css"
      lineNumbers
      startLine={12}
      highlightLines={[14, 15]}
    >
      {`:root {
  --kb-color-bg: oklch(0.985 0.004 85);
  --kb-color-accent: oklch(0.55 0.16 252);
  --kb-code-block-radius: var(--kb-radius-lg);
}`}
    </Code>
  ),
  play: async ({ canvasElement }) => {
    const numbers = [...canvasElement.querySelectorAll<HTMLElement>(".kb-code-line-number")].map(
      (el) => el.dataset.lineNumber,
    );
    expect(numbers).toEqual(["12", "13", "14", "15", "16"]);
    expect(canvasElement.querySelectorAll(".kb-code-line[data-highlighted]")).toHaveLength(2);
    expect(canvasElement.querySelector("code")?.textContent).not.toContain("12");
  },
};

export const Collapsible: Story = {
  render: () => (
    <Code title="package.json" language="json" lineNumbers collapsible defaultCollapsed>
      {`{
  "name": "@kb.ui/react",
  "version": "0.14.0",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": "./dist/index.js",
    "./styles.css": "./dist/styles.css"
  }
}`}
    </Code>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvasElement.querySelector(".kb-code[data-collapsed]")).not.toBeNull();
    expect(canvas.getByRole("button", { name: "Expand code" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  },
};

export const InText: Story = {
  render: () => (
    <Text>
      Import <Code>@kb.ui/css/styles.css</Code>, then render <Code>{"<Heading level={2} />"}</Code>.
      Case, punctuation and literal markup stay intact.
    </Text>
  ),
};

export const LongToken: Story = {
  render: () => (
    <div style={{ inlineSize: "100%", maxInlineSize: "18rem" }}>
      <Text>
        Open{" "}
        <Code>
          packages/react/src/components/VeryLongComponentName/VeryLongComponentName.stories.tsx
        </Code>{" "}
        to see usage. Keep file names readable on narrow screens.
      </Text>
    </div>
  ),
  play: async ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
    const text = canvasElement.querySelector("p");
    if (!text) throw new Error("Missing text");
    const container = text.parentElement;
    if (!container) throw new Error("Missing container");
    for (const width of [160, 180, 288]) {
      container.style.inlineSize = `${width}px`;
      expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
    }
  },
};
