import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Combobox, type ComboboxOption, type ComboboxProps } from "./Combobox";

const options: ComboboxOption[] = [
  { value: "us-east", label: "US East (Virginia)" },
  { value: "eu-west", label: "EU West (Frankfurt)" },
  { value: "ap-south", label: "Asia Pacific (Mumbai)", disabled: true },
  { value: "sa-east", label: "South America (São Paulo)" },
];

function Controlled(
  props: Omit<ComboboxProps, "label" | "options" | "value" | "onValueChange"> & {
    initial?: string | null;
    options?: readonly ComboboxOption[];
    onChange?: (value: string | null) => void;
  },
) {
  const { initial = null, options: opts = options, onChange, ...rest } = props;
  const [value, setValue] = useState<string | null>(initial);
  return (
    <Combobox
      label="Region"
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

describe("Combobox", () => {
  it("labels the combobox input and forwards ref without console warnings", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const ref = createRef<HTMLInputElement>();

    render(
      <Combobox
        ref={ref}
        label="Region"
        options={options}
        value={null}
        onValueChange={() => {}}
        placeholder="Search regions..."
      />,
    );

    const input = screen.getByRole("combobox", { name: "Region" });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("placeholder", "Search regions...");
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it("filters options by query and selects an option via pointer or keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <Controlled onChange={onChange} placeholder="Search regions..." />,
    );

    const input = screen.getByRole("combobox", { name: "Region" });
    await user.click(input);
    await user.type(input, "Frank");

    const listbox = await screen.findByRole("listbox");
    expect(container.querySelector(".kb-combobox")).toContainElement(listbox);
    expect(
      within(listbox).getByRole("option", { name: "EU West (Frankfurt)" }),
    ).toBeInTheDocument();
    expect(within(listbox).queryByRole("option", { name: "US East (Virginia)" })).toBeNull();

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("eu-west");
    expect(input).toHaveValue("EU West (Frankfurt)");
  });

  it("clears the selected option when the clear button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled initial="us-east" onChange={onChange} />);

    const input = screen.getByRole("combobox", { name: "Region" });
    expect(input).toHaveValue("US East (Virginia)");

    const clearBtn = screen.getByRole("button", { name: "Clear Region" });
    await user.click(clearBtn);

    expect(onChange).toHaveBeenCalledWith(null);
    expect(input).toHaveValue("");
  });

  it("announces the empty message when no options match or options is empty", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Combobox
        label="Region"
        options={options}
        value={null}
        onValueChange={() => {}}
        emptyMessage="No regions found"
      />,
    );

    const input = screen.getByRole("combobox", { name: "Region" });
    await user.click(input);
    await user.type(input, "zzz-nonexistent");

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("No regions found");

    rerender(
      <Combobox
        key="empty"
        label="Region"
        options={[]}
        value={null}
        onValueChange={() => {}}
        open
        emptyMessage="No regions available"
      />,
    );
    expect(screen.getByRole("combobox", { name: "Region" })).not.toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("No regions available");
  });

  it("prevents selecting disabled options", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Toggle Region options" }));
    const disabledOpt = await screen.findByRole("option", { name: "Asia Pacific (Mumbai)" });
    expect(disabledOpt).toHaveAttribute("aria-disabled", "true");
    await user.click(disabledOpt);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("links description and error via aria-describedby and sets data-invalid", () => {
    const { container } = render(
      <Combobox
        label="Region"
        options={options}
        value={null}
        onValueChange={() => {}}
        description="Choose the primary deployment region."
        error="Region is required."
      />,
    );

    const root = container.querySelector(".kb-combobox");
    expect(root).toHaveAttribute("data-invalid", "");
    const input = screen.getByRole("combobox", { name: "Region" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "Choose the primary deployment region. Region is required.",
    );
  });

  it("respects disabled and readOnly states", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender, container } = render(
      <Combobox
        label="Region"
        options={options}
        value="us-east"
        onValueChange={onChange}
        readOnly
      />,
    );

    expect(container.querySelector(".kb-combobox")).toHaveAttribute("data-readonly", "");
    const clearBtn = screen.getByRole("button", { name: "Clear Region" });
    expect(clearBtn).toBeDisabled();
    await user.click(clearBtn);
    expect(onChange).not.toHaveBeenCalled();

    rerender(
      <Combobox
        label="Region"
        options={options}
        value="us-east"
        onValueChange={onChange}
        disabled
      />,
    );
    expect(container.querySelector(".kb-combobox")).toHaveAttribute("data-disabled", "");
    expect(screen.getByRole("combobox", { name: "Region" })).toBeDisabled();
  });

  it("normalizes out-of-range values to null", () => {
    render(
      <Combobox label="Region" options={options} value="unknown-region" onValueChange={() => {}} />,
    );
    expect(screen.getByRole("combobox", { name: "Region" })).toHaveValue("");
  });

  it("preserves page scroll and dismisses nonmodally on outside click", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    render(
      <>
        <Controlled />
        <button type="button" onClick={action}>
          Next action
        </button>
      </>,
    );

    const next = screen.getByRole("button", { name: "Next action" });
    await user.click(screen.getByRole("button", { name: "Toggle Region options" }));
    await screen.findByRole("listbox");
    expect(document.body.style.overflowY).not.toBe("hidden");

    await user.click(next);
    expect(action).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });
});
