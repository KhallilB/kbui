import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button } from "../Button/Button";
import { FormActions } from "./FormActions";

const meta = {
  title: "Components/FormActions",
  component: FormActions,
  tags: ["autodocs"],
  args: {
    align: "end",
    divider: false,
  },
  argTypes: {
    align: { control: "select", options: ["end", "start", "between"] },
  },
} satisfies Meta<typeof FormActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <FormActions {...args}>
      <Button variant="ghost">Cancel</Button>
      <Button type="submit">Save changes</Button>
    </FormActions>
  ),
};
export const WithDivider: Story = {
  args: { divider: true },
  render: (args) => (
    <FormActions {...args}>
      <Button variant="secondary">Save draft</Button>
      <Button type="submit">Publish</Button>
    </FormActions>
  ),
};
export const SplitAlignment: Story = {
  args: { align: "between", divider: true },
  render: (args) => (
    <FormActions {...args}>
      <Button variant="ghost">Reset defaults</Button>
      <Button type="submit">Apply settings</Button>
    </FormActions>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.closest(".kb-formactions")).toHaveAttribute("data-align", "between");
    expect(buttons[0]?.closest(".kb-formactions")).toHaveAttribute("data-divider", "");
  },
};
