import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  test("shows its content when the trigger is hovered", async () => {
    render(
      <Tooltip content="Stop worker" delay={0}>
        <button type="button" aria-label="Stop">
          x
        </button>
      </Tooltip>,
    );
    expect(screen.queryByText("Stop worker")).toBeNull();
    await userEvent.hover(screen.getByRole("button", { name: "Stop" }));
    const popup = await screen.findByText("Stop worker");
    expect(popup.closest(".kb-tooltip")).not.toBeNull();
  });
});
