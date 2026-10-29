import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ComponentProps, createRef, useState } from "react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { Combobox, type ComboboxMultipleProps } from "./Combobox";

const options = [
  { value: "east", label: "US East" },
  { value: "west", label: "US West" },
  { value: "europe", label: "Europe", disabled: true },
];

function MultipleRegions(props: Pick<ComboboxMultipleProps, "required" | "name">) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Combobox
      {...props}
      multiple
      label="Regions"
      options={options}
      value={value}
      onValueChange={setValue}
    />
  );
}

describe("Combobox multiple", () => {
  it("filters, retains selections across searches, and toggles a selection off", async () => {
    const user = userEvent.setup();
    render(<MultipleRegions />);
    const input = screen.getByRole("combobox", { name: "Regions" });
    await user.click(input);
    await user.type(input, "US");
    expect(screen.queryByRole("option", { name: "Europe" })).not.toBeInTheDocument();
    await user.click(await screen.findByRole("option", { name: "US East" }));
    expect(screen.getByRole("button", { name: "Remove US East" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Toggle Regions options" }));
    expect(await screen.findByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    await user.click(screen.getByRole("option", { name: "US West" }));
    expect(screen.getByRole("button", { name: "Remove US West" })).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "US East" }));
    expect(screen.queryByRole("button", { name: "Remove US East" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove US West" })).toBeInTheDocument();
  });

  it("selects with keyboard, removes chips, and clears all selections", async () => {
    const user = userEvent.setup();
    render(<MultipleRegions />);
    const input = screen.getByRole("combobox", { name: "Regions" });
    await user.click(input);
    await user.type(input, "East");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(screen.getByRole("button", { name: "Remove US East" })).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, "West");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(screen.getByRole("button", { name: "Remove US West" })).toBeInTheDocument();
    await user.clear(input);
    await user.keyboard("{Backspace}");
    expect(screen.queryByRole("button", { name: "Remove US West" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear Regions" }));
    expect(screen.queryByRole("button", { name: "Remove US East" })).not.toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("forwards ref, helper text, slot classes, custom removal names, and form values", async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <form>
        <Combobox
          multiple
          ref={ref}
          label="Regions"
          options={options}
          value={["east", "west", "east", "missing"]}
          onValueChange={() => {}}
          name="regions"
          description="Choose regions"
          error="Check selection"
          className="custom-root"
          classNames={{ chip: "custom-chip" }}
          removeLabel={(option) => `Unassign ${option.label}`}
        />
      </form>,
    );
    expect(ref.current).toBe(screen.getByRole("combobox", { name: "Regions" }));
    expect(ref.current).toHaveAccessibleDescription("Choose regions Check selection");
    expect(ref.current).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("button", { name: "Unassign US East" })).toBeInTheDocument();
    expect(container.querySelectorAll(".custom-chip")).toHaveLength(2);
    expect(container.querySelector(".custom-root")).toBeInTheDocument();
    await waitFor(() =>
      expect(new FormData(container.querySelector("form") ?? undefined).getAll("regions")).toEqual([
        "east",
        "west",
      ]),
    );
  });

  it.each(["readOnly", "disabled"] as const)("blocks changes when %s", async (state) => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Combobox
        multiple
        label="Regions"
        options={options}
        value={["east"]}
        onValueChange={onChange}
        {...{ [state]: true }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Remove US East" }));
    await user.click(screen.getByRole("button", { name: "Clear Regions" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Remove US East" })).toBeInTheDocument();
  });

  it("requires a selected value even when the search query matches an option", async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="Deployment">
        <MultipleRegions required name="regions" />
      </form>,
    );
    const form = screen.getByRole<HTMLFormElement>("form", { name: "Deployment" });
    const input = screen.getByRole("combobox", { name: "Regions" });
    expect(form.checkValidity()).toBe(false);
    await user.click(input);
    await user.type(input, "East");
    expect(form.checkValidity()).toBe(false);
    expect(new FormData(form).getAll("regions")).toEqual([]);

    await user.keyboard("{ArrowDown}{Enter}");
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).getAll("regions")).toEqual(["east"]);

    await user.click(screen.getByRole("button", { name: "Clear Regions" }));
    expect(form.checkValidity()).toBe(false);
    expect(new FormData(form).getAll("regions")).toEqual([]);
  });

  it.each([
    { state: "disabled", submitted: [] },
    { state: "readOnly", submitted: ["east", "west"] },
  ] as const)("preserves native form submission semantics when $state", ({ state, submitted }) => {
    render(
      <form aria-label="Deployment">
        <Combobox
          multiple
          required
          name="regions"
          label="Regions"
          options={options}
          value={["east", "west"]}
          onValueChange={() => {}}
          {...{ [state]: true }}
        />
      </form>,
    );
    const form = screen.getByRole<HTMLFormElement>("form", { name: "Deployment" });
    expect(new FormData(form).getAll("regions")).toEqual(submitted);
    expect(form.checkValidity()).toBe(true);
  });

  it("blocks disabled options and respects controlled values", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Combobox
        multiple
        label="Regions"
        options={options}
        value={["east"]}
        onValueChange={onChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Toggle Regions options" }));
    await user.click(await screen.findByRole("option", { name: "Europe" }));
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("option", { name: "US West" }));
    expect(onChange).toHaveBeenLastCalledWith(["east", "west"]);
    expect(screen.queryByRole("button", { name: "Remove US West" })).not.toBeInTheDocument();
  });
});

it("correlates selection mode with value and callback types", () => {
  type Props = ComponentProps<typeof Combobox>;
  expectTypeOf<Extract<Props, { multiple: true }>["value"]>().toEqualTypeOf<readonly string[]>();
  expectTypeOf<Extract<Props, { multiple: true }>["onValueChange"]>().toEqualTypeOf<
    (value: string[]) => void
  >();
  const invalidMultiple = (
    // @ts-expect-error Multiple selection requires array values.
    <Combobox multiple label="Regions" options={options} value="east" onValueChange={() => {}} />
  );
  const invalidSingle = (
    // @ts-expect-error Single selection requires scalar value.
    <Combobox label="Region" options={options} value={["east"]} onValueChange={() => {}} />
  );
  expect(invalidMultiple).toBeDefined();
  expect(invalidSingle).toBeDefined();
});
