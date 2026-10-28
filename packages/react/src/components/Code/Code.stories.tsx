import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
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
export const InText: Story = {
  render: () => (
    <Text>
      Import <Code>@kbui/css/styles.css</Code>, then render <Code>{"<Heading level={2} />"}</Code>.
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
