import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { RadioGroup, type RadioGroupProps } from "./RadioGroup";

function RadioExample({
  value: initial,
  resettable = false,
  style,
  className,
  classNames,
  ...props
}: RadioGroupProps & { resettable?: boolean }) {
  const [value, setValue] = useState<string | null>(initial);
  const roomy = value === "roomy";
  const choiceClass = `radio-playground-choice${roomy ? " radio-playground-roomy" : ""}`;
  return (
    <div>
      <style>{`
        .radio-playground-roomy {
          padding-block: var(--kb-space-3);
          padding-inline: var(--kb-space-4);
          gap: var(--kb-space-3);
        }
        @media (prefers-reduced-motion: no-preference) {
          .radio-playground-density[data-selection-motion="slide"] {
            --radio-playground-duration: calc(var(--kb-motion-duration-slow) + var(--kb-motion-duration-fast));
            transition: row-gap var(--radio-playground-duration) var(--kb-motion-easing-smooth);
          }
          .radio-playground-density[data-selection-motion="slide"] .radio-playground-choice {
            transition-property: min-block-size, padding-block, padding-inline, gap, color, background-color, border-color, box-shadow;
            transition-duration: var(--radio-playground-duration);
            transition-timing-function: var(--kb-motion-easing-smooth);
          }
          .radio-playground-density[data-selection-motion="slide"] .radio-playground-track {
            transition: border-radius var(--radio-playground-duration) var(--kb-motion-easing-smooth);
          }
          /* Layout animates bounds; avoid easing measured sizes twice. */
          .radio-playground-density[data-selection-motion="slide"] .kb-radiogroup-selection {
            transition-property: transform;
          }
        }
      `}</style>
      {resettable && (
        <Button type="button" variant="secondary" size="sm" onClick={() => setValue(initial)}>
          Reset display
        </Button>
      )}
      <RadioGroup
        {...props}
        className={["radio-playground-density", className].filter(Boolean).join(" ")}
        classNames={{
          ...classNames,
          options: ["radio-playground-track", classNames?.options].filter(Boolean).join(" "),
        }}
        value={value}
        onValueChange={setValue}
        style={
          {
            ...(roomy && {
              "--kb-radiogroup-gap": "var(--kb-space-4)",
              "--kb-input-height-md": "calc(var(--kb-input-height-lg) + var(--kb-space-2))",
            }),
            ...style,
          } as CSSProperties
        }
      >
        <RadioGroup.Item value="compact" className={choiceClass}>
          Compact
        </RadioGroup.Item>
        <RadioGroup.Item value="locked" disabled className={choiceClass}>
          Unavailable
        </RadioGroup.Item>
        <RadioGroup.Item value="roomy" className={choiceClass}>
          Roomy
        </RadioGroup.Item>
      </RadioGroup>
    </div>
  );
}
function ResettableRadioExample(props: RadioGroupProps) {
  return <RadioExample {...props} resettable />;
}
const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  args: { label: "Display", value: "compact", onValueChange: (_value: string) => {} },
  argTypes: {
    selectionMotion: { control: "inline-radio", options: ["slide", "none"] },
    selectionTone: { control: "inline-radio", options: ["primary", "neutral"] },
  },
  render: (args) => <RadioExample {...args} />,
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const available = c.getByRole("radio", { name: "Roomy" });
    const compactHeight = available.closest("label")?.getBoundingClientRect().height ?? 0;
    const forced = matchMedia("(forced-colors: active)").matches;
    if (!forced) {
      expect(getComputedStyle(available).boxShadow).toContain("inset");
      expect(getComputedStyle(available).backgroundImage).not.toBe("none");
    }
    c.getByRole("radio", { name: "Compact" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(available).toBeChecked();
    await waitFor(() =>
      expect(available.closest("label")?.getBoundingClientRect().height).toBeGreaterThan(
        compactHeight,
      ),
    );
    expect(getComputedStyle(available).outlineOffset).toBe("-2px");
    if (forced)
      expect(getComputedStyle(available).outlineColor).not.toBe(
        getComputedStyle(available).backgroundColor,
      );
    await userEvent.click(c.getByRole("radio", { name: "Compact" }));
    expect(c.getByRole("radio", { name: "Compact" })).toBeChecked();
    await waitFor(() =>
      expect(available.closest("label")?.getBoundingClientRect().height).toBe(compactHeight),
    );
  },
};
export const EmptySelection: Story = { args: { value: null } };
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = {
  args: { description: "Choose one display", error: "A display is required" },
};
export const TokenOverrides: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args) => (
    <RadioExample
      {...args}
      style={{ "--kb-radiogroup-gap": "1.5rem", "--kb-radiogroup-size": "2rem" } as CSSProperties}
    />
  ),
};
export const SelectedMaterial: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div>
      <style>{".material-choice { background: #261b22; color: #fff2df; padding: 1rem; }"}</style>
      <RadioGroup label="Program date" value="friday" onValueChange={() => {}}>
        <RadioGroup.Item value="friday" className="material-choice">
          Friday evening
        </RadioGroup.Item>
      </RadioGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(within(canvasElement).getByText("Friday evening")).color).toBe(
      "rgb(255, 242, 223)",
    );
  },
};

