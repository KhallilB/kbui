import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { Thumbnail } from "./Thumbnail";

describe("Thumbnail", () => {
  test("retains media anatomy when Image root slot is customized", () => {
    const { container } = render(
      <Thumbnail
        alt="Study"
        classNames={{ media: "tile" }}
        imageProps={{ classNames: { root: "custom-frame" } }}
      />,
    );
    expect(container.querySelector(".kb-image")).toHaveClass(
      "kb-thumbnail-media",
      "tile",
      "custom-frame",
    );
  });
  test("associates caption and keeps metadata after image failure", () => {
    const { container } = render(
      <Thumbnail
        src="/coat.jpg"
        alt="Sand wool coat"
        caption="Studio coat"
        description="Front view · 240 KB"
      />,
    );
    const figure = screen.getByRole("figure", { name: "Studio coat" });
    expect(figure.tagName).toBe("FIGURE");
    expect(figure.querySelector("figcaption")).toBeInTheDocument();
    fireEvent.error(requiredImage(container));
    expect(screen.getByText("Front view · 240 KB")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Sand wool coat" })).toHaveAttribute(
      "data-state",
      "error",
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
  test("allows caption links without another focus stop", () => {
    render(
      <Thumbnail
        alt=""
        caption={<a href="/attachment">Brand guide.pdf</a>}
        description="PDF · 2.4 MB"
        fallback="PDF"
      />,
    );
    expect(screen.getByRole("link", { name: "Brand guide.pdf" })).toHaveAttribute(
      "href",
      "/attachment",
    );
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
  test("forwards figure ref and caller naming without requiring a caption", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Thumbnail
        ref={ref}
        alt="Mountain"
        aria-label="Alpine study"
        ratio="wide"
        className="custom"
      />,
    );
    expect(screen.getByRole("figure", { name: "Alpine study" })).toBe(ref.current);
    expect(ref.current).toHaveClass("custom");
    expect(ref.current?.querySelector("figcaption")).toBeNull();
    expect(screen.getByRole("img")).toHaveAttribute("data-ratio", "wide");
  });
});

function requiredImage(container: HTMLElement): HTMLImageElement {
  const image = container.querySelector("img");
  if (!image) throw new Error("Expected a native image request");
  return image;
}
