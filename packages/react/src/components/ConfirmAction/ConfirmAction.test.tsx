import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useRef, useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { ConfirmAction, type ConfirmActionProps } from "./ConfirmAction";

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function Example(props: Partial<ConfirmActionProps>) {
  return (
    <ConfirmAction
      title="Delete project?"
      description="This permanently removes the project and its data."
      onConfirm={() => undefined}
      {...props}
    >
      Delete project
    </ConfirmAction>
  );
}

async function open() {
  await userEvent.click(screen.getByRole("button", { name: "Delete project" }));
  return screen.findByRole("dialog", { name: "Delete project?" });
}

const confirmIn = (dialog: HTMLElement) =>
  within(dialog).getByRole("button", { name: "Delete project" });

describe("ConfirmAction", () => {
  test("trigger only opens the confirmation; it never runs the action", async () => {
    const onConfirm = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    render(<Example onConfirm={onConfirm} ref={ref} className="extra" />);
    const trigger = screen.getByRole("button", { name: "Delete project" });
    expect(ref.current).toBe(trigger);
    expect(trigger).toHaveClass("kb-button", "extra");
    expect(trigger).toHaveAttribute("data-variant", "danger");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const dialog = await open();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(dialog).toHaveClass("kb-dialog-popup", "kb-confirmaction");
    expect(dialog).toHaveAccessibleDescription(
      "This permanently removes the project and its data.",
    );
  });

  test("puts Cancel first and focuses it", async () => {
    render(<Example />);
    const dialog = await open();
    const buttons = within(dialog).getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["Cancel", "Delete project"]);
    expect(confirmIn(dialog)).toHaveAttribute("data-variant", "danger");
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus(),
    );
  });

  test("cancel closes without running the action and returns focus", async () => {
    const onConfirm = vi.fn();
    render(<Example onConfirm={onConfirm} />);
    const dialog = await open();
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(onConfirm).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Delete project" })).toHaveFocus(),
    );
  });

  test("outside press never dismisses", async () => {
    render(<Example />);
    await open();
    const backdrop = document.querySelector(".kb-dialog-backdrop") as HTMLElement;
    await userEvent.click(backdrop);
    fireEvent.pointerDown(document.body);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("closes after the action succeeds and returns focus to the trigger", async () => {
    const onConfirm = vi.fn(async () => undefined);
    render(<Example onConfirm={onConfirm} />);
    const dialog = await open();
    await userEvent.click(confirmIn(dialog));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Delete project" })).toHaveFocus(),
    );
  });

  test("while pending, blocks dismissal and repeated confirmation", async () => {
    const op = deferred();
    const onConfirm = vi.fn(() => op.promise);
    render(<Example onConfirm={onConfirm} pendingLabel="Deleting…" />);
    const dialog = await open();
    await userEvent.click(confirmIn(dialog));
    const pending = within(dialog).getByRole("button", { name: "Deleting…" });
    expect(pending).toHaveAttribute("aria-disabled", "true");
    expect(pending).not.toBeDisabled();
    expect(dialog).toHaveAttribute("aria-busy", "true");
    expect(dialog).toHaveAttribute("data-pending");
    const cancel = within(dialog).getByRole("button", { name: "Cancel" });
    // Focusable while pending, so a click that leaves focus on Cancel never drops it.
    expect(cancel).toHaveAttribute("aria-disabled", "true");
    expect(cancel).not.toBeDisabled();
    cancel.focus();
    await userEvent.click(cancel);
    expect(cancel).toHaveFocus();
    await userEvent.click(pending);
    await userEvent.dblClick(pending);
    await userEvent.keyboard("{Escape}");
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await act(async () => op.resolve());
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  test("a rejected action keeps the dialog open with an alert, and retry succeeds", async () => {
    const onConfirm = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(undefined);
    render(<Example onConfirm={onConfirm} />);
    const dialog = await open();
    await userEvent.click(confirmIn(dialog));
    const alert = await within(dialog).findByRole("alert");
    expect(alert).toHaveTextContent("The action did not complete. Try again.");
    expect(alert).toHaveClass("kb-confirmaction-error");
    expect(dialog).not.toHaveAttribute("aria-busy", "true");
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeEnabled();
    await userEvent.click(confirmIn(dialog));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  test("a synchronous throw is a failure, and errorMessage receives the reason", async () => {
    const reason = new Error("Project is locked");
    render(
      <Example
        onConfirm={() => {
          throw reason;
        }}
        errorMessage={(error) => (error as Error).message}
      />,
    );
    const dialog = await open();
    await userEvent.click(confirmIn(dialog));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Project is locked");
  });

  test("reopening clears a previous error", async () => {
    render(
      <Example onConfirm={() => Promise.reject(new Error("x"))} errorMessage="Could not delete." />,
    );
    let dialog = await open();
    await userEvent.click(confirmIn(dialog));
    await within(dialog).findByRole("alert");
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    dialog = await open();
    expect(within(dialog).queryByRole("alert")).not.toBeInTheDocument();
  });

  test("renders details and custom labels", async () => {
    render(
      <Example
        details={<p>3 environments will be removed.</p>}
        confirmLabel="Delete forever"
        cancelLabel="Keep project"
      />,
    );
    const dialog = await open();
    expect(within(dialog).getByText("3 environments will be removed.").parentElement).toHaveClass(
      "kb-confirmaction-details",
    );
    expect(within(dialog).getByRole("button", { name: "Delete forever" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Keep project" })).toBeInTheDocument();
  });

  test("controlled open reports every change, including close after success", async () => {
    const changes: boolean[] = [];
    function Controlled() {
      const [isOpen, setOpen] = useState(false);
      return (
        <Example
          open={isOpen}
          onOpenChange={(next) => {
            changes.push(next);
            setOpen(next);
          }}
          onConfirm={async () => undefined}
        />
      );
    }
    render(<Controlled />);
    const dialog = await open();
    await userEvent.click(confirmIn(dialog));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(changes).toEqual([true, false]);
  });

  test("onConfirmed runs once after a successful close, so removing the trigger keeps focus", async () => {
    const onConfirmed = vi.fn();
    function Row() {
      const [present, setPresent] = useState(true);
      const heading = useRef<HTMLHeadingElement>(null);
      return (
        <>
          <h2 ref={heading} tabIndex={-1}>
            Keys
          </h2>
          {present ? (
            <Example
              finalFocus={heading}
              onConfirmed={() => {
                onConfirmed(screen.queryByRole("dialog"));
                setPresent(false);
              }}
            />
          ) : null}
        </>
      );
    }
    render(<Row />);
    let dialog = await open();
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(onConfirmed).not.toHaveBeenCalled();
    dialog = await open();
    await userEvent.click(confirmIn(dialog));
    await waitFor(() => expect(onConfirmed).toHaveBeenCalledTimes(1));
    expect(onConfirmed).toHaveBeenCalledWith(null);
    expect(screen.queryByRole("button", { name: "Delete project" })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("heading", { name: "Keys" })).toHaveFocus());
  });

  test("a success that lands after a controlled close fires onConfirmed once, never on a later cancel", async () => {
    const op = deferred();
    const onConfirmed = vi.fn();
    let setOpen!: (open: boolean) => void;
    function Controlled() {
      const [isOpen, update] = useState(false);
      setOpen = update;
      return (
        <Example
          open={isOpen}
          onOpenChange={update}
          onConfirm={() => op.promise}
          onConfirmed={onConfirmed}
        />
      );
    }
    render(<Controlled />);
    let dialog = await open();
    await userEvent.click(confirmIn(dialog));
    act(() => setOpen(false));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await act(async () => op.resolve());
    expect(onConfirmed).toHaveBeenCalledTimes(1);
    act(() => setOpen(true));
    dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(onConfirmed).toHaveBeenCalledTimes(1);
  });

  test("a disabled trigger cannot open the confirmation", async () => {
    render(<Example disabled />);
    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("unmounting while pending does not throw when the action settles", async () => {
    const op = deferred();
    const { unmount } = render(<Example onConfirm={() => op.promise} />);
    const dialog = await open();
    await userEvent.click(confirmIn(dialog));
    unmount();
    await act(async () => op.reject(new Error("late")));
  });
});
