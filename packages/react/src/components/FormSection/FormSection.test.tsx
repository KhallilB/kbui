import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, test } from "vitest";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { FormSection } from "./FormSection";

afterEach(cleanup);

describe("FormSection", () => {
  test("renders a native fieldset named by its section heading", () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(
      <FormSection ref={ref} title="Profile">
        <Input label="Display name" />
      </FormSection>,
    );
    const group = screen.getByRole("group", { name: "Profile" });
    expect(group.tagName).toBe("FIELDSET");
    expect(ref.current).toBe(group);
    expect(group.querySelector("legend")).toBeNull();
    const heading = screen.getByRole("heading", { level: 2, name: "Profile" });
    expect(group.contains(heading)).toBe(true);
  });

  test("sets the heading rank from headingLevel", () => {
    render(
      <FormSection title="Email" headingLevel={3}>
        <Input label="Address" />
      </FormSection>,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Email" })).toBeDefined();
    expect(screen.getByRole("group", { name: "Email" })).toBeDefined();
  });

  test("describes the group by description, error and caller ids, and marks it invalid", () => {
    render(
      <FormSection
        title="Billing address"
        description="Printed on invoices."
        error="Enter a postal code."
        aria-describedby="tax-note"
      >
        <Input label="Postal code" />
      </FormSection>,
    );
    const group = screen.getByRole("group", { name: "Billing address" });
    expect(group).toHaveAttribute("data-invalid");
    expect(group).toHaveAttribute("aria-invalid", "true");
    const ids = (group.getAttribute("aria-describedby") ?? "").split(" ");
    expect(ids).toHaveLength(3);
    expect(ids[2]).toBe("tax-note");
    expect(document.getElementById(ids[0] ?? "")).toHaveTextContent("Printed on invoices.");
    expect(document.getElementById(ids[1] ?? "")).toHaveTextContent("Enter a postal code.");
  });

  test("preserves a caller aria-invalid token", () => {
    render(
      <FormSection title="Bio" aria-invalid="spelling">
        <Input label="About you" />
      </FormSection>,
    );
    const group = screen.getByRole("group", { name: "Bio" });
    expect(group).toHaveAttribute("aria-invalid", "spelling");
    expect(group).toHaveAttribute("data-invalid");
  });

  test("renders actions after the fields in Tab order", async () => {
    render(
      <FormSection title="Password" actions={<Button type="submit">Update password</Button>}>
        <Input label="New password" type="password" />
      </FormSection>,
    );
    const actions = screen
      .getByRole("group", { name: "Password" })
      .querySelector(".kb-formactions");
    expect(actions).toHaveClass("kb-formsection-actions");
    expect(actions).toHaveAttribute("data-align", "start");
    await userEvent.tab();
    expect(screen.getByLabelText("New password")).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Update password" })).toHaveFocus();
  });

  test("omits optional regions", () => {
    const { container } = render(
      <FormSection title="Theme">
        <Input label="Accent" />
      </FormSection>,
    );
    for (const part of ["description", "error", "actions"]) {
      expect(container.querySelector(`.kb-formsection-${part}`)).toBeNull();
    }
    expect(container.querySelector(".kb-formsection")).not.toHaveAttribute("aria-describedby");
  });

  test("leaves layout to the enclosing intent unless set", () => {
    const { container, rerender } = render(<FormSection title="A">x</FormSection>);
    const root = container.querySelector(".kb-formsection");
    expect(root).not.toHaveAttribute("data-layout");
    rerender(
      <FormSection title="A" layout="split">
        x
      </FormSection>,
    );
    expect(root).toHaveAttribute("data-layout", "split");
  });

  test("disables every control, including actions, while disabled", () => {
    render(
      <FormSection title="Team" disabled actions={<Button type="submit">Save</Button>}>
        <Input label="Team name" />
      </FormSection>,
    );
    const group = screen.getByRole("group", { name: "Team" });
    expect(group).toHaveAttribute("data-disabled");
    expect(screen.getByLabelText("Team name")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});
