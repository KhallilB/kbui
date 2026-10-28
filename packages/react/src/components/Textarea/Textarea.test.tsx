import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Textarea } from "./Textarea";

afterEach(cleanup);

describe("Textarea", () => {
  test("associates label with native textarea and sets default rows and vertical resize", () => {
    render(<Textarea label="Release notes" placeholder="Summarize changes" />);
    const control = screen.getByLabelText("Release notes") as HTMLTextAreaElement;
    expect(control.tagName).toBe("TEXTAREA");
    expect(control.rows).toBe(4);
    expect(control.placeholder).toBe("Summarize changes");
    expect(control.closest(".kb-textarea")?.getAttribute("data-resize")).toBe("vertical");
  });

  test("visually hides the label while keeping the accessible name", () => {
    render(<Textarea label="Internal comment" visuallyHidden />);
    const control = screen.getByLabelText("Internal comment");
    const label = control.closest(".kb-textarea")?.querySelector(".kb-textarea-label");
    expect(label?.classList.contains("kb-sr-only")).toBe(true);
  });

  test("wires description and error into aria-describedby and sets invalid state", () => {
    render(
      <Textarea
        label="Summary"
        description="Plain text up to 500 characters."
        error="Enter a summary before publishing."
        aria-describedby="external-note"
      />,
    );
    const control = screen.getByLabelText("Summary");
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(control.closest(".kb-textarea")?.hasAttribute("data-invalid")).toBe(true);

    const describedBy = control.getAttribute("aria-describedby") ?? "";
    expect(describedBy).toContain("external-note");
    const ids = describedBy.split(" ").filter((id) => id !== "external-note");
    expect(ids).toHaveLength(2);
    expect(document.getElementById(ids[0] ?? "")?.textContent).toBe(
      "Plain text up to 500 characters.",
    );
    expect(document.getElementById(ids[1] ?? "")?.textContent).toBe(
      "Enter a summary before publishing.",
    );

    render(<Textarea label="Grammar check" aria-invalid="grammar" />);
    const grammarControl = screen.getByLabelText("Grammar check");
    expect(grammarControl.getAttribute("aria-invalid")).toBe("grammar");
    expect(grammarControl.closest(".kb-textarea")?.hasAttribute("data-invalid")).toBe(true);
  });

  test("calls onChange and onValueChange when edited", () => {
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState("Initial");
      return (
        <Textarea
          label="Notes"
          value={value}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
        />
      );
    }

    render(<Controlled />);
    const control = screen.getByLabelText("Notes") as HTMLTextAreaElement;
    fireEvent.change(control, { target: { value: "Updated notes" } });
    expect(onValueChange).toHaveBeenCalledWith("Updated notes");
    expect(control.value).toBe("Updated notes");
  });

  test("applies resize, disabled, readOnly, ref and form submission", () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { container } = render(
      <form>
        <Textarea
          ref={ref}
          label="Webhook payload"
          name="payload"
          defaultValue='{"ok":true}'
          rows={6}
          resize="none"
          readOnly
        />
        <Textarea label="Archived note" name="archived" defaultValue="skip" disabled />
      </form>,
    );

    const payload = screen.getByLabelText("Webhook payload") as HTMLTextAreaElement;
    expect(ref.current).toBe(payload);
    expect(payload.rows).toBe(6);
    expect(payload.readOnly).toBe(true);
    expect(payload.closest(".kb-textarea")?.getAttribute("data-resize")).toBe("none");
    expect(payload.closest(".kb-textarea")?.hasAttribute("data-readonly")).toBe(true);

    const archived = screen.getByLabelText("Archived note") as HTMLTextAreaElement;
    expect(archived.disabled).toBe(true);
    expect(archived.closest(".kb-textarea")?.hasAttribute("data-disabled")).toBe(true);

    const form = container.querySelector("form");
    if (!form) throw new Error("Expected form element");
    const data = new FormData(form);
    expect(data.get("payload")).toBe('{"ok":true}');
    expect(data.get("archived")).toBeNull();
  });
});
