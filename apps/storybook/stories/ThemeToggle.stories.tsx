import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import type { Theme } from "../site/site-theme";
import { ThemeToggle } from "../site/ThemeToggle";

function ThemePreview({ theme: initial }: { theme: Theme }) {
  const [theme, setTheme] = useState(initial);
  return (
    <div data-theme={theme}>
      <ThemeToggle theme={theme} onChange={setTheme} />
    </div>
  );
}
const meta = {
  title: "Site/ThemeToggle",
  component: ThemeToggle,
  args: { theme: "light", onChange: () => {} },
  render: (args) => <ThemePreview theme={args.theme} />,
} satisfies Meta<typeof ThemeToggle>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole("switch", { name: "Dark mode" });
    expect(within(canvasElement).getByLabelText("Dark mode")).toBe(control);
    expect(control).not.toBeChecked();
    await userEvent.click(control);
    expect(control).toBeChecked();
    const track = control.nextElementSibling;
    if (!track) throw new Error("Missing Switch track");
    // Synthetic click retains keyboard modality; native pointer checks cover ring restraint.
    await userEvent.keyboard(" ");
    expect(control).not.toBeChecked();
    expect(getComputedStyle(track).outlineStyle).toBe("solid");
    expect(getComputedStyle(track).outlineOffset).toBe("-2px");
  },
};
export const Dark: Story = {
  args: { theme: "dark" },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).getByRole("switch", { name: "Dark mode" })).toBeChecked();
  },
};
