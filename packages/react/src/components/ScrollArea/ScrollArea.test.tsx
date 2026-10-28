import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { ScrollArea } from "./ScrollArea";

describe("ScrollArea", () => {
  test("viewport is a named, keyboard-focusable region holding the content and forwards root ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <ScrollArea ref={ref} label="Output" maxHeight="10rem">
        <p>line one</p>
      </ScrollArea>,
    );
    const region = screen.getByRole("region", { name: "Output" });
    expect(region).toHaveClass("kb-scrollarea-viewport");
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveTextContent("line one");
    const root = container.querySelector(".kb-scrollarea") as HTMLElement;
    expect(ref.current).toBe(root);
    expect(root.style.getPropertyValue("--_scrollarea-max-height")).toBe("10rem");
  });
});
