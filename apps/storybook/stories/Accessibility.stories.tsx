import { Button, Checkbox, Dialog, RadioGroup, Select } from "@kbui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useRef, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { page } from "vitest/browser";

const meta = { title: "Validation/Accessible selection", tags: ["autodocs"] } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const ForcedColors: Story = {
  render: () => (
    <RadioGroup label="Assignment" value="manual" onValueChange={() => {}}>
      <RadioGroup.Item value="manual">Manual assignment</RadioGroup.Item>
      <RadioGroup.Item value="automatic">Automatic assignment</RadioGroup.Item>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const selected = within(canvasElement).getByRole("radio", { name: "Manual assignment" });
    const indicator = selected.querySelector(".kb-radiogroup-indicator") as HTMLElement;
    await expect(getComputedStyle(indicator).backgroundColor).not.toBe(
      getComputedStyle(selected).backgroundColor,
    );
  },
};
export const ForcedColorButtons: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button disabled>Disabled</Button>
      <span data-system="active" style={{ color: "ButtonText", background: "ButtonFace" }} />
      <span data-system="disabled" style={{ color: "GrayText" }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // System palette applies only under forced colors; axe owns contrast elsewhere.
    if (!matchMedia("(forced-colors: active)").matches) return;
    const system = (name: string) =>
      getComputedStyle(canvasElement.querySelector(`[data-system="${name}"]`) as HTMLElement);
    const active = system("active");
    for (const button of within(canvasElement).getAllByRole("button")) {
      const style = getComputedStyle(button);
      const text = button.hasAttribute("data-disabled") ? system("disabled").color : active.color;
      await expect(style.backgroundColor).toBe(active.backgroundColor);
      await expect(style.color).toBe(text);
      await expect(style.borderTopColor).toBe(text);
    }
  },
};
export const ReadOnlyMixed: Story = {
  render: () => (
    <Checkbox
      label="Read-only aggregate"
      checked={false}
      indeterminate
      readOnly
      onCheckedChange={() => {}}
    />
  ),
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("checkbox");
    await userEvent.click(box);
    await expect((box as HTMLInputElement).indeterminate).toBe(true);
    await expect(box).not.toBeChecked();
    await expect(box).toHaveAttribute("aria-readonly", "true");
  },
};
export const CallerDescription: Story = {
  render: () => (
    <>
      <p id="caller-helper">Choose a supported team.</p>
      <Select
        label="Team"
        value={null}
        onValueChange={() => {}}
        options={[]}
        aria-describedby="caller-helper"
      />
    </>
  ),
  play: async ({ canvasElement }) => {
    // Empty-state helper precedes caller description by contract.
    await expect(within(canvasElement).getByRole("combobox")).toHaveAccessibleDescription(
      "No options available Choose a supported team.",
    );
  },
};

export const NestedSelectModal: Story = {
  render: function NestedSelectModal() {
    const host = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState<string | null>("east");
    return (
      <div
        ref={host}
        style={
          {
            "--kb-dialog-background": "#152b2b",
            "--kb-dialog-color": "#e5eeeb",
            "--kb-dialog-description-color": "#bdcdc8",
            "--kb-popup-background": "#152b2b",
            "--kb-color-bg": "#152b2b",
            "--kb-color-fg": "#e5eeeb",
            "--kb-color-muted": "#bdcdc8",
            "--kb-color-border": "#bdcdc8",
            "--kb-color-surface": "#203a38",
          } as CSSProperties
        }
      >
        <Dialog>
          <Dialog.Trigger render={<Button />}>Edit team</Dialog.Trigger>
          <Dialog.Content
            container={host}
            title="Team preferences"
            description="Local draft only."
            style={{ maxHeight: 260, overflow: "auto" }}
          >
            <Select
              container={host}
              label="Team inside modal"
              value={value}
              onValueChange={setValue}
              options={[
                { value: "east", label: "East team" },
                { value: "west", label: "West team with a longer accessible label" },
              ]}
            />
            <Dialog.Actions>
              <Dialog.Close render={<Button />}>Close preferences</Dialog.Close>
            </Dialog.Actions>
          </Dialog.Content>
        </Dialog>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await page.viewport(320, 600);
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Edit team" }));
    const trigger = await within(document.body).findByRole("combobox", {
      name: "Team inside modal",
    });
    await userEvent.click(trigger);
    const option = await within(document.body).findByRole("option", { name: /West team/ });
    await waitFor(() => expect(option).toBeVisible());
    const rect = option.getBoundingClientRect();
    await expect(
      rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight,
    ).toBe(true);
    await userEvent.click(option);
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(trigger).toHaveTextContent("West team");
    await userEvent.click(trigger);
    await waitFor(() => expect(within(document.body).getByRole("listbox")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(within(document.body).getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(c.getByRole("button", { name: "Edit team" })).toHaveFocus());
  },
};
