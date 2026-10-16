import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { Button } from "../Button/Button";
import { Dialog } from "./Dialog";

function Example() {
  return (
    <Dialog>
      <Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>
      <Dialog.Content title="Delete project" description="Cannot be undone.">
        <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
        <Button variant="danger">Delete</Button>
      </Dialog.Content>
    </Dialog>
  );
}

describe("Dialog", () => {
  test("is closed until the trigger is clicked", async () => {
    render(<Example />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog", { name: "Delete project" });
    expect(dialog).toHaveClass("kb-dialog-popup");
    expect(dialog).toHaveAttribute("data-open");
    expect(dialog).toHaveAccessibleDescription("Cannot be undone.");
    expect(document.querySelector(".kb-dialog-backdrop")).toBeInTheDocument();
    expect(document.querySelector(".kb-dialog-body")).toContainElement(
      screen.getByRole("button", { name: "Delete" }),
    );
  });

  test("close button closes it", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  test("escape closes it", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  test("composes Title and Description when props are omitted", async () => {
    render(
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Custom</Dialog.Title>
          <Dialog.Description>Body</Dialog.Description>
        </Dialog.Content>
      </Dialog>,
    );
    const dialog = await screen.findByRole("dialog", { name: "Custom" });
    expect(dialog.querySelector(".kb-dialog-title")).toHaveTextContent("Custom");
    expect(dialog.querySelector(".kb-dialog-description")).toHaveTextContent("Body");
  });

  test("trigger via render={<Button />} keeps kb-button and announces a dialog", () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger).toHaveClass("kb-button");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });
});
