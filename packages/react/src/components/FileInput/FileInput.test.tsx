import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { FileInput, type FileInputItem } from "./FileInput";

const initial = [
  { id: "guide", name: "welcome-guide.docx" },
  { id: "labels", name: "room-labels.csv" },
  { id: "menu", name: "old-menu.docx" },
];
function Example() {
  const [items, setItems] = useState<FileInputItem[]>(initial);
  return (
    <FileInput
      label="Source files"
      items={items}
      onFiles={() => {}}
      onRemove={(id) => setItems((current) => current.filter((item) => item.id !== id))}
    />
  );
}
describe("FileInput", () => {
  it("moves keyboard focus to next, previous and finally picker on removal", async () => {
    render(<Example />);
    screen.getByRole("button", { name: "Remove room-labels.csv" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Remove old-menu.docx" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Remove welcome-guide.docx" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Source files Choose files" })).toHaveFocus();
    expect(screen.getByText("No files added.")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("welcome-guide.docx removed.");
  });
  it("keeps focus when controlled removal is refused and avoids stealing external focus", async () => {
    const remove = vi.fn();
    const { rerender } = render(
      <>
        <FileInput label="Files" items={initial} onFiles={() => {}} onRemove={remove} />
        <button type="button">Other action</button>
      </>,
    );
    const button = screen.getByRole("button", { name: "Remove welcome-guide.docx" });
    button.focus();
    await userEvent.keyboard("{Enter}");
    expect(remove).toHaveBeenCalledWith("guide");
    expect(button).toHaveFocus();
    screen.getByRole("button", { name: "Other action" }).focus();
    rerender(
      <>
        <FileInput label="Files" items={initial.slice(1)} onFiles={() => {}} onRemove={remove} />
        <button type="button">Other action</button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Other action" })).toHaveFocus();
  });
  it("delivers original File objects, clears picker for reselection and ignores cancellation", async () => {
    const onFiles = vi.fn();
    const inputRef = createRef<HTMLInputElement>();
    render(
      <FileInput
        label="Evidence"
        items={[]}
        multiple
        accept="image/jpeg"
        onFiles={onFiles}
        onRemove={() => {}}
        inputRef={inputRef}
      />,
    );
    const file = new File(["fixture"], "return-label.jpg", { type: "image/jpeg" });
    const input = inputRef.current as HTMLInputElement;
    await userEvent.upload(input, file);
    expect(onFiles).toHaveBeenLastCalledWith([file]);
    expect(onFiles.mock.calls[0]?.[0][0]).toBe(file);
    expect(input.value).toBe("");
    await userEvent.upload(input, file);
    expect(onFiles).toHaveBeenCalledTimes(2);
    fireEvent.change(input, { target: { files: [] } });
    expect(onFiles).toHaveBeenCalledTimes(2);
  });
  it("shows only caller-accepted items and retains them while projecting an error", () => {
    render(
      <FileInput
        label="Evidence"
        items={[{ id: "photo", name: "return-label.jpg", description: "0.4 MB" }]}
        onFiles={() => {}}
        onRemove={() => {}}
        error="notes.exe: choose JPEG or PNG."
        description="Optional return evidence"
      />,
    );
    expect(screen.getByText("return-label.jpg")).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent("notes.exe");
    expect(
      screen.getByRole("button", { name: "Evidence Choose files" }),
    ).toHaveAccessibleDescription("Optional return evidence notes.exe: choose JPEG or PNG.");
    expect(screen.getByRole("button", { name: "Evidence Choose files" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    render(
      <FileInput
        label="Grammar evidence"
        items={[]}
        aria-invalid="grammar"
        onFiles={() => {}}
        onRemove={() => {}}
      />,
    );
    const grammar = screen.getByRole("button", { name: "Grammar evidence Choose files" });
    expect(grammar).toHaveAttribute("aria-invalid", "grammar");
    expect(grammar.closest(".kb-fileinput")).toHaveAttribute("data-invalid", "");
    expect(grammar.closest(".kb-fileinput")).not.toHaveAttribute("aria-invalid");
  });
  it("blocks picker and removal for disabled and read-only states", async () => {
    const change = vi.fn(),
      remove = vi.fn();
    const inputRef = createRef<HTMLInputElement>();
    const { rerender } = render(
      <FileInput
        label="Files"
        items={initial}
        onFiles={change}
        onRemove={remove}
        disabled
        inputRef={inputRef}
      />,
    );
    expect(screen.getByRole("button", { name: "Files Choose files" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove welcome-guide.docx" })).toBeDisabled();
    fireEvent.change(inputRef.current as HTMLInputElement, {
      target: { files: [new File(["x"], "x.csv")] },
    });
    expect(change).not.toHaveBeenCalled();
    rerender(
      <FileInput label="Files" items={initial} onFiles={change} onRemove={remove} readOnly />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove welcome-guide.docx" }));
    expect(remove).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Files Choose files" })).toBeDisabled();
  });
  it("supports localized actions, custom item content and public root/trigger refs", async () => {
    const root = createRef<HTMLDivElement>(),
      trigger = createRef<HTMLButtonElement>();
    render(
      <FileInput
        ref={root}
        triggerRef={trigger}
        label="Pièces jointes"
        items={[{ id: "a", name: "lettre.csv" }]}
        onFiles={() => {}}
        onRemove={() => {}}
        chooseLabel="Choisir"
        removeLabel={(item) => `Retirer ${item.name}`}
        renderItem={(item) => <strong>{item.name} · 600 mots</strong>}
        itemClassName="document"
      />,
    );
    expect(trigger.current).toBe(screen.getByRole("button", { name: "Pièces jointes Choisir" }));
    expect(root.current).toHaveClass("kb-fileinput");
    expect(screen.getByRole("button", { name: "Retirer lettre.csv" })).toBeVisible();
    expect(root.current?.querySelector(".document")).toHaveTextContent("600 mots");
  });
});

it("forgets refused removal when the user blurs to the page body", async () => {
  const remove = vi.fn();
  const view = (items: FileInputItem[]) => (
    <FileInput label="Files" items={items} onFiles={() => {}} onRemove={remove} />
  );
  const { rerender } = render(view(initial));
  const button = screen.getByRole("button", { name: "Remove welcome-guide.docx" });
  button.focus();
  await userEvent.keyboard("{Enter}");
  button.blur();
  expect(document.activeElement).toBe(document.body);
  rerender(view(initial.slice(1)));
  expect(document.activeElement).toBe(document.body);
});
