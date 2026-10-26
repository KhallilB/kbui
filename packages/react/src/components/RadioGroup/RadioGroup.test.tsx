import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { flushSync } from "react-dom";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup } from "./RadioGroup";

function Example() {
  const [value, setValue] = useState<string | null>("clay");
  return (
    <RadioGroup label="Finish" value={value} onValueChange={setValue}>
      <RadioGroup.Item value="clay">Clay</RadioGroup.Item>
      <RadioGroup.Item value="chalk" disabled>
        Chalk
      </RadioGroup.Item>
      <RadioGroup.Item value="ink">Ink</RadioGroup.Item>
    </RadioGroup>
  );
}
describe("RadioGroup", () => {
  it("uses arrow navigation, skips disabled items and checks only one", async () => {
    render(<Example />);
    const clay = screen.getByRole("radio", { name: "Clay" });
    clay.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Ink" })).toBeChecked();
    expect(clay).not.toBeChecked();
  });
  it("supports null, named group, errors and root ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <RadioGroup
        ref={ref}
        label="Day"
        value={null}
        onValueChange={() => {}}
        description="Choose a day"
        error="Required"
      >
        <RadioGroup.Item value="fri">Friday</RadioGroup.Item>
      </RadioGroup>,
    );
    expect(ref.current).toBe(screen.getByRole("radiogroup", { name: "Day" }));
    expect(ref.current).toHaveAccessibleDescription("Choose a day Required");
    expect(screen.getByRole("radio")).not.toBeChecked();
  });
  it("blocks disabled group changes", async () => {
    const change = vi.fn();
    render(
      <RadioGroup label="Day" value={null} disabled onValueChange={change}>
        <RadioGroup.Item value="fri">Friday</RadioGroup.Item>
      </RadioGroup>,
    );
    await userEvent.click(screen.getByText("Friday"));
    expect(change).not.toHaveBeenCalled();
  });
});

it("preserves control identity and focus when appearance changes", () => {
  const choice = (appearance: "standard" | "segmented") => (
    <RadioGroup label="View" value="one" onValueChange={() => {}} appearance={appearance}>
      <RadioGroup.Item value="one">One</RadioGroup.Item>
    </RadioGroup>
  );
  const { rerender } = render(choice("standard"));
  const radio = screen.getByRole("radio");
  radio.focus();
  rerender(choice("segmented"));
  expect(screen.getByRole("radio")).toBe(radio);
  expect(radio).toHaveFocus();
  rerender(choice("standard"));
  expect(screen.getByRole("radio")).toBe(radio);
  expect(radio).toHaveFocus();
});
it("keeps native required, submission and caller-owned reset in segmented groups", async () => {
  function Form() {
    const [value, setValue] = useState<string | null>(null);
    return (
      <form aria-label="Preferences" onReset={() => setValue(null)}>
        <RadioGroup
          label="Finish"
          name="finish"
          value={value}
          onValueChange={setValue}
          appearance="segmented"
        >
          <RadioGroup.Item value="clay" required>
            Clay
          </RadioGroup.Item>
          <RadioGroup.Item value="ink" required>
            Ink
          </RadioGroup.Item>
        </RadioGroup>
        <button type="reset">Reset</button>
      </form>
    );
  }
  render(<Form />);
  const form = screen.getByRole("form") as HTMLFormElement;
  expect(form.checkValidity()).toBe(false);
  await userEvent.click(screen.getByText("Ink"));
  expect(new FormData(form).get("finish")).toBe("ink");
  expect(form.checkValidity()).toBe(true);
  await userEvent.click(screen.getByRole("button", { name: "Reset" }));
  expect(screen.getByRole("radio", { name: "Ink" })).not.toBeChecked();
  expect(new FormData(form).get("finish")).toBeNull();
  expect(form.checkValidity()).toBe(false);
});

