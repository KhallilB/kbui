import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Spinner, type SpinnerSize, type SpinnerTone } from "./Spinner";

const sizes: SpinnerSize[] = ["sm", "md", "lg"];
const tones: SpinnerTone[] = [
  "current",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "danger",
];

describe("Spinner", () => {
  test("renders an accessible status indicator with default label and forwards ref", () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(<Spinner ref={ref} />);
    const root = screen.getByRole("status");
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("kb-spinner");
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).toHaveAttribute("data-tone", "accent");
    expect(root).not.toHaveAttribute("data-show-label");
    const icon = container.querySelector(".kb-spinner-icon");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".kb-spinner-track")).not.toBeNull();
    expect(container.querySelector(".kb-spinner-arc")).not.toBeNull();
    const label = container.querySelector(".kb-spinner-label");
    expect(label).toHaveClass("kb-sr-only");
    expect(label).toHaveTextContent("Loading");
  });

  test("renders visible label when showLabel is true", () => {
    const { container } = render(<Spinner label="Saving changes" showLabel />);
    const root = screen.getByRole("status");
    expect(root).toHaveAttribute("data-show-label", "");
    const label = container.querySelector(".kb-spinner-label");
    expect(label).not.toHaveClass("kb-sr-only");
    expect(label).toHaveTextContent("Saving changes");
  });

  test("supports decorative mode for busy buttons without duplicate live status", () => {
    const { container } = render(<Spinner decorative tone="current" size="sm" />);
    expect(screen.queryByRole("status")).toBeNull();
    const root = container.querySelector(".kb-spinner");
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveAttribute("data-tone", "current");
    expect(root).toHaveAttribute("data-size", "sm");
    expect(container.querySelector(".kb-spinner-label")).toBeNull();
  });

  test.each(sizes)("applies data-size=%s", (size) => {
    render(<Spinner size={size} />);
    expect(screen.getByRole("status")).toHaveAttribute("data-size", size);
  });

  test.each(tones)("applies data-tone=%s", (tone) => {
    render(<Spinner tone={tone} />);
    expect(screen.getByRole("status")).toHaveAttribute("data-tone", tone);
  });

  test("forwards classNames to icon, track, arc, and label slots", () => {
    const { container } = render(
      <Spinner
        label="Syncing"
        showLabel
        className="custom-root"
        classNames={{
          icon: "slot-icon",
          track: "slot-track",
          arc: "slot-arc",
          label: "slot-label",
        }}
      />,
    );
    expect(container.querySelector(".kb-spinner")).toHaveClass("custom-root");
    expect(container.querySelector(".kb-spinner-icon")).toHaveClass("slot-icon");
    expect(container.querySelector(".kb-spinner-track")).toHaveClass("slot-track");
    expect(container.querySelector(".kb-spinner-arc")).toHaveClass("slot-arc");
    expect(container.querySelector(".kb-spinner-label")).toHaveClass("slot-label");
  });
});
