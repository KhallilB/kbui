import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Callout } from "./Callout";

describe("Callout", () => {
  test("renders title, body and actions with the neutral tone and forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Callout ref={ref} title="Needs an answer" actions={<button type="button">Answer</button>}>
        Overwrite the file?
      </Callout>,
    );
    const root = container.querySelector(".kb-callout");
    expect(ref.current).toBe(root);
    expect(root).toHaveAttribute("data-tone", "neutral");
    expect(root?.querySelector(".kb-callout-title")).toHaveTextContent("Needs an answer");
    expect(root?.querySelector(".kb-callout-body")).toHaveTextContent("Overwrite the file?");
    expect(root?.querySelector(".kb-callout-actions button")).toHaveTextContent("Answer");
    expect(root).not.toHaveAttribute("role");
  });

  test("icon is decorative, tone applies, live adds role=status", () => {
    render(
      <Callout tone="warning" icon={<svg />} live>
        Blocked
      </Callout>,
    );
    const root = screen.getByRole("status");
    expect(root).toHaveAttribute("data-tone", "warning");
    expect(root.querySelector(".kb-callout-icon")).toHaveAttribute("aria-hidden", "true");
    expect(root.querySelector(".kb-callout-title")).toBeNull();
  });
});