it.each(["standard", "segmented"] as const)(
  "%s enters the checked radio after an outside controlled reset without remounting",
  async (appearance) => {
    const itemRef = createRef<HTMLSpanElement>();
    function Resettable() {
      const [value, setValue] = useState<string | null>("ink");
      return (
        <>
          <button type="button" onClick={() => setValue("clay")}>
            Reset outside
          </button>
          <RadioGroup label="Finish" value={value} onValueChange={setValue} appearance={appearance}>
            <RadioGroup.Item value="clay" ref={itemRef}>
              Clay
            </RadioGroup.Item>
            <RadioGroup.Item value="chalk" disabled>
              Chalk
            </RadioGroup.Item>
            <RadioGroup.Item value="ink">Ink</RadioGroup.Item>
          </RadioGroup>
        </>
      );
    }
    render(<Resettable />);
    const clay = screen.getByRole("radio", { name: "Clay" });
    const ink = screen.getByRole("radio", { name: "Ink" });
    const reset = screen.getByRole("button", { name: "Reset outside" });
    await userEvent.click(reset);
    expect(reset).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Clay" })).toBe(clay);
    expect(itemRef.current).toBe(clay);
    expect(clay).toBeChecked();
    expect(clay.tabIndex).toBe(0);
    expect(ink.tabIndex).toBe(-1);
    await userEvent.tab();
    expect(clay).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(ink).toHaveFocus();
    expect(ink).toBeChecked();
  },
);

it.each(["standard", "segmented"] as const)(
  "%s preserves current focus during external updates and uses checked entry after leaving",
  async (appearance) => {
    const choices = (value: string) => (
      <>
        <RadioGroup label="Finish" value={value} onValueChange={() => {}} appearance={appearance}>
          <RadioGroup.Item value="clay">Clay</RadioGroup.Item>
          <RadioGroup.Item value="ink">Ink</RadioGroup.Item>
        </RadioGroup>
        <button type="button">After group</button>
      </>
    );
    const { rerender } = render(choices("clay"));
    const clay = screen.getByRole("radio", { name: "Clay" });
    const ink = screen.getByRole("radio", { name: "Ink" });
    await userEvent.click(screen.getByText("Clay"));
    rerender(choices("ink"));
    expect(clay).toHaveFocus();
    expect(ink).toBeChecked();
    expect(clay.tabIndex).toBe(0);
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "After group" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(ink).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Clay" })).toBe(clay);
  },
);

it("keeps vendor arrow focus while the owner declines a selection request", async () => {
  const change = vi.fn();
  render(
    <>
      <RadioGroup label="Finish" value="clay" onValueChange={change} appearance="segmented">
        <RadioGroup.Item value="clay">Clay</RadioGroup.Item>
        <RadioGroup.Item value="ink">Ink</RadioGroup.Item>
      </RadioGroup>
      <button type="button">After group</button>
    </>,
  );
  const clay = screen.getByRole("radio", { name: "Clay" });
  const ink = screen.getByRole("radio", { name: "Ink" });
  await userEvent.click(screen.getByText("Clay"));
  await userEvent.keyboard("{ArrowRight}");
  expect(change).toHaveBeenCalledWith("ink");
  expect(clay).toBeChecked();
  expect(ink).toHaveFocus();
  expect(ink.tabIndex).toBe(0);
  expect(clay.tabIndex).toBe(-1);
  await userEvent.tab();
  expect(screen.getByRole("button", { name: "After group" })).toHaveFocus();
  await userEvent.tab({ shift: true });
  expect(clay).toHaveFocus();
});

