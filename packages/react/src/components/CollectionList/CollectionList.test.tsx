import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { CollectionList } from "./CollectionList";

describe("CollectionList", () => {
  it("preserves named native unordered and ordered lists with list-item children", () => {
    const { rerender } = render(
      <CollectionList aria-label="Projects">
        <li>Ada</li>
        <li>Lin</li>
      </CollectionList>,
    );
    expect(screen.getByRole("list", { name: "Projects" }).tagName).toBe("UL");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    const ref = createRef<HTMLOListElement>();
    rerender(
      <CollectionList as="ol" ref={ref} start={3} reversed aria-label="Ranked projects">
        <li>Lin</li>
        <li>Ada</li>
      </CollectionList>,
    );
    expect(ref.current).toBe(screen.getByRole("list", { name: "Ranked projects" }));
    expect(ref.current?.tagName).toBe("OL");
    expect(ref.current).toHaveAttribute("start", "3");
    expect(ref.current).toHaveAttribute("reversed");
  });
  it("forwards root ref, busy state, density and divider choices without interactive roles", () => {
    const ref = createRef<HTMLUListElement>();
    render(
      <CollectionList
        ref={ref}
        density="dense"
        dividers={false}
        aria-busy="true"
        className="custom"
      >
        <li>Loading record</li>
      </CollectionList>,
    );
    expect(ref.current).toHaveAttribute("aria-busy", "true");
    expect(ref.current).toHaveAttribute("data-density", "dense");
    expect(ref.current).not.toHaveAttribute("data-dividers");
    expect(ref.current).toHaveClass("kb-collectionlist", "custom");
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
