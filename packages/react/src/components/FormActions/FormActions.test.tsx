import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test } from "vitest";
import { Button } from "../Button/Button";
import { FormActions } from "./FormActions";

afterEach(cleanup);

describe("FormActions", () => {
  test("renders action container with default end alignment and no divider", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <FormActions ref={ref} data-testid="actions">
        <Button variant="ghost">Cancel</Button>
        <Button type="submit">Save changes</Button>
      </FormActions>,
    );
    const root = screen.getByTestId("actions");
    expect(ref.current).toBe(root);
    expect(root.classList.contains("kb-formactions")).toBe(true);
    expect(root.getAttribute("data-align")).toBe("end");
    expect(root.hasAttribute("data-divider")).toBe(false);
    expect(root.getAttribute("role")).toBeNull();
  });

  test("supports start and between alignment and optional top divider", () => {
    render(
      <FormActions align="between" divider className="custom-footer" data-testid="actions">
        <Button type="reset" variant="ghost">
          Reset
        </Button>
        <Button type="submit">Publish</Button>
      </FormActions>,
    );
    const root = screen.getByTestId("actions");
    expect(root.getAttribute("data-align")).toBe("between");
    expect(root.hasAttribute("data-divider")).toBe(true);
    expect(root.classList.contains("custom-footer")).toBe(true);
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["Reset", "Publish"]);
  });
});