export const Segmented: Story = {
  render: (args) => <ResettableRadioExample {...args} />,
  args: { appearance: "segmented" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const compact = c.getByRole("radio", { name: "Compact" });
    const roomy = c.getByRole("radio", { name: "Roomy" });
    const compactLabel = compact.closest("label");
    const roomyLabel = roomy.closest("label");
    if (!compactLabel || !roomyLabel) throw new Error("Missing segmented labels");
    const group = c.getByRole("radiogroup", { name: "Display" });
    const compactHeight = compactLabel.getBoundingClientRect().height;
    const compactGap = Number.parseFloat(getComputedStyle(group).rowGap);
    const selection = canvasElement.querySelector(".kb-radiogroup-selection");
    if (!selection) throw new Error("Missing segmented selection");
    if (matchMedia("(forced-colors: active)").matches) {
      expect(getComputedStyle(selection).display).toBe("none");
      expect(getComputedStyle(compactLabel).backgroundColor).not.toBe(
        getComputedStyle(compactLabel).color,
      );
    } else {
      expect(getComputedStyle(selection).boxShadow).not.toBe("none");
    }
    expect(getComputedStyle(roomyLabel).boxShadow).toBe("none");
    compact.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(roomy).toBeChecked();
    await waitFor(() => {
      expect(roomyLabel.getBoundingClientRect().height).toBeGreaterThan(compactHeight);
      expect(Number.parseFloat(getComputedStyle(group).rowGap)).toBeGreaterThan(compactGap);
    });
    expect(getComputedStyle(roomyLabel).outlineOffset).toBe("-2px");
    const reset = c.getByRole("button", { name: "Reset display" });
    await userEvent.click(reset);
    expect(reset).toHaveFocus();
    expect(compact).toBeChecked();
    await waitFor(() => {
      expect(compactLabel.getBoundingClientRect().height).toBe(compactHeight);
      expect(Number.parseFloat(getComputedStyle(group).rowGap)).toBe(compactGap);
    });
    expect(compact.tabIndex).toBe(0);
    expect(roomy.tabIndex).toBe(-1);
    await userEvent.tab();
    expect(compact).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(roomy).toHaveFocus();
    expect(roomy).toBeChecked();
  },
};

