import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Inline } from "./Inline";

describe("Inline", () => {
  test("groups content without toolbar semantics or tab stops", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Inline ref={ref}>
        <button type="button">Save</button>
        <button type="button">Cancel</button>
      </Inline>,
    );
    expect(ref.current).toHaveClass("kb-inline");
    expect(ref.current).toHaveAttribute("data-gap", "md");
    expect(ref.current).toHaveAttribute("data-align", "center");
    expect(ref.current).toHaveAttribute("data-justify", "start");
    expect(ref.current).not.toHaveAttribute("tabindex");
    expect(screen.queryByRole("toolbar")).toBeNull();
    expect(screen.getAllByRole("button").map((node) => node.textContent)).toEqual([
      "Save",
      "Cancel",
    ]);
  });
  test("preserves list semantics, matching ref and explicit composition", () => {
    const ref = createRef<HTMLUListElement>();
    render(
      <Inline
        as="ul"
        ref={ref}
        gap="sm"
        align="baseline"
        justify="end"
        className="tags"
        aria-label="Tags"
        data-gap="lg"
      >
        <li>Design</li>
        <li>Engineering</li>
      </Inline>,
    );
    expect(screen.getByRole("list", { name: "Tags" })).toBe(ref.current);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(ref.current).toHaveClass("kb-inline", "tags");
    expect(ref.current).toHaveAttribute("data-gap", "sm");
    expect(ref.current).toHaveAttribute("data-align", "baseline");
    expect(ref.current).toHaveAttribute("data-justify", "end");
  });
});
