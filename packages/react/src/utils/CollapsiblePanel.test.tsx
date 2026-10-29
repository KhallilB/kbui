import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, test, vi } from "vitest";
import { Accordion } from "../components/Accordion/Accordion";
import {
  Disclosure,
  type DisclosurePanelProps,
  type DisclosureProps,
} from "../components/Disclosure/Disclosure";

type PanelProps = Pick<DisclosurePanelProps, "render" | "ref" | "hiddenUntilFound" | "inert">;
const families = ["Disclosure", "Accordion"] as const;
type Family = (typeof families)[number];

function mount(family: Family, props: PanelProps, mode = "accepted") {
  const change: NonNullable<DisclosureProps["onOpenChange"]> = (_, details) => {
    if (mode === "cancelled") details.cancel();
  };
  return render(
    family === "Disclosure" ? (
      <Disclosure {...(mode === "ignored" ? { open: false } : {})} onOpenChange={change}>
        <Disclosure.Trigger>Details</Disclosure.Trigger>
        <Disclosure.Panel {...props}>
          <input aria-label="Draft" defaultValue="Saved" />
        </Disclosure.Panel>
      </Disclosure>
    ) : (
      <Accordion {...(mode === "ignored" ? { value: [] } : {})}>
        <Accordion.Item value="draft" onOpenChange={change}>
          <Accordion.Header>
            <Accordion.Trigger>Details</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel {...props}>
            <input aria-label="Draft" defaultValue="Saved" />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    ),
  );
}

test.each(families)("%s panel composes element refs, props and events", async (family) => {
  const panelRef = createRef<HTMLDivElement>();
  const elementRef = createRef<HTMLDivElement>();
  const change = vi.fn();
  mount(family, {
    ref: panelRef,
    render: <section ref={elementRef} className="custom-panel" onChange={change} />,
  });
  await userEvent.click(screen.getByRole("button", { name: "Details" }));
  expect(panelRef.current).toBe(elementRef.current);
  expect(panelRef.current?.tagName).toBe("SECTION");
  expect(panelRef.current).toHaveClass("custom-panel", `kb-${family.toLowerCase()}-panel`);
  await userEvent.type(screen.getByRole("textbox"), "x");
  expect(change).toHaveBeenCalledOnce();
});

test.each(families)("%s panel callback preserves native props, state and ref", async (family) => {
  const panelRef = createRef<HTMLDivElement>();
  mount(family, {
    ref: panelRef,
    hiddenUntilFound: true,
    render: (props, state) => <section {...props} data-caller-open={state.open} />,
  });
  const panel = panelRef.current;
  expect(panel).toHaveAttribute("hidden", "until-found");
  expect(panel).toHaveAttribute("data-caller-open", "false");
  expect(panel).not.toHaveAttribute("inert");
  await userEvent.click(screen.getByRole("button"));
  expect(panelRef.current).toBe(panel);
  expect(panel).not.toHaveAttribute("hidden");
  expect(panel).toHaveAttribute("data-caller-open", "true");
  expect(panel).not.toHaveAttribute("inert");
  await userEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(panel).toHaveAttribute("hidden", "until-found"));
  expect(panel).not.toHaveAttribute("inert");
});

test.each(families)("%s preserves caller-owned inert on an open panel", async (family) => {
  const panelRef = createRef<HTMLDivElement>();
  mount(family, { ref: panelRef, inert: true });
  await userEvent.click(screen.getByRole("button"));
  expect(panelRef.current).not.toHaveAttribute("hidden");
  expect(panelRef.current).toHaveAttribute("inert");
});

for (const mode of ["accepted", "cancelled", "ignored"]) {
  test.each(families)(`%s keeps find-in-page reveal ${mode}`, async (family) => {
    const panelRef = createRef<HTMLDivElement>();
    mount(family, { ref: panelRef, hiddenUntilFound: true }, mode);
    const panel = panelRef.current;
    if (!panel) throw new Error("Searchable panel must remain mounted");
    expect(panel).toHaveAttribute("hidden", "until-found");
    expect(panel).not.toHaveAttribute("inert");
    fireEvent(panel, new Event("beforematch"));
    // Browser removes hidden after beforematch, even when caller rejects reveal.
    panel.removeAttribute("hidden");
    if (mode === "accepted") {
      await waitFor(() =>
        expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true"),
      );
      expect(screen.getByRole("textbox")).toHaveValue("Saved");
    } else {
      await waitFor(() => expect(panel).toHaveAttribute("hidden", "until-found"));
      expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
    }
    expect(panel).not.toHaveAttribute("inert");
  });
}
