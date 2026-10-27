import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Text } from "./Text";

describe("Text", () => {
  test("defaults to a body paragraph", () => {
    render(<Text>Readable content</Text>);
    const paragraph = screen.getByText("Readable content");
    expect(paragraph.tagName).toBe("P");
    expect(paragraph).toHaveClass("kb-text");
    expect(paragraph).toHaveAttribute("data-size", "md");
    expect(paragraph).toHaveAttribute("data-tone", "default");
  });

  test("supports inline content, native props and matching ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <p>
        Updated{" "}
        <Text
          as="span"
          ref={ref}
          size="sm"
          tone="muted"
          className="extra"
          title="Today"
          data-tone="default"
        >
          today
        </Text>
        .
      </p>,
    );
    expect(ref.current?.tagName).toBe("SPAN");
    expect(ref.current).toHaveAttribute("data-size", "sm");
    expect(ref.current).toHaveAttribute("data-tone", "muted");
    expect(ref.current).toHaveAttribute("title", "Today");
    expect(ref.current).toHaveClass("kb-text", "extra");
  });

  test("supports block grouping without adding a paragraph", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Text as="div" size="lg" ref={ref}>
        <p>One</p>
        <p>Two</p>
      </Text>,
    );
    expect(ref.current?.tagName).toBe("DIV");
    expect(ref.current?.children).toHaveLength(2);
  });
});
