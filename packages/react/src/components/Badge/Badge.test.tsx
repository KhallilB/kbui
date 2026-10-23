import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  test("renders neutral text by default", () => {
    render(<Badge>Reviewer</Badge>);
    const badge = screen.getByText("Reviewer");
    expect(badge).toHaveClass("kb-badge");
    expect(badge).toHaveAttribute("data-tone", "neutral");
    expect(badge).not.toHaveAttribute("data-mono");
  });

  test("applies tone, mono and className, and forwards ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Badge ref={ref} tone="info" mono className="extra">
        writes
      </Badge>,
    );
    expect(ref.current).toHaveAttribute("data-tone", "info");
    expect(ref.current).toHaveAttribute("data-mono", "");
    expect(ref.current).toHaveClass("kb-badge", "extra");
  });

  test("preserveCase marks mono text that must keep its case", () => {
    const { rerender } = render(<Badge mono>Reviewer</Badge>);
    expect(screen.getByText("Reviewer")).not.toHaveAttribute("data-preserve-case");
    rerender(
      <Badge mono preserveCase>
        feat/control-room
      </Badge>,
    );
    expect(screen.getByText("feat/control-room")).toHaveAttribute("data-preserve-case", "");
  });

  test("appearance defaults to chip and plain drops the chip", () => {
    const { rerender } = render(<Badge>meta</Badge>);
    expect(screen.getByText("meta")).toHaveAttribute("data-appearance", "chip");
    rerender(
      <Badge appearance="plain" mono>
        meta
      </Badge>,
    );
    expect(screen.getByText("meta")).toHaveAttribute("data-appearance", "plain");
  });
});
