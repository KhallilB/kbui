import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { RadioGroup, type RadioGroupProps } from "./RadioGroup";

function RadioExample({ value: initial, ...props }: RadioGroupProps) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <RadioGroup {...props} value={value} onValueChange={setValue}>
      <RadioGroup.Item value="compact">Compact</RadioGroup.Item>
      <RadioGroup.Item value="locked" disabled>
        Unavailable
      </RadioGroup.Item>
      <RadioGroup.Item value="roomy">Roomy</RadioGroup.Item>
    </RadioGroup>
  );
}
const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  args: { label: "Display", value: "compact", onValueChange: (_value: string) => {} },
  render: (args) => <RadioExample {...args} />,
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const available = c.getByRole("radio", { name: "Roomy" });
    const forced = matchMedia("(forced-colors: active)").matches;
    if (!forced) {
      expect(getComputedStyle(available).boxShadow).toContain("inset");
      expect(getComputedStyle(available).backgroundImage).not.toBe("none");
    }
    c.getByRole("radio", { name: "Compact" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(available).toBeChecked();
    expect(getComputedStyle(available).outlineOffset).toBe("-2px");
    if (forced)
      expect(getComputedStyle(available).outlineColor).not.toBe(
        getComputedStyle(available).backgroundColor,
      );
  },
};
export const EmptySelection: Story = { args: { value: null } };
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = {
  args: { description: "Choose one display", error: "A display is required" },
};
export const TokenOverrides: Story = {
  render: (args) => (
    <RadioExample
      {...args}
      style={{ "--kb-radiogroup-gap": "1.5rem", "--kb-radiogroup-size": "2rem" } as CSSProperties}
    />
  ),
};
export const SelectedMaterial: Story = {
  render: () => (
    <div>
      <style>{".material-choice { background: #261b22; color: #fff2df; padding: 1rem; }"}</style>
      <RadioGroup label="Program date" value="friday" onValueChange={() => {}}>
        <RadioGroup.Item value="friday" className="material-choice">
          Friday evening
        </RadioGroup.Item>
      </RadioGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(within(canvasElement).getByText("Friday evening")).color).toBe(
      "rgb(255, 242, 223)",
    );
  },
};

export const Segmented: Story = {
  args: { appearance: "segmented" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const compact = c.getByRole("radio", { name: "Compact" });
    const roomy = c.getByRole("radio", { name: "Roomy" });
    const compactLabel = compact.closest("label");
    const roomyLabel = roomy.closest("label");
    if (!compactLabel || !roomyLabel) throw new Error("Missing segmented labels");
    expect(getComputedStyle(compactLabel).boxShadow).not.toBe("none");
    expect(getComputedStyle(roomyLabel).boxShadow).toBe("none");
    compact.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(roomy).toBeChecked();
    expect(getComputedStyle(roomyLabel).outlineOffset).toBe("-2px");
  },
};
