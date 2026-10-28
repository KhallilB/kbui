import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

function Example() {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      label="Select task"
      checked={checked}
      indeterminate={!checked}
      onCheckedChange={setChecked}
    />
  );
}
describe("Checkbox", () => {
  it("resolves mixed state to checked with Space", async () => {
    render(<Example />);
    const box = screen.getByRole("checkbox", { name: "Select task" });
    expect(box).toBePartiallyChecked();
    box.focus();
    await userEvent.keyboard(" ");
    expect(box).toBeChecked();
    expect(box).not.toBePartiallyChecked();
  });
  it("names and describes errors, forwards input ref and serializes checked value", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <form aria-label="Preferences">
        <Checkbox
          ref={ref}
          label="Notify"
          checked
          name="notify"
          value="yes"
          description="Email updates"
          error="Choose a channel"
          onCheckedChange={() => {}}
        />
      </form>,
    );
    const box = screen.getByRole("checkbox");
    expect(ref.current).toBe(box);
    expect(box).toHaveAccessibleDescription("Email updates Choose a channel");
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(new FormData(screen.getByRole("form") as HTMLFormElement).get("notify")).toBe("yes");

    render(
      <Checkbox label="Terms" checked={false} aria-invalid="grammar" onCheckedChange={() => {}} />,
    );
    const terms = screen.getByRole("checkbox", { name: "Terms" });
    expect(terms).toHaveAttribute("aria-invalid", "grammar");
    expect(terms.closest(".kb-checkbox")).toHaveAttribute("data-invalid", "");
  });
  it("blocks disabled and read-only updates", async () => {
    const change = vi.fn();
    const { rerender } = render(
      <Checkbox label="Locked" checked={false} disabled onCheckedChange={change} />,
    );
    await userEvent.click(screen.getByText("Locked"));
    expect(change).not.toHaveBeenCalled();
    rerender(<Checkbox label="Locked" checked={false} readOnly onCheckedChange={change} />);
    await userEvent.click(screen.getByText("Locked"));
    expect(change).not.toHaveBeenCalled();
  });
});

it("resolves checked mixed input to checked and retains controlled projection when declined", async () => {
  const change = vi.fn();
  render(<Checkbox label="Aggregate" checked indeterminate onCheckedChange={change} />);
  const box = screen.getByRole("checkbox", { name: "Aggregate" });
  await userEvent.click(box);
  expect(change).toHaveBeenCalledWith(true);
  expect((box as HTMLInputElement).indeterminate).toBe(true);
  expect(box).toBeChecked();
});
it("preserves read-only mixed DOM state and announces read-only", async () => {
  const change = vi.fn();
  render(
    <Checkbox
      label="Read-only aggregate"
      checked={false}
      indeterminate
      readOnly
      onCheckedChange={change}
    />,
  );
  const box = screen.getByRole("checkbox", { name: "Read-only aggregate" });
  expect(box).toHaveAttribute("aria-readonly", "true");
  await userEvent.click(box);
  expect((box as HTMLInputElement).indeterminate).toBe(true);
  expect(box).not.toBeChecked();
  expect(change).not.toHaveBeenCalled();
});
