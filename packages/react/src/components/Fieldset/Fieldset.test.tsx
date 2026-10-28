import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test } from "vitest";
import { Input } from "../Input/Input";
import { Fieldset } from "./Fieldset";

afterEach(cleanup);

describe("Fieldset", () => {
  test("renders a native fieldset named by its legend", () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(
      <Fieldset ref={ref} legend="Notification channels">
        <Input label="Email address" />
      </Fieldset>,
    );
    const group = screen.getByRole("group", {
      name: "Notification channels",
    }) as HTMLFieldSetElement;
    expect(group.tagName).toBe("FIELDSET");
    expect(ref.current).toBe(group);
    expect(group.querySelector("legend")?.textContent).toBe("Notification channels");
    expect(screen.getByLabelText("Email address")).toBeDefined();
  });

  test("visually hides the legend while keeping the group name for assistive technology", () => {
    render(
      <Fieldset legend="Account details" visuallyHidden>
        <Input label="Display name" />
      </Fieldset>,
    );
    const group = screen.getByRole("group", { name: "Account details" });
    const legend = group.querySelector(".kb-fieldset-legend");
    expect(legend?.classList.contains("kb-sr-only")).toBe(true);
  });

  test("wires description and error into aria-describedby and sets data-invalid", () => {
    render(
      <Fieldset
        legend="Billing address"
        description="Used on tax receipts and invoices."
        error="Complete all required address fields."
        aria-describedby="tax-note"
      >
        <Input label="Postal code" />
      </Fieldset>,
    );
    const group = screen.getByRole("group", { name: "Billing address" });
    expect(group.hasAttribute("data-invalid")).toBe(true);
    const describedBy = group.getAttribute("aria-describedby") ?? "";
    expect(describedBy).toContain("tax-note");
    const ids = describedBy.split(" ").filter((id) => id !== "tax-note");
    expect(ids).toHaveLength(2);
    expect(document.getElementById(ids[0] ?? "")?.textContent).toBe(
      "Used on tax receipts and invoices.",
    );
    expect(document.getElementById(ids[1] ?? "")?.textContent).toBe(
      "Complete all required address fields.",
    );

    render(
      <Fieldset legend="Grammar address" aria-invalid="grammar">
        <Input label="Street" />
      </Fieldset>,
    );
    const grammar = screen.getByRole("group", { name: "Grammar address" });
    expect(grammar.getAttribute("aria-invalid")).toBe("grammar");
    expect(grammar.hasAttribute("data-invalid")).toBe(true);
    expect(grammar.querySelector(".kb-fieldset-error")).toBeNull();
  });

  test("disables descendant form controls natively when disabled", () => {
    render(
      <Fieldset legend="Workspace limits" disabled>
        <Input label="Daily quota" />
      </Fieldset>,
    );
    const group = screen.getByRole("group", { name: "Workspace limits" }) as HTMLFieldSetElement;
    expect(group.disabled).toBe(true);
    expect(group.hasAttribute("data-disabled")).toBe(true);
    const input = screen.getByLabelText("Daily quota") as HTMLInputElement;
    expect(input.matches(":disabled")).toBe(true);
  });
});
