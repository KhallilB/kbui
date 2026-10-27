import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Code } from "./Code";

describe("Code", () => {
  test("renders literal inline code without changing case or whitespace", () => {
    const ref = createRef<HTMLElement>();
    const source = '<Widget path="Src/My File.tsx" />';
    render(
      <p>
        Use{" "}
        <Code ref={ref} className="extra" title="Example">
          {source}
        </Code>
        .
      </p>,
    );
    expect(ref.current?.tagName).toBe("CODE");
    expect(ref.current?.textContent).toBe(source);
    expect(ref.current).toHaveClass("kb-code", "extra");
    expect(ref.current).toHaveAttribute("title", "Example");
    expect(screen.getByText(source).children).toHaveLength(0);
  });
});
