import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Status, type StatusTone } from "./Status";

const tones: StatusTone[] = ["neutral", "info", "running", "success", "warning", "blocked"];

describe("Status", () => {
  test("renders text with the neutral tone by default", () => {
    const { container } = render(<Status>Idle</Status>);
    const root = container.querySelector(".kb-status");
    expect(root).toHaveAttribute("data-tone", "neutral");
    expect(root?.querySelector(".kb-status-text")).toHaveTextContent("Idle");
  });

  test.each(tones)("renders visible text for the %s tone", (tone) => {
    const { container } = render(<Status tone={tone}>Label</Status>);
    const root = container.querySelector(".kb-status");
    expect(root).toHaveAttribute("data-tone", tone);
    expect(screen.getByText("Label")).toHaveClass("kb-status-text");
  });

  test("renders a caller-provided icon as decoration", () => {
    const { container } = render(<Status icon={<svg data-testid="i" />}>Running</Status>);
    const icon = container.querySelector(".kb-status-icon");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon?.querySelector("svg")).not.toBeNull();
    expect(screen.getByText("Running")).toBeInTheDocument();
  });

  test("omits the icon slot when no icon is given", () => {
    const { container } = render(<Status>Done</Status>);
    expect(container.querySelector(".kb-status-icon")).toBeNull();
  });

  test("has no role unless live", () => {
    const { container } = render(<Status>Idle</Status>);
    expect(container.querySelector(".kb-status")).not.toHaveAttribute("role");
    expect(screen.queryByRole("status")).toBeNull();
  });

  test("live adds role=status and nothing else", () => {
    render(<Status live>Running</Status>);
    const root = screen.getByRole("status");
    expect(root).toHaveTextContent("Running");
    expect(root).not.toHaveAttribute("aria-live");
    expect(root).not.toHaveAttribute("aria-atomic");
  });

  test("compact sets data-compact and keeps the text", () => {
    const { container } = render(
      <Status compact tone="blocked">
        Blocked
      </Status>,
    );
    expect(container.querySelector(".kb-status")).toHaveAttribute("data-compact", "");
    expect(screen.getByText("Blocked")).toBeVisible();
  });

  test("applies extra className and forwards ref to the span", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Status ref={ref} className="extra">
        x
      </Status>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveClass("kb-status", "extra");
  });
});
