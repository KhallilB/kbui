import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { ToggleButton } from "../ToggleButton/ToggleButton";
import { ToggleGroup } from "./ToggleGroup";

const meta = {
  title: "Components/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ToggleGroup aria-label="Text formatting" defaultValue={["bold"]}>
      <ToggleButton value="bold">Bold</ToggleButton>
      <ToggleButton value="italic" disabled>
        Italic
      </ToggleButton>
      <ToggleButton value="underline">Underline</ToggleButton>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = within(canvas.getByRole("group", { name: "Text formatting" }));
    const bold = group.getByRole("button", { name: "Bold", pressed: true });
    const underline = group.getByRole("button", { name: "Underline", pressed: false });

    await userEvent.tab();
    expect(bold).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(underline).toHaveFocus();
    expect(underline).toHaveAttribute("aria-pressed", "false");
    await userEvent.keyboard(" ");
    expect(underline).toHaveAttribute("aria-pressed", "true");
    expect(bold).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard(" ");
  },
};

export const Vertical: Story = {
  render: () => (
    <ToggleGroup aria-label="Map layers" orientation="vertical" loopFocus={false}>
      <ToggleButton value="roads">Roads</ToggleButton>
      <ToggleButton value="water">Water</ToggleButton>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const roads = canvas.getByRole("button", { name: "Roads", pressed: false });
    const water = canvas.getByRole("button", { name: "Water", pressed: false });
    expect(water.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      roads.getBoundingClientRect().bottom,
    );

    await userEvent.tab();
    expect(roads).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    expect(roads).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(water).toHaveFocus();
    await userEvent.keyboard("{End}{Enter}");
    expect(water).toHaveAttribute("aria-pressed", "true");
    expect(roads).toHaveAttribute("aria-pressed", "false");
    await userEvent.keyboard("{Enter}");
  },
};

function ChangingOptions() {
  const [disabled, setDisabled] = useState(false);
  return (
    <div dir="rtl">
      <button type="button" onClick={() => setDisabled(true)}>
        Limit formatting
      </button>
      <ToggleGroup aria-label="Text formatting" loopFocus={false}>
        <ToggleButton value="bold" disabled={disabled}>
          Bold
        </ToggleButton>
        <ToggleButton value="underline">Underline</ToggleButton>
      </ToggleGroup>
      <button type="button">Next action</button>
    </div>
  );
}

export const NativeFocus: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => <ChangingOptions />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const bold = canvas.getByRole("button", { name: "Bold" });
    const underline = canvas.getByRole("button", { name: "Underline" });
    await expect(underline.getBoundingClientRect().left).toBeLessThan(
      bold.getBoundingClientRect().left,
    );

    await userEvent.tab();
    await userEvent.tab();
    await expect(bold).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(underline).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(bold).toHaveFocus();

    await userEvent.click(canvas.getByRole("button", { name: "Limit formatting" }));
    await expect(bold).toBeDisabled();
    await userEvent.tab();
    await expect(underline).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Next action" })).toHaveFocus();
  },
};

export const NativeHidden: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <>
      <ToggleGroup aria-label="Unavailable layers" hidden orientation="vertical">
        <ToggleButton value="roads">Roads</ToggleButton>
      </ToggleGroup>
      <ToggleButton hidden>Show grid</ToggleButton>
      <ToggleGroup aria-label="Text formatting">
        <ToggleButton value="strike" hidden>
          Strike
        </ToggleButton>
        <ToggleButton value="bold">Bold</ToggleButton>
      </ToggleGroup>
      <button type="button">Next action</button>
    </>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    for (const text of ["Strike", "Roads", "Show grid"]) {
      await expect(canvas.getByText(text)).not.toBeVisible();
    }
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Next action" })).toHaveFocus();
  },
};
