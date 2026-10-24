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
