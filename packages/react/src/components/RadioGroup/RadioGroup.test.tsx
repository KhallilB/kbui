import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
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
