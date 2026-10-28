import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Fieldset } from "../Fieldset/Fieldset";
import { FormActions } from "../FormActions/FormActions";
import { Grid } from "../Grid/Grid";
import { Input } from "../Input/Input";
import { Switch } from "../Switch/Switch";
import { Textarea } from "../Textarea/Textarea";
import { ErrorSummary, type ErrorSummaryProps } from "./ErrorSummary";

function SettingsRecoveryExample(props: ErrorSummaryProps) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [alerts, setAlerts] = useState(true);
  const items = [
    ...(name.trim() ? [] : [{ href: "#recovery-name", label: "Enter a workspace name" }]),
    ...(notes.trim()
      ? []
      : [{ href: "#recovery-notes", label: "Enter an incident handoff summary" }]),
  ];

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Grid layout="stack">
        <ErrorSummary {...props} items={items} />
        <Fieldset
          legend="General settings"
          description="Identify this workspace in notifications and audit logs."
        >
          <Input
            id="recovery-name"
            label="Workspace name"
            value={name}
            onValueChange={setName}
            error={name.trim() ? "" : "Enter a workspace name"}
          />
          <Textarea
            id="recovery-notes"
            label="Incident handoff summary"
            rows={3}
            value={notes}
            onValueChange={setNotes}
            error={notes.trim() ? undefined : "Enter an incident handoff summary"}
          />
          <Switch
            label="Send daily digest"
            description="Email a summary of unresolved alerts every morning."
            checked={alerts}
            onCheckedChange={setAlerts}
          />
        </Fieldset>
        <FormActions divider>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setName("");
              setNotes("");
            }}
          >
            Reset
          </Button>
          <Button type="submit">Save settings</Button>
        </FormActions>
      </Grid>
    </form>
  );
}

const meta = {
  title: "Components/ErrorSummary",
  component: ErrorSummary,
  tags: ["autodocs"],
  args: {
    title: "There is a problem",
    description: "Fix the highlighted fields before saving.",
    items: [
      { href: "#workspace-name", label: "Enter a workspace name" },
      { href: "#incident-notes", label: "Enter an incident handoff summary" },
    ],
  },
} satisfies Meta<typeof ErrorSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Dark: Story = {
  tags: ["!dev", "!autodocs"],
  ...Default,
  globals: { theme: "dark" },
};
export const FormRecovery: Story = {
  name: "Form recovery",
  render: (args) => <SettingsRecoveryExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert", { name: "There is a problem" });
    expect(alert).toBeVisible();
    const notesLink = canvas.getByRole("link", {
      name: "Enter an incident handoff summary",
    });
    await userEvent.click(notesLink);
    expect(canvas.getByLabelText("Incident handoff summary")).toHaveFocus();
  },
};
