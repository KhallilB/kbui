import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Input } from "../Input/Input";
import { Disclosure } from "./Disclosure";

const meta = {
  title: "Components/Disclosure",
  component: Disclosure,
  tags: ["autodocs"],
} satisfies Meta<typeof Disclosure>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Disclosure>
      <Disclosure.Trigger>Delivery details</Disclosure.Trigger>
      <Disclosure.Panel>
        Dispatch within two working days. Tracking arrives by email.
      </Disclosure.Panel>
    </Disclosure>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Delivery details" });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText(/Dispatch within/)).toBeVisible();
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const RetainedDraft: Story = {
  render: () => (
    <Disclosure defaultOpen>
      <Disclosure.Trigger>Advanced settings</Disclosure.Trigger>
      <Disclosure.Panel keepMounted render={<section inert={false} />}>
        <Input label="Reply-to address" defaultValue="team@example.com" />
      </Disclosure.Panel>
    </Disclosure>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Advanced settings" });
    await userEvent.clear(canvas.getByRole("textbox"));
    await userEvent.type(canvas.getByRole("textbox"), "draft@example.com");
    const draft = canvas.getByRole("textbox");
    await userEvent.click(trigger);
    // Native focus must reject controls throughout the closing transition.
    draft.focus();
    await expect(trigger).toHaveFocus();
    await waitFor(() => expect(canvas.queryByRole("textbox")).toBeNull());
    await userEvent.click(trigger);
    await expect(canvas.getByRole("textbox")).toHaveValue("draft@example.com");
  },
};

function ControlledExample() {
  const [open, setOpen] = useState(false);
  return (
    <Disclosure open={open} onOpenChange={setOpen}>
      <Disclosure.Trigger>{open ? "Hide" : "Show"} supporting context</Disclosure.Trigger>
      <Disclosure.Panel>Only this disclosure owns its open state.</Disclosure.Panel>
    </Disclosure>
  );
}
export const Controlled: Story = { render: () => <ControlledExample /> };
export const Disabled: Story = {
  render: () => (
    <Disclosure disabled>
      <Disclosure.Trigger>Details unavailable</Disclosure.Trigger>
      <Disclosure.Panel>Unavailable content</Disclosure.Panel>
    </Disclosure>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};
