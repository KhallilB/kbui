import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { Combobox, type ComboboxProps } from "../../index";

interface RegionPickerProps extends ComboboxProps {
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
