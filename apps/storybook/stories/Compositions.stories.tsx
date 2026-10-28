import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Composition } from "../site/Examples";
import "../site/site.css";

const meta = {
  title: "Site/Compositions",
  component: Composition,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="kbui-site" data-theme="light" style={{ width: "min(480px, 90vw)" }}>
        <Story />
      </div>
    ),
  ],
  args: { surface: "Creative", storybookRoot: "./" },
  globals: { theme: "light" },
} satisfies Meta<typeof Composition>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Creative: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const geometry = canvasElement.querySelector(".geometry");
    if (!geometry) throw new Error("Missing composition geometry");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const title = canvasElement.querySelector(".composition-title");
    const paragraph = canvas.getByRole("status", { name: "Palette" });
    if (!title) throw new Error("Missing creative title");
    expect(getComputedStyle(paragraph).animationName).toBe(
      reduced ? "none" : "kbui-fragment-arrive",
    );
    const entrance = title.getAnimations()[0];
    const bounds = geometry.getBoundingClientRect();
    expect(Math.abs(bounds.height - (bounds.width * 224) / 320)).toBeLessThanOrEqual(1);
    expect(canvas.getByRole("status", { name: "Palette" })).toHaveTextContent(
      "Persimmon / Marigold / Lilac",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Change palette" }));
    expect(canvas.getByRole("status", { name: "Palette" })).toHaveTextContent(
      "Persimmon / Marigold / Lilac · vivid",
    );
    expect(title.getAnimations()[0]).toBe(entrance);
    const words = canvasElement.querySelector(".palette-words");
    if (!words) throw new Error("Missing palette update");
    expect(getComputedStyle(words).animationName).toBe(reduced ? "none" : "kbui-ink-update");
    expect(geometry.getBoundingClientRect().width).toBeCloseTo(bounds.width, 0);
  },
};
export const Editorial: Story = {
  args: { surface: "Editorial" },
  play: async ({ canvasElement }) => {
    const title = canvasElement.querySelector(".composition-title");
    const paragraph = canvasElement.querySelector(".composition > p");
    if (!title || !paragraph) throw new Error("Missing editorial copy");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    expect(getComputedStyle(paragraph).animationName).toBe(
      reduced ? "none" : "kbui-fragment-arrive",
    );
    if (!reduced)
      expect(Number.parseFloat(getComputedStyle(paragraph).animationDelay)).toBeGreaterThan(
        Number.parseFloat(getComputedStyle(title).animationDelay),
      );
    expect(within(canvasElement).getByRole("link", { name: /Heading docs/ })).toHaveAttribute(
      "href",
      "./?path=/docs/components-heading--docs",
    );
  },
};
export const Operations: Story = { args: { surface: "Operations" } };
