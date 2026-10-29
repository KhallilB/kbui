import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { MultiSelect, type MultiSelectOption, type MultiSelectProps } from "./MultiSelect";

const scopeOptions: MultiSelectOption[] = [
  { value: "payments:read", label: "Payments read" },
  { value: "payments:write", label: "Payments write" },
  { value: "webhooks:manage", label: "Webhooks" },
  { value: "reporting:export", label: "Reporting export" },
  { value: "customers:read", label: "Customers read" },
  { value: "disputes:manage", label: "Disputes" },
  { value: "ledger:admin", label: "Ledger admin", disabled: true },
];

function MultiSelectExample({ value: initial, ...props }: MultiSelectProps) {
  const [value, setValue] = useState<readonly string[]>(initial);
  return <MultiSelect {...props} value={value} onValueChange={setValue} />;
}

const meta = {
  title: "Components/MultiSelect",
  component: MultiSelect,
  tags: ["autodocs"],
  args: {
    label: "API scopes",
    options: scopeOptions,
    value: ["payments:read", "webhooks:manage"],
    onValueChange: (_value: string[]) => {},
    placeholder: "Filter scopes...",
    description: "Search and attach one or more permission scopes.",
  },
  render: (args) => <MultiSelectExample {...args} />,
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const removeWebhooks = canvas.getByRole("button", { name: "Remove Webhooks" });
    await userEvent.click(removeWebhooks);
    await expect(canvas.queryByRole("button", { name: "Remove Webhooks" })).toBeNull();
    const input = canvas.getByRole("combobox", { name: "API scopes" });
    await userEvent.click(input);
    await userEvent.type(input, "Payments");
    await userEvent.click(await canvas.findByRole("option", { name: "Payments write" }));
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("option", { name: "Payments read" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.getByRole("option", { name: "Payments write" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.keyboard("{Escape}");
    await expect(await canvas.findByRole("button", { name: "Remove Payments read" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Remove Payments write" })).toBeVisible();
  },
};

export const ManySelections: Story = {
  args: {
    value: [
      "payments:read",
      "payments:write",
      "webhooks:manage",
      "reporting:export",
      "customers:read",
    ],
    description: "Selected chips wrap cleanly across lines inside bounded containers.",
  },
};

export const Invalid: Story = {
  args: {
    value: [],
    description: "Assign scopes for this key.",
    error: "Select at least one permission scope.",
  },
};

export const Empty: Story = {
  args: {
    options: [],
    value: [],
    placeholder: "Search custom scopes...",
    emptyMessage: "No matching scopes found.",
    description: "Remains interactive when no options are available.",
  },
};

export const Disabled: Story = {
  args: {
    value: ["customers:read"],
    disabled: true,
    description: "Revoked keys cannot modify scopes.",
  },
};

export const ReadOnly: Story = {
  args: {
    value: ["payments:read", "reporting:export"],
    readOnly: true,
    description: "Read-only while key rotation is active.",
  },
};

export const TokenOverrides: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args) => (
    <MultiSelectExample
      {...args}
      style={
        {
          "--kb-input-radius": "0px",
          "--kb-input-height-md": "3rem",
          "--kb-multiselect-chip-radius": "2px",
        } as CSSProperties
      }
    />
  ),
};