export const SlidingSelection: Story = {
  args: { appearance: "segmented" },
  render: (args) => (
    <div style={{ width: "min(100%, 26rem)" }}>
      <ResettableRadioExample {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const group = c.getByRole("radiogroup", { name: "Display" });
    const compact = c.getByRole("radio", { name: "Compact" });
    const roomy = c.getByRole("radio", { name: "Roomy" });
    const compactLabel = compact.closest("label");
    const roomyLabel = roomy.closest("label");
    if (!compactLabel || !roomyLabel) throw new Error("Missing segmented labels");
    const indicator = await waitFor(() => {
      const element = group.querySelector<HTMLElement>(".kb-radiogroup-selection");
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    const matches = (label: HTMLElement) => {
      const actual = indicator.getBoundingClientRect();
      const expected = label.getBoundingClientRect();
      for (const edge of ["x", "y", "width", "height"] as const)
        expect(Math.abs(actual[edge] - expected[edge])).toBeLessThan(1);
    };
    matches(compactLabel);
    expect(indicator).toHaveAttribute("aria-hidden", "true");
    compact.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(roomy).toBeChecked();
    expect(group.querySelector(".kb-radiogroup-selection")).toBe(indicator);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      expect(indicator.getAnimations()).toHaveLength(0);
    } else {
      const movement = await waitFor(() => {
        const animation = indicator
          .getAnimations()
          .find((item) => item instanceof CSSTransition && item.transitionProperty === "transform");
        expect(animation).toBeDefined();
        return animation as Animation;
      });
      movement.pause();
      movement.currentTime = Number(movement.effect?.getTiming().duration) / 2;
      const halfway = indicator.getBoundingClientRect().x;
      expect(halfway).toBeGreaterThan(compactLabel.getBoundingClientRect().x);
      expect(halfway).toBeLessThan(roomyLabel.getBoundingClientRect().x);
      for (const animation of indicator.getAnimations()) animation.finish();
    }
    await waitFor(() => matches(roomyLabel));
    group.style.width = "180px";
    await waitFor(() => matches(roomyLabel));
    await userEvent.click(c.getByRole("button", { name: "Reset display" }));
    expect(compact).toBeChecked();
    await waitFor(() => matches(compactLabel));
  },
};

export const InstantSelection: Story = {
  args: { appearance: "segmented", selectionMotion: "none" },
  render: (args) => <ResettableRadioExample {...args} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const compact = c.getByRole("radio", { name: "Compact" });
    const roomy = c.getByRole("radio", { name: "Roomy" });
    const indicator = canvasElement.querySelector(".kb-radiogroup-selection");
    const target = roomy.closest("label");
    if (!indicator || !target) throw new Error("Missing segmented selection");
    compact.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(roomy).toBeChecked();
    expect(indicator.getAnimations()).toHaveLength(0);
    expect(
      Math.abs(indicator.getBoundingClientRect().x - target.getBoundingClientRect().x),
    ).toBeLessThan(1);
  },
};

export const NeutralSelection: Story = {
  ...Segmented,
  args: { appearance: "segmented", selectionTone: "neutral" },
};

export const DensityMotion: Story = {
  ...SlidingSelection,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("radiogroup", { name: "Display" });
    const track = group.querySelector(".kb-radiogroup-options");
    const pill = group.querySelector(".kb-radiogroup-selection");
    const roomy = canvas.getByRole("radio", { name: "Roomy" });
    const label = roomy.closest("label");
    if (!track || !pill || !label) throw new Error("Missing density geometry");
    const compactHeight = label.getBoundingClientRect().height;
    const compactTrack = track.getBoundingClientRect().height;
    await userEvent.click(roomy);
    expect(roomy).toBeChecked();
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      await waitFor(() => {
        expect(
          label
            .getAnimations()
            .some(
              (animation) =>
                animation instanceof CSSTransition &&
                animation.transitionProperty.startsWith("min-"),
            ),
        ).toBe(true);
      });
      const layout = group
        .getAnimations({ subtree: true })
        .filter(
          (animation) =>
            animation.effect instanceof KeyframeEffect && animation.effect.target !== pill,
        );
      for (const animation of layout) {
        animation.pause();
        animation.currentTime = Number(animation.effect?.getTiming().duration) / 2;
      }
      const midwayHeight = label.getBoundingClientRect().height;
      expect(midwayHeight).toBeGreaterThan(compactHeight);
      expect(midwayHeight).toBeLessThan(56);
      expect(track.getBoundingClientRect().height).toBeGreaterThan(compactTrack);
      expect(track.getBoundingClientRect().height).toBeLessThan(66);
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      expect(Math.abs(pill.getBoundingClientRect().height - midwayHeight)).toBeLessThan(1);
      expect(
        Math.abs(pill.getBoundingClientRect().width - label.getBoundingClientRect().width),
      ).toBeLessThan(1);
      for (const animation of layout) animation.finish();
    }
    await waitFor(() => {
      expect(label.getBoundingClientRect().height).toBe(56);
      expect(pill.getBoundingClientRect().height).toBe(56);
      expect(track.getBoundingClientRect().height).toBe(66);
    });
    await userEvent.click(canvas.getByRole("button", { name: "Reset display" }));
    await waitFor(() => {
      expect(label.getBoundingClientRect().height).toBe(compactHeight);
      expect(pill.getBoundingClientRect().height).toBe(compactHeight);
      expect(track.getBoundingClientRect().height).toBe(compactTrack);
    });
  },
};

