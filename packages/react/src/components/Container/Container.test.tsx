import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Container } from "./Container";

describe("Container", () => {
  test("defaults to a constrained, guttered layout div", () => {
    render(<Container>Page</Container>);
    expect(screen.getByText("Page")).toHaveClass("kb-container");
    expect(screen.getByText("Page")).toHaveAttribute("data-size", "lg");
    expect(screen.getByText("Page")).not.toHaveAttribute("data-gutter");
  });
  test("preserves native landmarks, refs and caller attributes", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Container
        as="main"
        size="sm"
        gutter={false}
        ref={ref}
        className="page"
        id="content"
        data-size="full"
      >
        Content
      </Container>,
    );
    expect(screen.getByRole("main")).toBe(ref.current);
    expect(ref.current).toHaveClass("kb-container", "page");
    expect(ref.current).toHaveAttribute("data-size", "sm");
    expect(ref.current).toHaveAttribute("data-gutter", "none");
    expect(ref.current).toHaveAttribute("id", "content");
  });
  test("explicit enabled gutters clear conflicting caller attributes", () => {
    render(
      <Container gutter data-gutter="none">
        Aligned content
      </Container>,
    );
    expect(screen.getByText("Aligned content")).not.toHaveAttribute("data-gutter");
  });
});
