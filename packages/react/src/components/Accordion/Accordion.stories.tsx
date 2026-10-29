import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Accordion } from "./Accordion";

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
} satisfies Meta<typeof Accordion>;
export default meta;
type Story = StoryObj<typeof meta>;

function Questions() {
  return (
    <>
      <Accordion.Item value="delivery">
        <Accordion.Header>
          <Accordion.Trigger>When will my order arrive?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          Orders dispatch within two working days. Your tracking link stays available in your
          account.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="returns">
        <Accordion.Header>
          <Accordion.Trigger>Can I return an item?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          Contact support with your order number to arrange a return.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="collection" disabled>
        <Accordion.Header>
          <Accordion.Trigger>Local collection unavailable</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Collection is currently unavailable.</Accordion.Panel>
      </Accordion.Item>
    </>
  );
}
export const Default: Story = {
  render: () => (
    <Accordion>
      <Questions />
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const delivery = canvas.getByRole("button", { name: "When will my order arrive?" });
    const returns = canvas.getByRole("button", { name: "Can I return an item?" });
    await userEvent.click(delivery);
    await expect(canvas.getByRole("region", { name: "When will my order arrive?" })).toBeVisible();
    await userEvent.click(returns);
    await expect(delivery).toHaveAttribute("aria-expanded", "false");
    await expect(returns).toHaveAttribute("aria-expanded", "true");
  },
};
export const Multiple: Story = {
  render: () => (
    <Accordion multiple defaultValue={["delivery", "returns"]}>
      <Questions />
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("region")).toHaveLength(2);
    await userEvent.click(canvas.getByRole("button", { name: "When will my order arrive?" }));
    await expect(canvas.getByRole("button", { name: "Can I return an item?" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  },
};
function ControlledExample() {
  const [value, setValue] = useState<string[]>(["delivery"]);
  return (
    <Accordion value={value} onValueChange={setValue}>
      <Questions />
    </Accordion>
  );
}
export const Controlled: Story = { render: () => <ControlledExample /> };
export const Disabled: Story = {
  render: () => (
    <Accordion disabled defaultValue={["delivery"]}>
      <Questions />
    </Accordion>
  ),
};
export const Nested: Story = {
  render: () => (
    <Accordion defaultValue={["account"]}>
      <Accordion.Item value="account">
        <Accordion.Header render={(props) => <h2 {...props} />}>
          <Accordion.Trigger>Account details</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          <Accordion>
            <Accordion.Item value="privacy">
              <Accordion.Header>
                <Accordion.Trigger>Privacy preferences</Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel>Choose which account updates you receive.</Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Privacy preferences" }));
    await expect(canvas.getByRole("button", { name: "Account details" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(canvas.getByRole("region", { name: "Privacy preferences" })).toBeVisible();
  },
};
