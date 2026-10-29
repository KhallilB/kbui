import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Button } from "../Button/Button";
import { Callout } from "./Callout";

/** Sample caller-provided icon; kbui ships none. */
function Alert() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M8 2 15 14H1Z" />
      <path d="M8 6v4M8 12h0" />
    </svg>
  );
}

const meta = {
  title: "Components/Callout",
  component: Callout,
  tags: ["autodocs"],
  args: {
    title: "A file with this name already exists",
    children: "Choose whether to replace the existing file or keep both versions.",
  },
  argTypes: {
    tone: { control: "select", options: ["neutral", "info", "success", "warning", "danger"] },
  },
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

const box = { width: "100%" } as const;

export const Default: Story = {
  render: (args) => (
    <div style={box}>
      <Callout {...args} />
    </div>
  ),
};
export const WithActions: Story = {
  args: { tone: "warning", icon: <Alert /> },
  render: (args) => (
    <div style={box}>
      <Callout
        {...args}
        actions={
          <>
            <Button size="sm">Overwrite</Button>
            <Button size="sm" variant="ghost">
              Skip
            </Button>
          </>
        }
      />
    </div>
  ),
};
export const Tones: Story = {
  render: (args) => (
    <div style={{ ...box, display: "grid", gap: 12 }}>
      {(["neutral", "info", "success", "warning", "danger"] as const).map((tone) => (
        <Callout {...args} key={tone} tone={tone} title={tone} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tones = ["neutral", "info", "success", "warning", "danger"] as const;
    const backgrounds = new Set<string>();
    const borders = new Set<string>();
    const titles = new Set<string>();

    for (const tone of tones) {
      const root = canvasElement.querySelector<HTMLElement>(`.kb-callout[data-tone="${tone}"]`);
      const title = root?.querySelector<HTMLElement>(".kb-callout-title");
      const body = root?.querySelector<HTMLElement>(".kb-callout-body");
      expect(root).not.toBeNull();
      expect(title).not.toBeNull();
      expect(body).not.toBeNull();
      if (!root || !title || !body) continue;

      const rootStyle = getComputedStyle(root);
      const titleStyle = getComputedStyle(title);
      const bodyStyle = getComputedStyle(body);

      backgrounds.add(rootStyle.backgroundColor);
      borders.add(rootStyle.borderTopColor);
      titles.add(titleStyle.color);

      if (tone === "neutral") {
        expect(titleStyle.color).toBe(bodyStyle.color);
      } else {
        expect(titleStyle.color).not.toBe(bodyStyle.color);
      }
    }

    expect(backgrounds.size).toBe(tones.length);
    expect(borders.size).toBe(tones.length);
    expect(titles.size).toBe(tones.length);
  },
};
