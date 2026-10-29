import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, test, vi } from "vitest";
import { Disclosure } from "./Disclosure";

test("keyboard toggles associated content without submitting a surrounding form", async () => {
  const submit = vi.fn((event) => event.preventDefault());
  render(
    <form onSubmit={submit}>
      <Disclosure>
        <Disclosure.Trigger>Details</Disclosure.Trigger>
        <Disclosure.Panel>Supporting details</Disclosure.Panel>
      </Disclosure>
    </form>,
  );
  const trigger = screen.getByRole("button", { name: "Details" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByText("Supporting details")).not.toBeInTheDocument();
  trigger.focus();
  await userEvent.keyboard("{Enter}");
  const panel = screen.getByText("Supporting details").closest(".kb-disclosure-panel");
  expect(panel).not.toBeNull();
  expect(trigger).toHaveAttribute("aria-controls", panel?.id);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(trigger).toHaveFocus();
  await userEvent.keyboard(" ");
  await waitFor(() => expect(screen.queryByText("Supporting details")).not.toBeInTheDocument());
  expect(submit).not.toHaveBeenCalled();
});

test("controlled state remains owned by caller and disabled blocks changes", async () => {
  const change = vi.fn();
  const view = render(
    <Disclosure open={false} onOpenChange={change}>
      <Disclosure.Trigger>Details</Disclosure.Trigger>
      <Disclosure.Panel>Content</Disclosure.Panel>
    </Disclosure>,
  );
  await userEvent.click(screen.getByRole("button"));
  expect(change.mock.calls[0]?.[0]).toBe(true);
  expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  view.rerender(
    <Disclosure open={false} disabled onOpenChange={change}>
      <Disclosure.Trigger>Details</Disclosure.Trigger>
      <Disclosure.Panel>Content</Disclosure.Panel>
    </Disclosure>,
  );
  change.mockClear();
  await userEvent.click(screen.getByRole("button"));
  expect(change).not.toHaveBeenCalled();
});

test("kept panels preserve draft state while hidden and forward refs/classes", async () => {
  const root = createRef<HTMLDivElement>();
  const trigger = createRef<HTMLButtonElement>();
  const panel = createRef<HTMLDivElement>();
  render(
    <Disclosure ref={root} defaultOpen className="custom">
      <Disclosure.Trigger ref={trigger}>Details</Disclosure.Trigger>
      <Disclosure.Panel ref={panel} keepMounted>
        <input aria-label="Draft" defaultValue="Saved draft" />
      </Disclosure.Panel>
    </Disclosure>,
  );
  expect(root.current).toHaveClass("kb-disclosure", "custom");
  expect(trigger.current).toHaveClass("kb-disclosure-trigger");
  expect(panel.current).toHaveClass("kb-disclosure-panel");
  await userEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(panel.current).toHaveAttribute("hidden"));
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("textbox")).toHaveValue("Saved draft");
});

test("cancelled changes retain closed state and render composition keeps Button semantics", async () => {
  render(
    <Disclosure onOpenChange={(_, details) => details.cancel()}>
      <Disclosure.Trigger render={<button type="button" className="custom-trigger" />}>
        Details
      </Disclosure.Trigger>
      <Disclosure.Panel>Context</Disclosure.Panel>
    </Disclosure>,
  );
  const trigger = screen.getByRole("button", { name: "Details" });
  expect(trigger).toHaveClass("kb-disclosure-trigger", "custom-trigger");
  await userEvent.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByText("Context")).not.toBeInTheDocument();
});
