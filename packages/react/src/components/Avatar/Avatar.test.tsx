import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, type SyntheticEvent } from "react";
import { describe, expect, test } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  test("forwards native photo events with image event types", () => {
    let loaded = false;
    const onLoad = (event: SyntheticEvent<HTMLImageElement>) => {
      loaded = event.currentTarget.tagName === "IMG";
    };
    const { container } = render(<Avatar name="Maya Chen" src="/maya.jpg" onLoad={onLoad} />);
    fireEvent.load(requiredImage(container));
    expect(loaded).toBe(true);
  });
  test.each([
    ["Maya Chen", "MC"],
    ["  Ana María López  ", "AL"],
    ["李", "李"],
    ["", "?"],
  ])("names %s and derives fallback %s", (name, initials) => {
    render(<Avatar name={name} />);
    expect(screen.getByRole("img", { name: name.trim() || "Unknown person" })).toBeInTheDocument();
    expect(screen.getByText(initials)).toBeInTheDocument();
  });
  test("preserves identity after failure and resets for another person", () => {
    const { container, rerender } = render(
      <Avatar name="Maya Chen" initials="M" src="/maya.jpg" />,
    );
    expect(screen.getByText("M")).toBeInTheDocument();
    fireEvent.error(requiredImage(container));
    expect(screen.getByRole("img", { name: "Maya Chen" })).toBeInTheDocument();
    expect(container.querySelector(".kb-image")).toHaveAttribute("data-state", "error");
    rerender(<Avatar name="Robin Ellis" src="/robin.jpg" />);
    expect(screen.getByRole("img", { name: "Robin Ellis" })).toBeInTheDocument();
    expect(screen.getByText("RE")).toBeInTheDocument();
    expect(container.querySelector(".kb-image")).toHaveAttribute("data-state", "loading");
  });
  test("supports decorative identity and forwards root ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Avatar ref={ref} name="Maya Chen" decorative size="lg" shape="square" className="custom" />,
    );
    expect(screen.queryByRole("img")).toBeNull();
    expect(ref.current).toHaveAttribute("aria-hidden", "true");
    expect(ref.current).toHaveAttribute("data-size", "lg");
    expect(ref.current).toHaveAttribute("data-shape", "square");
    expect(ref.current).toHaveClass("custom");
  });
});

function requiredImage(container: HTMLElement): HTMLImageElement {
  const image = container.querySelector("img");
  if (!image) throw new Error("Expected a native image request");
  return image;
}