it("keeps a safe vendor entry for null, unknown or disabled selected values", () => {
  const choices = (value: string | null, disabled = false) => (
    <RadioGroup label="Finish" value={value} onValueChange={() => {}} disabled={disabled}>
      <RadioGroup.Item value="clay">Clay</RadioGroup.Item>
      <RadioGroup.Item value="chalk" disabled>
        Chalk
      </RadioGroup.Item>
      <RadioGroup.Item value="ink">Ink</RadioGroup.Item>
    </RadioGroup>
  );
  const { rerender } = render(choices("ink"));
  for (const value of [null, "missing", "chalk"]) {
    rerender(choices(value));
    const entry = screen.getAllByRole("radio").filter((radio) => radio.tabIndex === 0);
    expect(entry).toHaveLength(1);
    expect(entry[0]).not.toHaveAttribute("aria-disabled", "true");
  }
  rerender(choices("ink", true));
  expect(screen.getAllByRole("radio").filter((radio) => radio.tabIndex === 0)).toHaveLength(0);
});

it("keeps an enabled entry when the initial checked option is disabled", async () => {
  function DisabledSelection() {
    const [value, setValue] = useState<string | null>("chalk");
    return (
      <RadioGroup label="Finish" value={value} onValueChange={setValue}>
        <RadioGroup.Item value="chalk" disabled>
          Chalk
        </RadioGroup.Item>
        <RadioGroup.Item value="ink">Ink</RadioGroup.Item>
      </RadioGroup>
    );
  }
  render(<DisabledSelection />);
  const ink = screen.getByRole("radio", { name: "Ink" });
  expect(ink.tabIndex).toBe(0);
  await userEvent.tab();
  expect(ink).toHaveFocus();
  await userEvent.keyboard(" ");
  expect(ink).toBeChecked();
});

it("keeps an enabled entry after the highlighted selected item becomes disabled outside", async () => {
  const choices = (disabled: boolean) => (
    <RadioGroup label="Finish" value="ink" onValueChange={() => {}}>
      <RadioGroup.Item value="clay">Clay</RadioGroup.Item>
      <RadioGroup.Item value="ink" disabled={disabled}>
        Ink
      </RadioGroup.Item>
    </RadioGroup>
  );
  const { rerender } = render(choices(false));
  const ink = screen.getByRole("radio", { name: "Ink" });
  expect(ink.tabIndex).toBe(0);
  rerender(choices(true));
  const clay = screen.getByRole("radio", { name: "Clay" });
  expect(ink.tabIndex).toBe(-1);
  expect(clay.tabIndex).toBe(0);
  await userEvent.tab();
  expect(clay).toHaveFocus();
});

it("respects explicit item tabIndex while keeping another eligible entry", async () => {
  render(
    <RadioGroup label="Finish" value="clay" onValueChange={() => {}}>
      <RadioGroup.Item value="clay" tabIndex={-1}>
        Clay
      </RadioGroup.Item>
      <RadioGroup.Item value="ink">Ink</RadioGroup.Item>
    </RadioGroup>,
  );
  expect(screen.getByRole("radio", { name: "Clay" }).tabIndex).toBe(-1);
  const ink = screen.getByRole("radio", { name: "Ink" });
  expect(ink.tabIndex).toBe(0);
  await userEvent.tab();
  expect(ink).toHaveFocus();
});

it("drops removed entries and preserves wrapped item refs and caller focus handlers", async () => {
  const focus = vi.fn();
  const blur = vi.fn();
  const rootRef = createRef<HTMLDivElement>();
  const itemRef = createRef<HTMLSpanElement>();
  const choices = (showClay: boolean) => (
    <>
      <RadioGroup
        ref={rootRef}
        label="Finish"
        value="clay"
        onValueChange={() => {}}
        onFocusCapture={focus}
        onBlurCapture={blur}
      >
        {showClay && <RadioGroup.Item value="clay">Clay</RadioGroup.Item>}
        <div>
          <RadioGroup.Item value="ink" ref={itemRef}>
            Ink
          </RadioGroup.Item>
        </div>
      </RadioGroup>
      <button type="button">After group</button>
    </>
  );
  const { rerender } = render(choices(true));
  const ink = screen.getByRole("radio", { name: "Ink" });
  rerender(choices(false));
  expect(itemRef.current).toBe(ink);
  expect(rootRef.current).toBe(screen.getByRole("radiogroup"));
  expect(ink.tabIndex).toBe(0);
  await userEvent.tab();
  expect(ink).toHaveFocus();
  expect(focus).toHaveBeenCalled();
  await userEvent.tab();
  expect(screen.getByRole("button", { name: "After group" })).toHaveFocus();
  expect(blur).toHaveBeenCalled();
});

