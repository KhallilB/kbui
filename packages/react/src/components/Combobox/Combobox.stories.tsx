import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Combobox, type ComboboxOption, type ComboboxProps } from "./Combobox";

const regionOptions: ComboboxOption[] = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "eu-west-1", label: "EU West (Ireland)" },
  { value: "eu-central-1", label: "EU Central (Frankfurt)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai)", disabled: true },
  { value: "sa-east-1", label: "South America (São Paulo)" },
];

function ComboboxExample({ value: initial, ...props }: ComboboxProps) {
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
} satisfies Meta<typeof Combobox>;

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
