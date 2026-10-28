import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Grid } from "../Grid/Grid";
import { Textarea } from "./Textarea";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    label: "Release notes",
    placeholder: "Summarize user-facing changes…",
  },
  argTypes: {
    resize: { control: "select", options: ["vertical", "none", "both"] },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Dark: Story = {
  tags: ["!dev", "!autodocs"],
  ...Default,
  globals: { theme: "dark" },
};
export const WithDescription: Story = {
  args: { description: "Plain text up to 500 characters." },
};
export const WithError: Story = {
  args: { error: "Enter release notes before publishing." },
};
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Archived release summary." },
};
export const ReadOnly: Story = {
  args: {
    label: "Verification digest",
    readOnly: true,
    resize: "none",
    rows: 3,
    defaultValue: "sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  },
};
export const ResizeModes: Story = {
  render: (args) => (
    <Grid layout="stack">
      <Textarea {...args} label="Vertical resize" resize="vertical" />
      <Textarea {...args} label="Fixed height" resize="none" rows={3} />
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const vertical = canvas.getByLabelText("Vertical resize");
    const fixed = canvas.getByLabelText("Fixed height");
    expect(vertical.closest(".kb-textarea")).toHaveAttribute("data-resize", "vertical");
    expect(fixed.closest(".kb-textarea")).toHaveAttribute("data-resize", "none");
    await userEvent.type(vertical, "Added form primitives.");
    expect(vertical).toHaveValue("Added form primitives.");
  },
};
