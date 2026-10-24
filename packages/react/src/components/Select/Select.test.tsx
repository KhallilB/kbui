import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const options = [
  { value: "review", label: "Needs review" },
  { value: "locked", label: "Unavailable", disabled: true },
  { value: "all", label: "All tasks" },
];
function Example() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Select
      label="Task status"
      value={value}
      onValueChange={setValue}
      options={options}
      placeholder="Choose status"
    />
  );
}
describe("Select", () => {
  it("selects enabled options, shows labels and restores trigger focus", async () => {
    render(<Example />);
    const trigger = screen.getByRole("combobox", { name: "Task status" });
    expect(trigger).toHaveTextContent("Choose status");
    await userEvent.click(trigger);
    const list = await screen.findByRole("listbox");
    expect(within(list).getByRole("option", { name: "Unavailable" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await userEvent.click(within(list).getByRole("option", { name: "All tasks" }));
    expect(trigger).toHaveTextContent("All tasks");
    expect(trigger).toHaveFocus();
  });
  it("associates helper/error text and forwards root ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Select
        ref={ref}
        label="Class"
        value="review"
        options={options}
        onValueChange={() => {}}
        description="Choose one"
        error="Unavailable date"
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(ref.current).toContainElement(trigger);
    expect(trigger).toHaveAccessibleDescription("Choose one Unavailable date");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });
  it("exposes empty collection without action-menu semantics", async () => {
    render(<Select label="Empty" value={null} options={[]} onValueChange={() => {}} />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(await screen.findByRole("option", { name: "No options available" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
  it("blocks disabled trigger", async () => {
    const change = vi.fn();
    render(
      <Select label="Locked" value={null} options={options} disabled onValueChange={change} />,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(change).not.toHaveBeenCalled();
  });
});

it("serializes controlled values, accepts external updates and preserves read-only value", async () => {
  const change = vi.fn();
  const field = (value: string, readOnly = false, disabled = false) => (
    <form aria-label="Selection">
      <Select
        label="View"
        name="view"
        value={value}
        options={options}
        onValueChange={change}
        readOnly={readOnly}
        disabled={disabled}
      />
    </form>
  );
  const { rerender } = render(field("review"));
  const data = () => new FormData(screen.getByRole("form") as HTMLFormElement).get("view");
  expect(data()).toBe("review");
  rerender(field("all", true));
  expect(screen.getByRole("combobox")).toHaveTextContent("All tasks");
  expect(data()).toBe("all");
  await userEvent.click(screen.getByRole("combobox"));
  expect(change).not.toHaveBeenCalled();
  expect(data()).toBe("all");
  rerender(field("all", false, true));
  expect(data()).toBeNull();
});

it("combines caller helper IDs with component descriptions on the combobox", () => {
  render(
    <>
      <p id="consumer-help">Caller helper</p>
      <Select
        label="View"
        value={null}
        onValueChange={() => {}}
        options={options}
        description="Choose view"
        aria-describedby="consumer-help"
      />
    </>,
  );
  expect(screen.getByRole("combobox", { name: "View" })).toHaveAccessibleDescription(
    "Choose view Caller helper",
  );
});
