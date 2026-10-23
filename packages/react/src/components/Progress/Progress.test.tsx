import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Progress } from "./Progress";

describe("Progress", () => {
  test("is a named progressbar with its value", () => {
    render(<Progress label="Build" value={40} />);
    const bar = screen.getByRole("progressbar", { name: "Build" });
    expect(bar).toHaveClass("kb-progress");
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar.querySelector(".kb-progress-track > .kb-progress-indicator")).not.toBeNull();
  });

  test("shows and announces custom value text such as a step count", () => {
    render(<Progress label="Steps" value={3} max={5} valueText="3 of 5" />);
    const bar = screen.getByRole("progressbar", { name: "Steps" });
    expect(bar).toHaveAttribute("aria-valuemax", "5");
    expect(bar).toHaveAttribute("aria-valuetext", "3 of 5");
    expect(bar.querySelector(".kb-progress-value")).toHaveTextContent("3 of 5");
  });
});