it("releases inside focus when the focused item unmounts without blur", async () => {
  const choices = (showInk: boolean, value: string) => (
    <>
      <button type="button">Outside reset</button>
      <RadioGroup label="Finish" value={value} onValueChange={() => {}}>
        <RadioGroup.Item value="clay">Clay</RadioGroup.Item>
        {showInk && <RadioGroup.Item value="ink">Ink</RadioGroup.Item>}
        <RadioGroup.Item value="sand">Sand</RadioGroup.Item>
      </RadioGroup>
    </>
  );
  const { rerender } = render(choices(true, "ink"));
  const clay = screen.getByRole("radio", { name: "Clay" });
  await userEvent.click(screen.getByText("Ink"));
  rerender(choices(false, "clay"));
  expect(clay).toBeChecked();
  expect(clay).not.toHaveFocus();
  await userEvent.click(screen.getByRole("button", { name: "Outside reset" }));
  expect(clay.tabIndex).toBe(0);
  await userEvent.tab();
  expect(clay).toHaveFocus();
});

it("preserves focused vendor entry when a different item is removed", async () => {
  const choices = (showInk: boolean, value: string) => (
    <>
      <RadioGroup label="Finish" value={value} onValueChange={() => {}}>
        <RadioGroup.Item value="clay">Clay</RadioGroup.Item>
        {showInk && <RadioGroup.Item value="ink">Ink</RadioGroup.Item>}
        <RadioGroup.Item value="sand">Sand</RadioGroup.Item>
      </RadioGroup>
      <button type="button">After group</button>
    </>
  );
  const { rerender } = render(choices(true, "ink"));
  const sand = screen.getByRole("radio", { name: "Sand" });
  await userEvent.click(screen.getByText("Sand"));
  rerender(choices(false, "clay"));
  expect(sand).toHaveFocus();
  expect(sand.tabIndex).toBe(0);
  expect(screen.getByRole("radio", { name: "Clay" })).toBeChecked();
  await userEvent.tab();
  await userEvent.tab({ shift: true });
  expect(screen.getByRole("radio", { name: "Clay" })).toHaveFocus();
});

it("tracks focus before a forwarded handler synchronously removes its own control", async () => {
  const focus = vi.fn();
  function SelfRemoval() {
    const [showInk, setShowInk] = useState(true);
    const [value, setValue] = useState("ink");
    return (
      <>
        <button type="button">Outside reset</button>
        <RadioGroup label="Finish" value={value} onValueChange={setValue}>
          <RadioGroup.Item value="clay">Clay</RadioGroup.Item>
          {showInk && (
            <RadioGroup.Item
              value="ink"
              onFocus={(event) => {
                focus(event.currentTarget);
                flushSync(() => {
                  setShowInk(false);
                  setValue("clay");
                });
              }}
            >
              Ink
            </RadioGroup.Item>
          )}
          <RadioGroup.Item value="sand">Sand</RadioGroup.Item>
        </RadioGroup>
      </>
    );
  }
  render(<SelfRemoval />);
  const ink = screen.getByRole("radio", { name: "Ink" });
  const outside = screen.getByRole("button", { name: "Outside reset" });
  await userEvent.click(outside);
  await userEvent.tab();
  expect(focus).toHaveBeenCalledWith(ink);
  expect(screen.queryByRole("radio", { name: "Ink" })).toBeNull();
  const clay = screen.getByRole("radio", { name: "Clay" });
  expect(clay.tabIndex).toBe(0);
  await userEvent.click(outside);
  await userEvent.tab();
  expect(clay).toHaveFocus();
});
