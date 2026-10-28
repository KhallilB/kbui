import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type CSSProperties, createRef, useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  test("one labelled native control owns semantics, ref and associated messages", () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <>
        <p id="policy">Workspace policy</p>
        <Switch
          ref={ref}
          label="Email updates"
          checked={false}
          onCheckedChange={() => {}}
          description="Weekly activity"
          error="Choose a preference"
          aria-describedby="policy"
        />
      </>,
    );
    const control = screen.getByRole("switch", { name: "Email updates" });
    expect(screen.getByLabelText("Email updates")).toBe(control);
    expect(ref.current).toBe(control);
    expect(control).toHaveAttribute("type", "checkbox");
    expect(container.querySelectorAll("input")).toHaveLength(1);
    expect(control).toHaveAccessibleDescription(
      "Workspace policy Weekly activity Choose a preference",
    );
    expect(control).toHaveAttribute("aria-invalid", "true");
  });

  test("forwards custom properties to visible planes while native styles stay native", () => {
    render(
      <Switch
        label="Updates"
        checked={false}
        onCheckedChange={() => {}}
        style={{ "--kb-switch-width": "90px", margin: 4 } as CSSProperties}
      />,
    );
    const control = screen.getByRole("switch");
    const root = control.closest(".kb-switch") as HTMLElement;
    expect(root.style.getPropertyValue("--kb-switch-width")).toBe("90px");
    expect(root.style.margin).toBe("");
    expect(control).toHaveStyle({ margin: "4px" });
  });

  test("requests changes while checked remains controlled by its owner", async () => {
    const change = vi.fn();
    const { rerender } = render(
      <Switch label="Updates" checked={false} onCheckedChange={change} />,
    );
    const control = screen.getByRole("switch", { name: "Updates" });
    await userEvent.click(control);
    expect(change).toHaveBeenCalledExactlyOnceWith(true);
    expect(control).not.toBeChecked();
    rerender(<Switch label="Updates" checked onCheckedChange={change} />);
    expect(control).toBeChecked();
    expect(screen.getByRole("switch")).toBe(control);
  });

  test("pointer and Space update the same controlled native input", async () => {
    function Example() {
      const [checked, setChecked] = useState(false);
      return <Switch label="Updates" checked={checked} onCheckedChange={setChecked} />;
    }
    render(<Example />);
    const control = screen.getByRole("switch", { name: "Updates" });
    await userEvent.click(screen.getByText("Updates"));
    expect(control).toBeChecked();
    control.focus();
    await userEvent.keyboard(" ");
    expect(control).not.toBeChecked();
  });

  test("read-only blocks pointer and keyboard change requests", async () => {
    const change = vi.fn();
    render(<Switch label="Updates" checked onCheckedChange={change} readOnly />);
    const control = screen.getByRole("switch", { name: "Updates" });
    await userEvent.click(control);
    control.focus();
    await userEvent.keyboard(" ");
    expect(change).not.toHaveBeenCalled();
    expect(control).toBeChecked();
    expect(control).toHaveAttribute("aria-readonly", "true");
  });

  test("disabled and disabled fieldset preserve native behavior", async () => {
    const change = vi.fn();
    render(
      <>
        <Switch label="Direct" checked onCheckedChange={change} disabled />
        <fieldset disabled>
          <Switch label="Inherited" checked={false} onCheckedChange={change} />
        </fieldset>
      </>,
    );
    for (const control of screen.getAllByRole("switch")) {
      expect(control).toBeDisabled();
      await userEvent.click(control);
    }
    expect(change).not.toHaveBeenCalled();
  });

  test("native form owner, required validation and successful values stay intact", () => {
    const { rerender } = render(
      <>
        <form id="preferences" aria-label="Preferences" />
        <Switch
          label="Updates"
          checked={false}
          onCheckedChange={() => {}}
          form="preferences"
          name="digest"
          value="weekly"
          required
        />
      </>,
    );
    const control = screen.getByRole("switch") as HTMLInputElement;
    const form = screen.getByRole("form", { name: "Preferences" }) as HTMLFormElement;
    expect(control.form).toBe(form);
    expect(control.validity.valueMissing).toBe(true);
    expect(new FormData(form).has("digest")).toBe(false);
    rerender(
      <>
        <form id="preferences" aria-label="Preferences" />
        <Switch
          label="Updates"
          checked
          onCheckedChange={() => {}}
          form="preferences"
          name="digest"
          value="weekly"
          required
        />
      </>,
    );
    expect(control.validity.valid).toBe(true);
    expect(new FormData(form).get("digest")).toBe("weekly");
  });

  test("form reset belongs to the controlled owner", () => {
    function Example() {
      const [checked, setChecked] = useState(true);
      return (
        <form aria-label="Preferences" onReset={() => setChecked(false)}>
          <Switch label="Updates" name="updates" checked={checked} onCheckedChange={setChecked} />
        </form>
      );
    }
    render(<Example />);
    fireEvent.reset(screen.getByRole("form", { name: "Preferences" }));
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  test("hidden label and decorative icon content do not duplicate its name", () => {
    render(
      <Switch
        id="appearance"
        label="Dark mode"
        checked={false}
        onCheckedChange={() => {}}
        visuallyHidden
        offIcon={<span>Sun</span>}
        onIcon={<span>Moon</span>}
        className="appearance"
        controlClassName="native-appearance"
      />,
    );
    const control = screen.getByLabelText("Dark mode");
    expect(control).toHaveAttribute("id", "appearance");
    expect(control).toHaveClass("native-appearance");
    expect(control.closest(".kb-switch")).toHaveClass("appearance");
    expect(screen.getByText("Sun").closest("[aria-hidden]")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Dark mode")).toHaveClass("kb-sr-only");
  });

  test("exposes size and side-based on/off tone and color attributes on root", () => {
    const { rerender } = render(
      <Switch label="Alerts" checked={false} onCheckedChange={() => {}} />,
    );
    const control = screen.getByRole("switch", { name: "Alerts" });
    const root = control.closest(".kb-switch") as HTMLElement;
    expect(root).not.toHaveAttribute("data-size");
    expect(root).not.toHaveAttribute("data-off-tone");
    expect(root).toHaveAttribute("data-on-tone", "accent");

    rerender(
      <Switch
        label="Alerts"
        checked
        onCheckedChange={() => {}}
        size="sm"
        offTone="warning"
        onTone="success"
      />,
    );
    expect(root).toHaveAttribute("data-size", "sm");
    expect(root).toHaveAttribute("data-off-tone", "warning");
    expect(root).toHaveAttribute("data-on-tone", "success");

    rerender(
      <Switch
        label="Alerts"
        checked
        onCheckedChange={() => {}}
        size="lg"
        tone="danger"
        offColor="var(--kb-color-info)"
        onColor="var(--kb-color-success)"
      />,
    );
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveAttribute("data-off-tone", "custom");
    expect(root).toHaveAttribute("data-on-tone", "custom");
    expect(root.style.getPropertyValue("--kb-switch-off-color")).toBe("var(--kb-color-info)");
    expect(root.style.getPropertyValue("--kb-switch-on-color")).toBe("var(--kb-color-success)");
  });
});
