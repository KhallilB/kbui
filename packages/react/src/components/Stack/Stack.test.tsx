import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Stack } from "./Stack";

describe("Stack", () => {
  test("stacks content in source order without roles or tab stops", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Stack ref={ref}>
        <h2>Billing</h2>
        <p>Plan and invoices.</p>
        <button type="button">Change plan</button>
      </Stack>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("kb-stack");
    expect(ref.current).toHaveAttribute("data-gap", "md");
    expect(ref.current).toHaveAttribute("data-align", "stretch");
    expect(ref.current).toHaveAttribute("data-justify", "start");
    expect(ref.current).not.toHaveAttribute("tabindex");
    expect(ref.current).not.toHaveAttribute("role");
    expect([...(ref.current?.children ?? [])].map((node) => node.tagName)).toEqual([
      "H2",
      "P",
      "BUTTON",
    ]);
  });

  test("named section keeps its region semantics and native props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Stack as="section" ref={ref} aria-labelledby="billing-title" id="billing" gap="lg">
        <h2 id="billing-title">Billing</h2>
        <p>Plan and invoices.</p>
      </Stack>,
    );
    expect(screen.getByRole("region", { name: "Billing" })).toBe(ref.current);
    expect(ref.current).toHaveAttribute("id", "billing");
    expect(ref.current).toHaveAttribute("data-gap", "lg");
  });

  test("preserves list semantics, merges className and owns layout attributes", () => {
    const ref = createRef<HTMLOListElement>();
    render(
      <Stack
        as="ol"
        ref={ref}
        gap="sm"
        align="start"
        justify="between"
        className="steps"
        aria-label="Setup steps"
        data-gap="lg"
      >
        <li>Connect</li>
        <li>Invite</li>
      </Stack>,
    );
    expect(screen.getByRole("list", { name: "Setup steps" })).toBe(ref.current);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(ref.current).toHaveClass("kb-stack", "steps");
    expect(ref.current).toHaveAttribute("data-gap", "sm");
    expect(ref.current).toHaveAttribute("data-align", "start");
    expect(ref.current).toHaveAttribute("data-justify", "between");
  });

  test("renders a native form that submits through its own handler", () => {
    const ref = createRef<HTMLFormElement>();
    let submitted = 0;
    render(
      <Stack
        as="form"
        ref={ref}
        aria-label="Profile"
        onSubmit={(event) => {
          event.preventDefault();
          submitted += 1;
        }}
      >
        <button type="submit">Save</button>
      </Stack>,
    );
    expect(screen.getByRole("form", { name: "Profile" })).toBe(ref.current);
    screen.getByRole("button", { name: "Save" }).click();
    expect(submitted).toBe(1);
  });
});
