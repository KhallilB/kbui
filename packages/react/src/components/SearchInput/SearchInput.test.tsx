import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  test("names a searchbox, forwards its ref and links help and errors", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <SearchInput
        label="Search components"
        value=""
        onValueChange={() => {}}
        ref={ref}
        description="Names and categories"
        error="Try another query"
        visuallyHidden
      />,
    );
    const input = screen.getByRole("searchbox", { name: "Search components" });
    expect(ref.current).toBe(input);
    expect(input).toHaveAccessibleDescription("Names and categories Try another query");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });
  test("controlled edits stay owned by caller", async () => {
    const change = vi.fn();
    const { rerender } = render(
      <SearchInput label="Search" value="panel" onValueChange={change} />,
    );
    const input = screen.getByRole("searchbox");
    await userEvent.type(input, "s");
    expect(change).toHaveBeenCalledWith("panels");
    expect(input).toHaveValue("panel");
    rerender(<SearchInput label="Search" value="panels" onValueChange={change} />);
    expect(input).toHaveValue("panels");
  });
  test("clear action empties query, restores input focus and never submits", async () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    function Search() {
      const [value, setValue] = useState("panel");
      return (
        <form onSubmit={submit}>
          <SearchInput label="Search" name="q" value={value} onValueChange={setValue} />
        </form>
      );
    }
    render(<Search />);
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getByRole("searchbox")).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
    expect(submit).not.toHaveBeenCalled();
  });
  test("disabled and readonly queries expose no clear action", async () => {
    const change = vi.fn();
    const { rerender } = render(
      <SearchInput label="Search" value="panel" onValueChange={change} disabled />,
    );
    expect(screen.getByRole("searchbox")).toBeDisabled();
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<SearchInput label="Search" value="panel" onValueChange={change} readOnly />);
    await userEvent.type(screen.getByRole("searchbox"), "x");
    expect(screen.queryByRole("button")).toBeNull();
    expect(change).not.toHaveBeenCalled();
  });
  test("submits native search value and supports required validation", () => {
    const { rerender } = render(
      <form aria-label="Find">
        <SearchInput label="Search" name="q" required value="panel" onValueChange={() => {}} />
      </form>,
    );
    const form = screen.getByRole("form") as HTMLFormElement;
    expect(new FormData(form).get("q")).toBe("panel");
    expect(form.checkValidity()).toBe(true);
    rerender(
      <form aria-label="Find">
        <SearchInput label="Search" name="q" required value="" onValueChange={() => {}} />
      </form>,
    );
    expect(form.checkValidity()).toBe(false);
  });
  test("clear action accepts a localized accessible name and retains controlled value", async () => {
    const change = vi.fn();
    render(
      <SearchInput
        label="Rechercher"
        value="panel"
        onValueChange={change}
        clearLabel="Effacer la recherche"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Effacer la recherche" }));
    expect(change).toHaveBeenCalledExactlyOnceWith("");
    expect(screen.getByRole("searchbox")).toHaveValue("panel");
  });
});