export const PrimaryContrast: Story = {
  args: { appearance: "segmented" },
  render: (args) => (
    <div>
      <RadioExample {...args} />
      <Button>Primary action</Button>
    </div>
  ),
  play: async ({ canvasElement, globals }) => {
    if (globals.previewTheme === "light" || globals.previewTheme === "dark")
      await waitFor(() =>
        expect(document.documentElement.dataset.theme).toBe(globals.previewTheme),
      );
    const canvas = within(canvasElement);
    const pill = canvasElement.querySelector(".kb-radiogroup-selection");
    if (!pill) throw new Error("Missing primary selection");
    await waitFor(() =>
      expect(canvas.getByText("Compact").closest("label")?.getAnimations()).toHaveLength(0),
    );
    const foreground = getComputedStyle(canvas.getByText("Compact")).color;
    const background = getComputedStyle(pill).backgroundColor;
    const luminance = (color: string) => {
      const channels = color
        .match(/[\d.]+/g)
        ?.slice(0, 3)
        .map(Number);
      if (channels?.length !== 3) throw new Error(`Unexpected color: ${color}`);
      return channels.reduce((sum, value, index) => {
        const channel = value / 255;
        const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        return sum + linear * ([0.2126, 0.7152, 0.0722][index] ?? 0);
      }, 0);
    };
    const a = luminance(foreground);
    const b = luminance(background);
    expect((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toBeGreaterThanOrEqual(4.5);
    if (document.documentElement.dataset.theme === "dark") {
      expect(foreground).toBe("rgb(255, 255, 255)");
      const action = getComputedStyle(canvas.getByRole("button", { name: "Primary action" }));
      expect(action.backgroundColor).toBe(background);
      expect(action.color).toBe(foreground);
    }
  },
};

export const SelectionTones: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args) => (
    <div
      style={
        {
          background: "#ffffff",
          padding: "1rem",
          "--kb-color-accent": "#1b4fa3",
          "--kb-color-accent-fg": "#ffffff",
          "--kb-radiogroup-primary-background": "#1b4fa3",
          "--kb-radiogroup-primary-color": "#ffffff",
          "--kb-material-raised-face": "linear-gradient(#eeeeee, #dddddd)",
          "--kb-color-fg": "#112233",
        } as CSSProperties
      }
    >
      <RadioExample {...args} label="Primary default" appearance="segmented" />
      <RadioExample
        {...args}
        label="Neutral choice"
        appearance="segmented"
        selectionTone="neutral"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const primary = canvas.getByRole("radiogroup", { name: "Primary default" });
    const neutral = canvas.getByRole("radiogroup", { name: "Neutral choice" });
    const primaryPill = primary.querySelector(".kb-radiogroup-selection");
    const neutralPill = neutral.querySelector(".kb-radiogroup-selection");
    if (!primaryPill || !neutralPill) throw new Error("Missing selection pills");
    expect(getComputedStyle(primaryPill).backgroundColor).toBe("rgb(27, 79, 163)");
    expect(getComputedStyle(neutralPill).backgroundImage).toContain("rgb(238, 238, 238)");
    expect(getComputedStyle(within(primary).getByText("Compact")).color).toBe("rgb(255, 255, 255)");
    expect(getComputedStyle(within(neutral).getByText("Compact")).color).toBe("rgb(17, 34, 51)");
  },
};

export const SegmentedUpdates: Story = {
  tags: ["!dev", "!autodocs"],
  render: function Updates() {
    const [value, setValue] = useState<string | null>("compact");
    const [showRoomy, setShowRoomy] = useState(true);
    const [segmented, setSegmented] = useState(true);
    return (
      <div>
        <Button onClick={() => setValue(null)}>Clear selection</Button>
        <Button onClick={() => setValue("missing")}>Unknown selection</Button>
        <Button onClick={() => setValue("compact")}>Reset selection</Button>
        <Button onClick={() => setShowRoomy(false)}>Remove Roomy</Button>
        <Button onClick={() => setSegmented(!segmented)}>Toggle appearance</Button>
        <RadioGroup
          label="Display"
          value={value}
          onValueChange={() => {}}
          appearance={segmented ? "segmented" : "standard"}
        >
          <RadioGroup.Item value="compact">Compact</RadioGroup.Item>
          {showRoomy && <RadioGroup.Item value="roomy">Roomy</RadioGroup.Item>}
        </RadioGroup>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const group = c.getByRole("radiogroup", { name: "Display" });
    const selection = () => group.querySelector(".kb-radiogroup-selection");
    const compact = c.getByRole("radio", { name: "Compact" });
    const indicator = await waitFor(() => {
      expect(selection()).not.toBeNull();
      return selection();
    });
    const start = indicator?.getBoundingClientRect().x;
    compact.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(c.getByRole("radio", { name: "Roomy" })).toHaveFocus();
    expect(compact).toBeChecked();
    expect(selection()?.getBoundingClientRect().x).toBe(start);
    await userEvent.click(c.getByRole("button", { name: "Remove Roomy" }));
    await waitFor(() => {
      expect(selection()?.getBoundingClientRect().width).toBeCloseTo(
        compact.closest("label")?.getBoundingClientRect().width ?? 0,
        0,
      );
    });
    for (const action of ["Clear selection", "Unknown selection"]) {
      await userEvent.click(c.getByRole("button", { name: action }));
      await waitFor(() => expect(selection()).toBeNull());
    }
    await userEvent.click(c.getByRole("button", { name: "Reset selection" }));
    await waitFor(() => expect(selection()).not.toBeNull());
    await userEvent.click(c.getByRole("button", { name: "Toggle appearance" }));
    expect(selection()).toBeNull();
    expect(c.getByRole("radio", { name: "Compact" })).toBe(compact);
    await userEvent.click(c.getByRole("button", { name: "Toggle appearance" }));
    await waitFor(() => expect(selection()).not.toBeNull());
    expect(c.getByRole("radio", { name: "Compact" })).toBe(compact);
  },
};
