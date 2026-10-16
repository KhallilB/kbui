import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { __Name__ } from "./__Name__";

describe("__Name__", () => {
  test("renders anatomy root with default variant", () => {
    const { container } = render(<__Name__>hi</__Name__>);
    const root = container.querySelector(".kb-__name__");
    expect(root).toHaveAttribute("data-variant", "default");
    expect(root).toHaveTextContent("hi");
  });
});
