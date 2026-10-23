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
});
