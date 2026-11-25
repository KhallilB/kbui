import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Inline } from "../Inline/Inline";
import { FilterChip } from "./FilterChip";

const availabilityLabel = "Available now";
const regionLabel = "My region";
const assignmentLabel = "Assigned to me";
const longLabel = "Available for delivery in the northern service region";

function AvailabilityFilter({ label }: { label: string }) {
  const [selected, setSelected] = useState(false);
  return <FilterChip label={label} selected={selected} onSelectedChange={setSelected} />;
}

function AppliedFilter({ label, selectable = false }: { label: string; selectable?: boolean }) {
  const [included, setIncluded] = useState(true);
  const [selected, setSelected] = useState(true);
  const applyButton = useRef<HTMLButtonElement>(null);
  const removal = {
    label,
    onRemove: () => {
      setIncluded(false);
      applyButton.current?.focus();
    },
  };

  return (
    <Inline gap="sm">
      {included &&
        (selectable ? (
          <FilterChip {...removal} selected={selected} onSelectedChange={setSelected} />
        ) : (
          <FilterChip {...removal} />
        ))}
      <Button ref={applyButton} size="sm" variant="secondary" onClick={() => setIncluded(true)}>
        Apply filter
      </Button>
    </Inline>
  );
}

const meta = {
  title: "Components/FilterChip",
  component: FilterChip,
  tags: ["autodocs"],
  args: { label: availabilityLabel, selected: false, onSelectedChange: () => undefined },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <AvailabilityFilter label={availabilityLabel} />,
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByRole("button", {
      name: availabilityLabel,
      pressed: false,
    });
    const indicator = chip.querySelector("svg");
    if (!indicator) throw new Error("Missing selection indicator");
    const initialWidth = chip.getBoundingClientRect().width;
    await expect(getComputedStyle(indicator).visibility).toBe("hidden");

    chip.focus();
    await userEvent.keyboard(" ");
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(chip).toHaveFocus();
    await expect(getComputedStyle(indicator).visibility).toBe("visible");
    await expect(chip.getBoundingClientRect().width).toBe(initialWidth);
    await userEvent.keyboard("{Enter}");
    await expect(chip).toHaveAttribute("aria-pressed", "false");
  },
};

export const Removable: Story = {
  render: () => <AppliedFilter label={regionLabel} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const removeName = `Remove ${regionLabel}`;
    const remove = canvas.getByRole("button", { name: removeName });
    const apply = canvas.getByRole("button", { name: "Apply filter" });
    remove.focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByRole("button", { name: removeName })).not.toBeInTheDocument();
    await expect(apply).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("button", { name: removeName })).toBeVisible();
  },
};

export const SelectableAndRemovable: Story = {
  render: () => <AppliedFilter label={assignmentLabel} selectable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole("button", { name: assignmentLabel, pressed: true });
    const remove = canvas.getByRole("button", { name: `Remove ${assignmentLabel}` });
    const removeBounds = remove.getBoundingClientRect();
    await expect(removeBounds.width).toBeGreaterThanOrEqual(24);
    await expect(removeBounds.height).toBeGreaterThanOrEqual(24);
    select.focus();
    await userEvent.tab();
    await expect(remove).toHaveFocus();
    await expect(select).toHaveAttribute("aria-pressed", "true");
  },
};

export const Disabled: Story = {
  args: { label: assignmentLabel, selected: true, onRemove: () => undefined, disabled: true },
};

export const Hidden: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Inline>
      <Button>Before chip</Button>
      <FilterChip
        hidden
        label="Hidden filter"
        selected
        onSelectedChange={() => undefined}
        onRemove={() => undefined}
      />
      <Button>After chip</Button>
    </Inline>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Hidden filter");
    await expect(label).not.toBeVisible();
    canvas.getByRole("button", { name: "Before chip" }).focus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "After chip" })).toHaveFocus();
  },
};

export const Narrow: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div style={{ inlineSize: "12rem", maxInlineSize: "100%" }}>
      <FilterChip
        label={longLabel}
        selected
        onSelectedChange={() => undefined}
        onRemove={() => undefined}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole("button", { name: longLabel });
    const remove = canvas.getByRole("button", { name: `Remove ${longLabel}` });
    const text = canvas.getByText(longLabel);
    const host = select.closest("div");
    if (!host) throw new Error("Missing constrained chip host");
    await expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
    await expect(remove.getBoundingClientRect().right).toBeLessThanOrEqual(
      host.getBoundingClientRect().right,
    );
  },
};

export const ForcedColors: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <AvailabilityFilter label={availabilityLabel} />,
  play: async ({ canvasElement }) => {
    if (!matchMedia("(forced-colors: active)").matches) return;
    const chip = within(canvasElement).getByRole("button", {
      name: availabilityLabel,
      pressed: false,
    });
    const root = chip.parentElement;
    const indicator = chip.querySelector("svg");
    if (!root || !indicator) throw new Error("Missing chip parts");
    const initialBorder = getComputedStyle(root).borderTopColor;
    await userEvent.tab();
    await expect(chip).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(indicator).toBeVisible();
    await expect(getComputedStyle(chip).outlineStyle).toBe("solid");
    await expect(getComputedStyle(root).borderTopColor).not.toBe(initialBorder);
    await expect(getComputedStyle(chip).outlineColor).toBe(getComputedStyle(root).borderTopColor);
  },
};
