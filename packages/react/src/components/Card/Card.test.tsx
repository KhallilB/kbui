import { render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  test("renders a non-interactive article with caller content and no extra controls", () => {
    render(
      <Card aria-labelledby="title">
        <h2 id="title">
          <a href="/work/example">Example</a>
        </h2>
        <p>Summary</p>
      </Card>,
    );
    const card = screen.getByRole("article");
    expect(card).toHaveClass("kb-card");
    expect(card).toHaveAttribute("data-appearance", "outlined");
    expect(card).not.toHaveAttribute("tabindex");
    expect(within(card).getAllByRole("link")).toHaveLength(1);
    expect(within(card).queryByRole("button")).toBeNull();
  });
  test("preserves semantic list items and plain appearance", () => {
    render(
      <ul>
        <Card as="li" appearance="plain">
          Study
        </Card>
      </ul>,
    );
    expect(screen.getByRole("listitem")).toHaveAttribute("data-appearance", "plain");
  });
  test("forwards article ref, attributes and custom classes", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Card ref={ref} className="skin" data-place="example">
        Body
      </Card>,
    );
    expect(ref.current?.tagName).toBe("ARTICLE");
    expect(ref.current).toHaveClass("kb-card", "skin");
    expect(ref.current).toHaveAttribute("data-place", "example");
  });
});
