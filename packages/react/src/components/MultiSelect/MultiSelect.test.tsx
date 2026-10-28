import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { MultiSelect, type MultiSelectOption, type MultiSelectProps } from "./MultiSelect";

const options: MultiSelectOption[] = [
  { value: "payments", label: "Payments" },
  { value: "webhooks", label: "Webhooks" },
  { value: "ledger", label: "Ledger", disabled: true },
  { value: "reporting", label: "Reporting" },
];

function Controlled(
  props: Omit<MultiSelectProps, "label" | "options" | "value" | "onValueChange"> & {
    initial?: readonly string[];
    options?: readonly MultiSelectOption[];
    onChange?: (value: string[]) => void;
  },
) {
  const { initial = [], options: opts = options, onChange, ...rest } = props;
  const [value, setValue] = useState<readonly string[]>(initial);
  return (
    <MultiSelect
      label="Scopes"
      options={opts}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      {...rest}
    />
  );
}

describe("MultiSelect", () => {
  it("labels the combobox input and forwards ref without console warnings", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const ref = createRef<HTMLInputElement>();

    render(
      <MultiSelect
        ref={ref}
        label="Scopes"
        options={options}
        value={["payments"]}
        onValueChange={() => {}}
        placeholder="Filter scopes..."
      />,
    );

    const input = screen.getByRole("combobox", { name: "Scopes" });
    expect(ref.current).toBe(input);
    expect(screen.getByRole("toolbar", { name: "Scopes selections" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Payments" })).toBeInTheDocument();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it("filters options, toggles multiple selections, and renders removable chips", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<Controlled initial={["payments"]} onChange={onChange} />);

    const input = screen.getByRole("combobox", { name: "Scopes" });
    await user.click(input);
    await user.type(input, "Web");

    const listbox = await screen.findByRole("listbox");
    expect(container.querySelector(".kb-multiselect")).toContainElement(listbox);
    await user.click(within(listbox).getByRole("option", { name: "Webhooks" }));

    expect(onChange).toHaveBeenLastCalledWith(["payments", "webhooks"]);
    expect(screen.getByRole("button", { name: "Remove Payments" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Webhooks" })).toBeInTheDocument();
  });

  it("removes individual chips via remove button, Backspace in empty input, or Delete on focused chip", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled initial={["payments", "webhooks", "reporting"]} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Remove Webhooks" }));
    expect(onChange).toHaveBeenLastCalledWith(["payments", "reporting"]);

    const input = screen.getByRole("combobox", { name: "Scopes" });
    await user.click(input);
    await user.keyboard("{Backspace}");
    expect(onChange).toHaveBeenLastCalledWith(["payments"]);

    await user.keyboard("{ArrowLeft}{Delete}");
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("clears all selected values when the clear button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled initial={["payments", "webhooks"]} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Clear Scopes" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("announces the empty message when no options match or options is empty", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <MultiSelect
        label="Scopes"
        options={options}
        value={[]}
        onValueChange={() => {}}
        emptyMessage="No matching scopes"
      />,
    );

    const input = screen.getByRole("combobox", { name: "Scopes" });
    await user.click(input);
    await user.type(input, "zzz-none");

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("No matching scopes");

    rerender(
      <MultiSelect
        key="empty"
        label="Scopes"
        options={[]}
        value={[]}
        onValueChange={() => {}}
        open
        emptyMessage="No scopes available"
      />,
    );
    expect(screen.getByRole("combobox", { name: "Scopes" })).not.toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("No scopes available");
  });

  it("prevents chip removal and value changes when readOnly or disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender, container } = render(
      <MultiSelect
        label="Scopes"
        options={options}
        value={["payments"]}
        onValueChange={onChange}
        readOnly
      />,
    );

    expect(container.querySelector(".kb-multiselect")).toHaveAttribute("data-readonly", "");
    expect(container.querySelector(".kb-multiselect-chip")).not.toHaveAttribute("aria-readonly");
    const removeBtn = screen.getByRole("button", { name: "Remove Payments" });
    expect(removeBtn).toHaveAttribute("aria-disabled", "true");
    await user.click(removeBtn);
    expect(onChange).not.toHaveBeenCalled();

    rerender(
      <MultiSelect
        label="Scopes"
        options={options}
        value={["payments"]}
        onValueChange={onChange}
        disabled
      />,
    );
    expect(container.querySelector(".kb-multiselect")).toHaveAttribute("data-disabled", "");
    expect(container.querySelector(".kb-multiselect-chip")).not.toHaveAttribute("aria-disabled");
    expect(screen.getByRole("combobox", { name: "Scopes" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove Payments" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("links description and error via aria-describedby and sets data-invalid", () => {
    const { container } = render(
      <MultiSelect
        label="Scopes"
        options={options}
        value={[]}
        onValueChange={() => {}}
        description="Select at least one API scope."
        error="At least one scope is required."
      />,
    );

    expect(container.querySelector(".kb-multiselect")).toHaveAttribute("data-invalid", "");
    const input = screen.getByRole("combobox", { name: "Scopes" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "Select at least one API scope. At least one scope is required.",
    );
  });

  it("preserves page scroll and dismisses nonmodally on outside click", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    render(
      <>
        <Controlled initial={["payments"]} />
        <button type="button" onClick={action}>
          Next action
        </button>
      </>,
    );

    const next = screen.getByRole("button", { name: "Next action" });
    await user.click(screen.getByRole("button", { name: "Toggle Scopes options" }));
    await screen.findByRole("listbox");
    expect(document.body.style.overflowY).not.toBe("hidden");

    await user.click(next);
    expect(action).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });
});
