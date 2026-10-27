import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { NumberField, type NumberFieldProps } from "./NumberField";

function Sample(args: NumberFieldProps) {
  const [value, setValue] = useState<number | null>(args.value);
  return (
    <div style={{ maxWidth: 360 }}>
      <NumberField {...args} value={value} onValueChange={setValue} />
    </div>
  );
}

const meta = {
  title: "Components/NumberField",
  component: NumberField,
  tags: ["autodocs"],
  args: {
    label: "Bath towel counted",
    value: 76,
    onValueChange: () => {},
    min: 0,
    max: 9999,
    step: 1,
    size: "lg",
  },
  render: (args) => <Sample {...args} />,
} satisfies Meta<typeof NumberField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Increase Bath towel counted" }));
    await expect(canvas.getByRole("textbox")).toHaveValue("77");
  },
};
export const Dark: Story = {
  tags: ["!dev", "!autodocs"],
  globals: { theme: "dark" },
};
export const Empty: Story = { args: { value: null, description: "Enter the returned count." } };
export const Invalid: Story = {
  args: { value: 1.5, error: "Enter a whole number from 0 to 9999." },
};
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Bounds: Story = { args: { label: "Standard boxes", value: 0, min: 0, max: 99 } };
export const Fractional: Story = {
  args: { label: "Length in metres", value: 1.5, min: 0, max: 10, step: 0.25 },
};
export const ContrastingContexts: Story = {
  render: function Contexts() {
    const [linen, setLinen] = useState<number | null>(76);
    const [boxes, setBoxes] = useState<number | null>(12);
    return (
      <div style={{ display: "grid", gap: 24, maxWidth: 420 }}>
        <NumberField
          label="Bath towel counted"
          value={linen}
          onValueChange={setLinen}
          min={0}
          max={9999}
          size="lg"
          style={
            {
              "--kb-numberfield-radius": "2px",
              "--kb-numberfield-background": "var(--kb-color-accent)",
              "--kb-numberfield-color": "var(--kb-color-accent-fg)",
              "--kb-numberfield-font-size": "1.75rem",
            } as CSSProperties
          }
        />
        <NumberField
          label="Standard boxes"
          value={boxes}
          onValueChange={setBoxes}
          min={0}
          max={99}
          size="lg"
          style={{ "--kb-numberfield-radius": "9999px" } as CSSProperties}
        />
      </div>
    );
  },
};
export const LongLabel: Story = {
  args: {
    label: "King flat sheet · extra-long hotel collection for north wing rooms",
    description: "White cotton · 300 × 270 cm · reinforced stitched edge",
  },
};
