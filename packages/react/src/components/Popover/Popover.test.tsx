import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, test, vi } from "vitest";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import { Popover } from "./Popover";

function Example() {
  return (
    <Popover>
      <Popover.Trigger render={<Button />}>Options</Popover.Trigger>
      <Popover.Content title="View options" description="Applies to this view.">
        <input aria-label="Filter" />
        <Popover.Close render={<Button />}>Done</Popover.Close>
      </Popover.Content>
    </Popover>
  );
}

test("structured content keeps naming, native section refs and footer dismissal", async () => {
  const body = createRef<HTMLDivElement>();
  const footer = createRef<HTMLDivElement>();
  render(
    <Popover>
      <Popover.Trigger>View options</Popover.Trigger>
      <Popover.Content title="Project filters" description="Refine this view.">
        <Popover.Body
          ref={body}
          className="filters"
          role="region"
          aria-label="Filter fields"
          tabIndex={0}
        >
          <input aria-label="Contains text" />
        </Popover.Body>
        <Popover.Footer ref={footer} className="actions">
          <Popover.Close>Done</Popover.Close>
        </Popover.Footer>
      </Popover.Content>
    </Popover>,
  );
  const trigger = screen.getByRole("button", { name: "View options" });
  await userEvent.click(trigger);
  const popup = await screen.findByRole("dialog", { name: "Project filters" });
  expect(popup).toHaveAccessibleDescription("Refine this view.");
  expect(popup.querySelector(".kb-popover-header")).toContainElement(
    screen.getByRole("heading", { name: "Project filters" }),
  );
  expect(body.current).toBe(screen.getByRole("region", { name: "Filter fields" }));
  expect(body.current).toHaveClass("kb-popover-body", "filters");
  expect(footer.current).toHaveClass("kb-popover-footer", "actions");
  expect(footer.current).toContainElement(screen.getByRole("button", { name: "Done" }));
  await userEvent.click(screen.getByRole("button", { name: "Done" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await waitFor(() => expect(trigger).toHaveFocus());
});

test("composed Header retains native props and naming parts", async () => {
  const header = createRef<HTMLDivElement>();
  render(
    <Popover defaultOpen>
      <Popover.Content>
        <Popover.Header ref={header} className="heading">
          <Popover.Title>View options</Popover.Title>
          <Popover.Description>Refine this view.</Popover.Description>
        </Popover.Header>
        <Popover.Body>Context</Popover.Body>
        <Popover.Footer>
          <Popover.Close>Done</Popover.Close>
        </Popover.Footer>
      </Popover.Content>
    </Popover>,
  );
  const popup = await screen.findByRole("dialog", { name: "View options" });
  expect(header.current).toHaveClass("kb-popover-header", "heading");
  expect(popup).toHaveAccessibleDescription("Refine this view.");
  expect(popup.querySelectorAll(".kb-popover-header")).toHaveLength(1);
});

test("opens named interactive content and Escape restores trigger focus", async () => {
  render(<Example />);
  const trigger = screen.getByRole("button", { name: "Options" });
  expect(trigger).toHaveClass("kb-button");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  trigger.focus();
  await userEvent.keyboard("{Enter}");
  const popup = await screen.findByRole("dialog", { name: "View options" });
  expect(popup).toHaveAccessibleDescription("Applies to this view.");
  expect(trigger).toHaveAttribute("aria-controls", popup.id);
  await waitFor(() => expect(screen.getByRole("textbox")).toHaveFocus());
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await waitFor(() => expect(trigger).toHaveFocus());
});

test("outside press and explicit Close dismiss non-modal content", async () => {
  render(
    <>
      <Example />
      <button type="button">Outside</button>
    </>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Options" }));
  await screen.findByRole("dialog");
  await userEvent.click(screen.getByRole("button", { name: "Outside" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await userEvent.click(screen.getByRole("button", { name: "Options" }));
  await userEvent.click(await screen.findByRole("button", { name: "Done" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});

test("controlled state, composed labels, custom portal and refs reach owning elements", async () => {
  const change = vi.fn();
  const popup = createRef<HTMLDivElement>();
  const trigger = createRef<HTMLButtonElement>();
  const host = document.createElement("div");
  document.body.append(host);
  const view = render(
    <Popover open onOpenChange={change}>
      <Popover.Trigger ref={trigger}>Options</Popover.Trigger>
      <Popover.Content
        ref={popup}
        container={host}
        className="custom"
        classNames={{ positioner: "position" }}
        side="top"
        align="end"
        sideOffset={12}
      >
        <Popover.Title>Composed title</Popover.Title>
        <Popover.Description>Context</Popover.Description>
        <Popover.Close>Done</Popover.Close>
      </Popover.Content>
    </Popover>,
  );
  const dialog = await screen.findByRole("dialog", { name: "Composed title" });
  expect(popup.current).toBe(dialog);
  expect(trigger.current).toBe(screen.getByRole("button", { name: "Options" }));
  expect(host).toContainElement(dialog);
  expect(dialog).toHaveClass("kb-popover", "custom");
  expect(host.querySelector(".kb-popover-positioner")).toHaveClass("position");
  expect(dialog).toHaveAccessibleDescription("Context");
  await userEvent.click(screen.getByRole("button", { name: "Done" }));
  expect(change.mock.calls[0]?.[0]).toBe(false);
  expect(dialog).toBeInTheDocument();
  view.unmount();
  host.remove();
});

test("Escape closes nested popover before its dialog", async () => {
  render(
    <Dialog defaultOpen>
      <Dialog.Content title="Editor">
        <Example />
        <Dialog.Close>Close editor</Dialog.Close>
      </Dialog.Content>
    </Dialog>,
  );
  await userEvent.click(await screen.findByRole("button", { name: "Options" }));
  await screen.findByRole("dialog", { name: "View options" });
  await userEvent.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog", { name: "View options" })).not.toBeInTheDocument(),
  );
  expect(screen.getByRole("dialog", { name: "Editor" })).toBeInTheDocument();
});

test("disabled trigger and cancelled changes cannot open content", async () => {
  const change = vi.fn();
  const view = render(
    <Popover onOpenChange={change}>
      <Popover.Trigger disabled>Options</Popover.Trigger>
      <Popover.Content title="Options" />
    </Popover>,
  );
  await userEvent.click(screen.getByRole("button"));
  expect(change).not.toHaveBeenCalled();
  view.rerender(
    <Popover onOpenChange={(_, details) => details.cancel()}>
      <Popover.Trigger>Options</Popover.Trigger>
      <Popover.Content title="Options" />
    </Popover>,
  );
  await userEvent.click(screen.getByRole("button"));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("explicit focus targets and naming part refs reach native elements", async () => {
  const initial = createRef<HTMLButtonElement>();
  const final = createRef<HTMLButtonElement>();
  const title = createRef<HTMLHeadingElement>();
  const description = createRef<HTMLParagraphElement>();
  render(
    <>
      <button ref={final} type="button">
        Next task
      </button>
      <Popover>
        <Popover.Trigger>Options</Popover.Trigger>
        <Popover.Content initialFocus={initial} finalFocus={final}>
          <Popover.Title ref={title} className="heading">
            Details
          </Popover.Title>
          <Popover.Description ref={description} className="help">
            Supporting context
          </Popover.Description>
          <button type="button">First action</button>
          <Popover.Close ref={initial}>Done</Popover.Close>
        </Popover.Content>
      </Popover>
    </>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Options" }));
  await screen.findByRole("dialog", { name: "Details" });
  await waitFor(() => expect(initial.current).toHaveFocus());
  expect(title.current).toHaveClass("kb-popover-title", "heading");
  expect(description.current).toHaveClass("kb-popover-description", "help");
  await userEvent.click(screen.getByRole("button", { name: "Done" }));
  await waitFor(() => expect(final.current).toHaveFocus());
});
