import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { Input } from "../Input/Input";
import { Switch } from "../Switch/Switch";
import { Textarea } from "../Textarea/Textarea";
import { Fieldset, type FieldsetProps } from "./Fieldset";

function WorkspaceSection(props: FieldsetProps) {
  const [listed, setListed] = useState(true);
  return (
    <Fieldset {...props}>
      <Input label="Workspace name" defaultValue="Northwind Ops" />
      <Textarea
        label="Summary"
        rows={3}
        defaultValue="Shared incident response and deployment runbooks."
      />
      <Switch
        label="List in organization directory"
        description="Members can discover and request access."
        checked={listed}
        onCheckedChange={setListed}
      />
    </Fieldset>
  );
}

const meta = {
  title: "Components/Fieldset",
  component: Fieldset,
  tags: ["autodocs"],
  args: {
    legend: "Workspace profile",
    description: "Shown to members across shared projects.",
  },
} satisfies Meta<typeof Fieldset>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <WorkspaceSection {...args} />,
};
export const Dark: Story = {
  tags: ["!dev", "!autodocs"],
  ...Default,
  globals: { theme: "dark" },
};
export const WithError: Story = {
  args: {
    legend: "Incident contact",
    description: "Provide an active on-call destination before enabling alerts.",
    error: "Enter an escalation email or webhook URL.",
  },
  render: (args) => (
    <Fieldset {...args}>
      <Input label="Escalation email" error="Escalation email is required." />
      <Textarea label="Escalation notes" rows={3} placeholder="Who to page first…" />
    </Fieldset>
  ),
};
export const Disabled: Story = {
  args: {
    legend: "Archived workspace",
    description: "Settings are locked while the export completes.",
    disabled: true,
  },
  render: (args) => (
    <Fieldset {...args}>
      <Input label="Workspace slug" defaultValue="northwind-archive" />
      <Textarea label="Archive reason" rows={3} defaultValue="Consolidated into core platform." />
    </Fieldset>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: "Archived workspace" });
    expect(group).toBeDisabled();
    expect(canvas.getByLabelText("Workspace slug")).toBeDisabled();
    expect(canvas.getByLabelText("Archive reason")).toBeDisabled();
  },
};
