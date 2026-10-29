import { render, screen } from "@testing-library/react";
import { type ComponentProps, createRef } from "react";
import { expect, expectTypeOf, it, vi } from "vitest";
import { Combobox, type ComboboxMultipleProps, type ComboboxProps } from "../../index";

interface RegionPickerProps extends ComboboxProps {
  helperText?: string | undefined;
}

interface MultipleRegionPickerProps extends ComboboxMultipleProps {
  helperText?: string | undefined;
}

function RegionPicker({ helperText, ...props }: RegionPickerProps) {
  return <Combobox {...props} description={helperText} />;
}

it("supports existing interfaces extending the public single-select props", () => {
  render(
    <RegionPicker
      label="Region"
      options={[{ value: "east", label: "US East" }]}
      value="east"
      onValueChange={vi.fn<(value: string | null) => void>()}
      helperText="Choose one region"
    />,
  );
  const input = screen.getByRole("combobox", { name: "Region" });
  expect(input).toHaveValue("US East");
  expect(input).toHaveAccessibleDescription("Choose one region");
});

it("preserves public callback and input ref types for each selection mode", () => {
  const options = [{ value: "east", label: "US East" }];
  const inputRef = createRef<HTMLInputElement>();
  const single = (
    <Combobox
      ref={inputRef}
      label="Region"
      options={options}
      value={null}
      onValueChange={(value) => expectTypeOf(value).toEqualTypeOf<string | null>()}
    />
  );
  const multipleProps: MultipleRegionPickerProps = {
    multiple: true,
    label: "Regions",
    options,
    value: ["east"] as const,
    onValueChange: (value) => expectTypeOf(value).toEqualTypeOf<string[]>(),
  };
  const multiple = <Combobox {...multipleProps} ref={inputRef} />;
  const invalidSingleCallback = (
    // @ts-expect-error Single selection callback receives scalar/null.
    <Combobox
      label="Region"
      options={options}
      value={null}
      onValueChange={(_value: string[]) => {}}
    />
  );
  const invalidMultipleCallback = (
    // @ts-expect-error Multiple selection callback receives array.
    <Combobox
      multiple
      label="Regions"
      options={options}
      value={[]}
      onValueChange={(_value: string | null) => {}}
    />
  );
  // @ts-expect-error Public ref targets input, not wrapper div.
  const invalidRef: ComponentProps<typeof Combobox>["ref"] = createRef<HTMLDivElement>();
  expect([
    single,
    multiple,
    invalidSingleCallback,
    invalidMultipleCallback,
    invalidRef,
  ]).toHaveLength(5);
});
