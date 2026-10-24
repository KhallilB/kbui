import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { RadioGroup } from "./RadioGroup";

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  args: { label: "Display", value: "compact", onValueChange: () => {} },
  render: function Example(args) {
    const [value, setValue] = useState<string | null>(args.value);
    return (
      <RadioGroup {...args} value={value} onValueChange={setValue}>
        <RadioGroup.Item value="compact">Compact</RadioGroup.Item>
        <RadioGroup.Item value="locked" disabled>
          Unavailable
        </RadioGroup.Item>
        <RadioGroup.Item value="roomy">Roomy</RadioGroup.Item>
      </RadioGroup>
    );
  },
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    c.getByRole("radio", { name: "Compact" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(c.getByRole("radio", { name: "Roomy" })).toBeChecked();
  },
};
export const Dark: Story = { globals: { theme: "dark" } };
export const EmptySelection: Story = { args: { value: null } };
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = {
  args: { description: "Choose one display", error: "A display is required" },
};
export const Editorial: Story = {
  args: {
    style: { fontFamily: "Georgia, serif", "--kb-radiogroup-gap": "1.5rem" } as CSSProperties,
  },
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
