import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { NumberField } from "./NumberField";

function Example({
  initial = 76,
  min = 0,
  max = 9999,
  step = 1,
}: {
  initial?: number | null;
  min?: number;
  max?: number;
  step?: number;
}) {
  const [value, setValue] = useState<number | null>(initial);
  return (
    <NumberField
      label="Bath towel counted"
      value={value}
      onValueChange={setValue}
      min={min}
      max={max}
      step={step}
    />
  );
}
describe("NumberField", () => {
  it("coordinates buttons, keyboard and an empty numeric draft", async () => {
    render(<Example />);
    const input = screen.getByRole("textbox", { name: "Bath towel counted" });
    await userEvent.click(screen.getByRole("button", { name: "Increase Bath towel counted" }));
    expect(input).toHaveValue("77");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowUp}");
    expect(input).toHaveValue("78");
    await userEvent.clear(input);
    expect(input).toHaveValue("");
    await userEvent.click(screen.getByRole("button", { name: "Increase Bath towel counted" }));
    expect(input).toHaveValue("0");
  });
  it("uses the same decrement rule for fractional drafts", async () => {
    const { unmount } = render(<Example initial={1.5} />);
    const keyboard = screen.getByRole("textbox");
    await userEvent.click(keyboard);
    await userEvent.keyboard("{ArrowDown}");
    expect(keyboard).toHaveValue("1");
    unmount();
    render(<Example initial={1.5} />);
    await userEvent.click(screen.getByRole("button", { name: "Decrease Bath towel counted" }));
    expect(screen.getByRole("textbox")).toHaveValue("1");
  });
  it("clamps stepping while preserving out-of-range typed drafts on blur", async () => {
    render(<Example initial={2} max={2} />);
    const input = screen.getByRole("textbox");
    expect(screen.getByRole("button", { name: "Increase Bath towel counted" })).toBeDisabled();
    await userEvent.clear(input);
    await userEvent.type(input, "9");
    await userEvent.tab();
    expect(input).toHaveValue("9");
    await userEvent.click(screen.getByRole("button", { name: "Decrease Bath towel counted" }));
    expect(input).toHaveValue("2");
  });
  it("supports fractional step, minimum and external controlled updates", async () => {
    const { rerender } = render(<Example initial={0.5} max={1} step={0.25} />);
    await userEvent.click(screen.getByRole("button", { name: "Increase Bath towel counted" }));
    expect(screen.getByRole("textbox")).toHaveValue("0.75");
    rerender(<NumberField label="Boxes" value={0} min={0} onValueChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Decrease Boxes" })).toBeDisabled();
    expect(screen.getByRole("textbox")).toHaveValue("0");
  });
  it("associates label/helper/error, exposes full-width parts and forwards refs", () => {
    const root = createRef<HTMLDivElement>();
    const input = createRef<HTMLInputElement>();
    render(
      <>
        <NumberField
          ref={root}
          inputRef={input}
          label="Count"
          value={null}
          onValueChange={() => {}}
          description="Returned pieces"
          error="Whole number required"
          visuallyHidden
          groupClassName="well"
          inputClassName="number"
          inputProps={{ "aria-describedby": "extra" }}
        />
        <p id="extra">Extra help</p>
      </>,
    );
    const field = screen.getByRole("textbox");
    expect(field).toHaveAccessibleDescription("Returned pieces Whole number required Extra help");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(input.current).toBe(field);
    expect(root.current).toHaveClass("kb-numberfield");
    expect(field).toHaveClass("number");
    expect(root.current?.querySelector(".kb-numberfield-group")).toHaveClass("well");
    expect(root.current?.querySelector(".kb-numberfield-error")?.parentElement).toBe(root.current);
  });
  it("serializes native values and blocks disabled/read-only changes", async () => {
    const change = vi.fn();
    const { rerender } = render(
      <form aria-label="Quantity">
        <NumberField label="Count" value={78} name="count" onValueChange={change} readOnly />
      </form>,
    );
    const form = screen.getByRole("form") as HTMLFormElement;
    expect(new FormData(form).get("count")).toBe("78");
    await userEvent.click(screen.getByRole("button", { name: "Increase Count" }));
    await userEvent.click(screen.getByRole("textbox"));
    await userEvent.keyboard("{ArrowUp}");
    expect(change).not.toHaveBeenCalled();
    rerender(
      <form aria-label="Quantity">
        <NumberField label="Count" value={78} name="count" onValueChange={change} disabled />
      </form>,
    );
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(new FormData(form).has("count")).toBe(false);
  });
});

it("honors localized formatting and action/role labels", async () => {
  function Localized() {
    const [value, setValue] = useState<number | null>(1200.5);
    return (
      <NumberField
        label="Anzahl"
        value={value}
        onValueChange={setValue}
        locale="de-DE"
        step={0.1}
        min={0}
        decrementLabel="Verringern"
        incrementLabel="Erhöhen"
        inputProps={{ "aria-roledescription": "Zahlenfeld" }}
      />
    );
  }
  render(<Localized />);
  const input = screen.getByRole("textbox", { name: "Anzahl" });
  expect(input).toHaveValue("1.200,5");
  expect(input).toHaveAttribute("aria-roledescription", "Zahlenfeld");
  await userEvent.click(screen.getByRole("button", { name: "Erhöhen" }));
  expect(input).toHaveValue("1.200,6");
});

it("associates an external form and preserves required/range/step validity", () => {
  const field = (value: number | null) => (
    <>
      <form id="quantity-form" aria-label="External quantity" />
      <NumberField
        label="Count"
        name="count"
        form="quantity-form"
        value={value}
        onValueChange={() => {}}
        min={0}
        max={10}
        step={1}
        required
      />
    </>
  );
  const { rerender } = render(field(null));
  const form = screen.getByRole("form") as HTMLFormElement;
  expect(form.checkValidity()).toBe(false);
  rerender(field(1.5));
  expect(form.checkValidity()).toBe(false);
  rerender(field(2));
  expect(form.checkValidity()).toBe(true);
  expect(new FormData(form).get("count")).toBe("2");
});

it("keeps one tab stop per numeric editor", async () => {
  render(
    <>
      <button type="button">Before count</button>
      <Example />
      <button type="button">After count</button>
    </>,
  );
  screen.getByRole("button", { name: "Before count" }).focus();
  await userEvent.tab();
  expect(screen.getByRole("textbox")).toHaveFocus();
  await userEvent.tab();
  expect(screen.getByRole("button", { name: "After count" })).toHaveFocus();
});
