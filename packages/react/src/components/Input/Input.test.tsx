import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  test("preserves native control, draft and focus when content slots appear and disappear", async () => {
    const { rerender } = render(<Input label="Query" defaultValue="draft" />);
    const input = screen.getByRole("textbox", { name: "Query" });
    await userEvent.clear(input);
    await userEvent.type(input, "user draft");
    rerender(
      <Input
        label="Query"
        defaultValue="draft"
        endContent={<button type="button">Clear query</button>}
      />,
    );
    expect(screen.getByRole("textbox", { name: "Query" })).toBe(input);
    expect(input).toHaveValue("user draft");
    expect(input).toHaveFocus();
    rerender(<Input label="Query" defaultValue="draft" />);
    expect(screen.getByRole("textbox", { name: "Query" })).toBe(input);
    expect(input).toHaveValue("user draft");
    expect(input).toHaveFocus();
  });
  test("keeps labelled control and helper when start and end content are supplied", () => {
    render(
      <Input
        label="Query"
        description="Search names"
        startContent={<span aria-hidden="true">Search icon</span>}
        endContent={<button type="button">Clear query</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Clear query" })).toBeInTheDocument();
    expect(screen.getByText("Search icon")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Query" })).toHaveAccessibleDescription(
      "Search names",
    );
  });
  test("labels the control and applies anatomy classes", () => {
    const { container } = render(<Input label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveClass("kb-input-control");
    const root = container.querySelector(".kb-input");
    expect(root).toHaveAttribute("data-size", "md");
    expect(container.querySelector(".kb-input-label")).toHaveTextContent("Email");
  });

  test("description is wired via aria-describedby", () => {
    render(<Input label="Name" description="Shown publicly" />);
    expect(screen.getByLabelText("Name")).toHaveAccessibleDescription("Shown publicly");
  });

  test("error sets data-invalid, aria-invalid and describes the control", () => {
    const { container } = render(<Input label="Email" error="Required" />);
    const input = screen.getByLabelText("Email");
    expect(container.querySelector(".kb-input")).toHaveAttribute("data-invalid");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Required");
    expect(container.querySelector(".kb-input-error")).toHaveTextContent("Required");
  });

  test("visuallyHidden label stays accessible", () => {
    const { container } = render(<Input label="Search" visuallyHidden />);
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
    expect(container.querySelector(".kb-input-label")).toHaveClass("kb-sr-only");
  });

  test("disabled marks the root and the control", () => {
    const { container } = render(<Input label="X" disabled />);
    expect(container.querySelector(".kb-input")).toHaveAttribute("data-disabled");
    expect(screen.getByLabelText("X")).toBeDisabled();
  });

  test("passes native props and size prop wins over native size", () => {
    render(<Input label="Age" type="number" placeholder="0" size="lg" />);
    const input = screen.getByLabelText("Age");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("placeholder", "0");
    expect(input).not.toHaveAttribute("size");
  });

  test("forwards ref to the native input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input label="R" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  test("description and error are both described, description first", () => {
    render(<Input label="Email" description="Shown publicly" error="Required" />);
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("Shown publicly Required");
  });

  test("controlled value", async () => {
    const onValueChange = vi.fn();
    render(<Input label="Name" value="a" onValueChange={onValueChange} />);
    const input = screen.getByLabelText("Name");
    await userEvent.type(input, "b");
    expect(onValueChange).toHaveBeenCalled();
    expect(input).toHaveValue("a");
  });
});
