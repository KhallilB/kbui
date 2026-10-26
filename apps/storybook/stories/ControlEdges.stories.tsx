import { Button, Checkbox, Input, RadioGroup, Select, Switch } from "@kbui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

const wrapped = "Keep every delivery update available to everyone in this workspace";
const unbroken = "WorkspaceDeliveryPreferencesWithoutAnyWordBreaksForNarrowLayouts";

function ControlForm({ longLabels = false }: { longLabels?: boolean }) {
  const [workspace, setWorkspace] = useState("");
  const [agreement, setAgreement] = useState(false);
  const [channel, setChannel] = useState<string | null>(null);
  const [delivery, setDelivery] = useState(false);
  const [environment, setEnvironment] = useState<string | null>(null);
  const [environmentError, setEnvironmentError] = useState<string>();
  const [attempts, setAttempts] = useState(0);
  const [saved, setSaved] = useState<readonly (readonly [string, string])[] | null>(null);
  const select = useRef<HTMLDivElement>(null);
  const label = (short: string, text: string) => (longLabels ? `${short}: ${text}` : short);
  return (
    <main
      style={{
        boxSizing: "border-box",
        maxInlineSize: 560,
        marginInline: "auto",
        padding: 24,
        color: "var(--kb-color-fg)",
        background: "var(--kb-color-bg)",
        fontFamily: "var(--kb-font-sans)",
      }}
    >
      <h1>Delivery preferences</h1>
      <p>Native required controls validate first. Environment validation belongs to this form.</p>
      <form
        aria-label="Delivery preferences"
        style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 24 }}
        onSubmit={(event) => {
          event.preventDefault();
          setAttempts((count) => count + 1);
          if (!environment) {
            setEnvironmentError("Choose an environment.");
            select.current?.querySelector<HTMLButtonElement>("[role='combobox']")?.focus();
            return;
          }
          setEnvironmentError(undefined);
          setSaved(
            [...new FormData(event.currentTarget).entries()].map(([name, value]) => [
              name,
              String(value),
            ]),
          );
        }}
        onReset={() => {
          setWorkspace("");
          setAgreement(false);
          setChannel(null);
          setDelivery(false);
          setEnvironment(null);
          setEnvironmentError(undefined);
          setAttempts(0);
          setSaved(null);
        }}
      >
        <Input
          label={label("Workspace name", unbroken)}
          name="workspace"
          required
          value={workspace}
          onValueChange={setWorkspace}
          description={longLabels ? `${wrapped} ${unbroken}` : "Used in delivery messages."}
        />
        <Checkbox
          label={label("Confirm sharing", `${wrapped} ${unbroken}`)}
          name="agreement"
          value="confirmed"
          required
          checked={agreement}
          onCheckedChange={setAgreement}
          {...(longLabels ? { description: unbroken } : {})}
        />
        <RadioGroup
          label={label("Delivery channel", unbroken)}
          name="channel"
          value={channel}
          onValueChange={setChannel}
          {...(longLabels ? { description: unbroken } : {})}
        >
          <RadioGroup.Item value="email" required>
            {label("Email", wrapped)}
          </RadioGroup.Item>
          <RadioGroup.Item value="sms" required>
            {label("Text message", unbroken)}
          </RadioGroup.Item>
        </RadioGroup>
        <Switch
          label={label("Enable delivery", unbroken)}
          name="delivery"
          value="enabled"
          required
          checked={delivery}
          onCheckedChange={setDelivery}
          description={
            longLabels ? `${wrapped} ${unbroken}` : "Required before saving these preferences."
          }
        />
        <Select
          ref={select}
          label={label("Environment", unbroken)}
          name="environment"
          value={environment}
          onValueChange={(value) => {
            setEnvironment(value);
            if (value) setEnvironmentError(undefined);
          }}
          placeholder="Choose environment"
          {...(longLabels ? { description: unbroken } : {})}
          options={[
            { value: "staging", label: longLabels ? wrapped : "Staging" },
            { value: "production", label: longLabels ? unbroken : "Production" },
          ]}
          {...(environmentError ? { error: environmentError } : {})}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Button type="submit">Save preferences</Button>
          <Button type="reset" variant="secondary">
            Reset preferences
          </Button>
        </div>
      </form>
      <p>
        Submit attempts: <output aria-label="Submit attempts">{attempts}</output>
      </p>
      <output
        aria-label="Saved values"
        style={{ display: "block", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
      >
        {saved ? JSON.stringify(saved) : "Nothing saved"}
      </output>
    </main>
  );
}

const meta = {
  title: "Site/Control edges",
  component: ControlForm,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ControlForm>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FormBehavior: Story = {};

export const SaveAndReset: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    await userEvent.type(page.getByRole("textbox", { name: "Workspace name" }), "Northstar");
    await userEvent.click(page.getByRole("checkbox", { name: "Confirm sharing" }));
    await userEvent.click(page.getByRole("radio", { name: "Text message" }));
    await userEvent.click(page.getByRole("switch", { name: "Enable delivery" }));
    await userEvent.click(page.getByRole("button", { name: "Save preferences" }));
    expect(page.getByText("Choose an environment.")).toBeVisible();
    expect(page.getByRole("combobox", { name: "Environment" })).toHaveFocus();
    await userEvent.click(page.getByRole("combobox", { name: "Environment" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "Production" }));
    await waitFor(() => expect(within(document.body).queryByRole("listbox")).toBeNull());
    await userEvent.click(page.getByRole("button", { name: "Save preferences" }));
    expect(page.getByLabelText("Saved values")).toHaveTextContent(
      JSON.stringify([
        ["workspace", "Northstar"],
        ["agreement", "confirmed"],
        ["channel", "sms"],
        ["delivery", "enabled"],
        ["environment", "production"],
      ]),
    );
    await userEvent.click(page.getByRole("button", { name: "Reset preferences" }));
    expect(page.getByRole("textbox")).toHaveValue("");
    expect(page.getByRole("checkbox")).not.toBeChecked();
    expect(page.getByRole("switch")).not.toBeChecked();
    for (const radio of page.getAllByRole("radio")) expect(radio).not.toBeChecked();
    expect(page.getByRole("combobox")).toHaveTextContent("Choose environment");
    expect(page.getByLabelText("Saved values")).toHaveTextContent("Nothing saved");
  },
};

export const LongLabels: Story = { args: { longLabels: true } };
