import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Combobox, type ComboboxOption, type ComboboxSingleProps } from "./Combobox";

const regionOptions: ComboboxOption[] = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "eu-west-1", label: "EU West (Ireland)" },
  { value: "eu-central-1", label: "EU Central (Frankfurt)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai)", disabled: true },
  { value: "sa-east-1", label: "South America (São Paulo)" },
];

function ComboboxExample({ value: initial, ...props }: ComboboxSingleProps) {
  const [value, setValue] = useState<string | null>(initial);
  return <Combobox {...props} value={value} onValueChange={setValue} />;
}

const meta = {
  title: "Components/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  args: {
    label: "Deployment region",
    options: regionOptions,
    value: null,
    onValueChange: (_value: string | null) => {},
    placeholder: "Search regions...",
    description: "Type to filter regions by name.",
  },
  render: (args) => <ComboboxExample {...args} />,
} satisfies Meta<ComboboxSingleProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("combobox", { name: "Deployment region" });

    await userEvent.click(input);
    await userEvent.type(input, "Frank");

    const option = await body.findByRole("option", { name: "EU Central (Frankfurt)" });
    await userEvent.click(option);
    await expect(input).toHaveValue("EU Central (Frankfurt)");
    await waitFor(() => expect(body.queryByRole("listbox")).toBeNull());
  },
};

export const Preselected: Story = {
  args: {
    value: "eu-west-1",
    description: "Clear the current region or type to pick another.",
  },
};

function MultipleComboboxExample(props: ComboboxSingleProps) {
  const [value, setValue] = useState<string[]>([]);
  return <Combobox {...props} multiple value={value} onValueChange={setValue} />;
}

export const Multiple: Story = {
  args: { description: "Select multiple regions. Remove chips individually or clear all." },
  render: (args) => <MultipleComboboxExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Deployment region" });
    await userEvent.click(input);
    await userEvent.type(input, "US");
    await userEvent.click(await canvas.findByRole("option", { name: "US East (N. Virginia)" }));
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(await canvas.findByRole("option", { name: "US West (Oregon)" }));
    await expect(canvas.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    await userEvent.keyboard("{Escape}");
    await expect(
      await canvas.findByRole("button", { name: "Remove US East (N. Virginia)" }),
    ).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Remove US West (Oregon)" })).toBeVisible();
  },
};

export const MultipleFormValidation: Story = {
  tags: ["!dev", "!autodocs"],
  args: { required: true, name: "regions" },
  render: (args) => (
    <form aria-label="Deployment">
      <MultipleComboboxExample {...args} />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Deployment" });
    const input = canvas.getByRole("combobox", { name: "Deployment region" });
    await expect(form.checkValidity()).toBe(false);
    await userEvent.click(input);
    await userEvent.type(input, "Frank");
    await expect(form.checkValidity()).toBe(false);
    await expect(new FormData(form).getAll("regions")).toEqual([]);

    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(form.checkValidity()).toBe(true);
    await expect(new FormData(form).getAll("regions")).toEqual(["eu-central-1"]);

    await userEvent.keyboard("{Escape}");
    await userEvent.click(canvas.getByRole("button", { name: "Clear Deployment region" }));
    await expect(form.checkValidity()).toBe(false);
    await expect(new FormData(form).getAll("regions")).toEqual([]);
  },
};

export const Invalid: Story = {
  args: {
    description: "Choose a primary failover region.",
    error: "Select a valid deployment region.",
  },
};

export const Empty: Story = {
  args: {
    options: [],
    placeholder: "Search archive regions...",
    emptyMessage: "No regions match your filter.",
    description: "Remains interactive when the option list is empty.",
  },
};

export const Disabled: Story = {
  args: {
    value: "us-west-2",
    disabled: true,
    description: "Region changes are locked during failover.",
  },
};

export const ReadOnly: Story = {
  args: {
    value: "us-east-1",
    readOnly: true,
    description: "Read-only while a deployment is in progress.",
  },
};

export const TokenOverrides: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args) => (
    <ComboboxExample
      {...args}
      style={
        {
          "--kb-input-radius": "0px",
          "--kb-input-height-md": "3rem",
        } as CSSProperties
      }
    />
  ),
};
