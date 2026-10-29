import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { Image } from "./Image";

describe("Image", () => {
  test("reserves intrinsic ratio through loading, success, failure and missing sources", () => {
    const { container, rerender } = render(
      <Image src="/portrait.jpg" alt="Portrait" ratio="auto" width={900} height={1200} />,
    );
    const frame = screen.getByRole("img", { name: "Portrait" });
    expect(frame).toHaveAttribute("data-state", "loading");
    expect(frame).toHaveStyle({ aspectRatio: "900 / 1200" });
    fireEvent.load(requiredImage(container));
    expect(frame).toHaveAttribute("data-state", "loaded");
    expect(frame).toHaveStyle({ aspectRatio: "900 / 1200" });
    fireEvent.error(requiredImage(container));
    expect(frame).toHaveAttribute("data-state", "error");
    expect(frame).toHaveStyle({ aspectRatio: "900 / 1200" });
    rerender(<Image alt="Portrait" ratio="auto" width={900} height={1200} />);
    expect(screen.getByRole("img")).toHaveAttribute("data-state", "empty");
    expect(screen.getByRole("img")).toHaveStyle({ aspectRatio: "900 / 1200" });
    expect(container.querySelector("img")).toBeNull();
  });
  test.each([
    { width: 900 },
    { height: 1200 },
    { width: 0, height: 1200 },
    { width: 900, height: -1 },
    { width: "invalid", height: 1200 },
  ])(
    "leaves intrinsic framing to CSS when dimensions are incomplete or invalid: %j",
    (dimensions) => {
      render(<Image alt="Preview" ratio="auto" {...dimensions} />);
      expect(screen.getByRole("img")).toHaveAttribute("data-ratio", "auto");
      expect(screen.getByRole("img").style.aspectRatio).toBe("");
    },
  );
  test("preserves explicit frame ratio override over intrinsic dimensions", () => {
    render(
      <Image
        alt="Preview"
        ratio="auto"
        width={900}
        height={1200}
        style={{ aspectRatio: "2 / 1" }}
      />,
    );
    expect(screen.getByRole("img")).toHaveStyle({ aspectRatio: "2 / 1" });
  });
  test("keeps accessible identity through loading, success and failure", () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <Image src="/coat.jpg" alt="Wool coat" onLoad={onLoad} onError={onError} />,
    );
    const frame = screen.getByRole("img", { name: "Wool coat" });
    const image = requiredImage(container);
    expect(frame).toHaveAttribute("data-state", "loading");
    fireEvent.load(image);
    expect(frame).toHaveAttribute("data-state", "loaded");
    expect(onLoad).toHaveBeenCalledOnce();
    fireEvent.error(image);
    expect(frame).toHaveAttribute("data-state", "error");
    expect(screen.getByRole("img", { name: "Wool coat" })).toBe(frame);
    expect(onError).toHaveBeenCalledOnce();
  });
  test("does not request an empty source and hides decorative alternatives", () => {
    const { container } = render(<Image src="  " alt="" fallback="No preview" />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.firstChild).toHaveAttribute("data-state", "empty");
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("No preview")).toBeInTheDocument();
  });
  test("retries changed sources and supports responsive native attributes", () => {
    const { container, rerender } = render(<Image src="/bad.jpg" alt="Coat" />);
    fireEvent.error(requiredImage(container));
    rerender(
      <Image
        src="/good.jpg"
        srcSet="/good.jpg 1x, /large.jpg 2x"
        sizes="50vw"
        alt="Coat"
        width={800}
        height={600}
        loading="lazy"
      />,
    );
    expect(screen.getByRole("img")).toHaveAttribute("data-state", "loading");
    const image = requiredImage(container);
    expect(image).toHaveAttribute("src", "/good.jpg");
    expect(image).toHaveAttribute("srcset", "/good.jpg 1x, /large.jpg 2x");
    expect(image).toHaveAttribute("sizes", "50vw");
    expect(image).toHaveAttribute("width", "800");
    expect(image).toHaveAttribute("height", "600");
    expect(image).toHaveAttribute("loading", "lazy");
    fireEvent.load(image);
    expect(screen.getByRole("img")).toHaveAttribute("data-state", "loaded");
    rerender(<Image src="/good.jpg" srcSet="/new.jpg 1x" alt="Coat" />);
    expect(screen.getByRole("img")).toHaveAttribute("data-state", "loading");
  });
  test("recognizes an already cached image on mount", () => {
    const complete = vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    const width = vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(800);
    try {
      render(<Image src="/cached.jpg" alt="Cached coat" />);
      expect(screen.getByRole("img")).toHaveAttribute("data-state", "loaded");
    } finally {
      complete.mockRestore();
      width.mockRestore();
    }
  });
  test("forwards frame ref and crop choices", () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(
      <Image
        ref={ref}
        alt="Poster"
        ratio="portrait"
        fit="contain"
        position="top"
        className="custom"
        classNames={{ fallback: "placeholder" }}
      />,
    );
    expect(ref.current).toHaveClass("kb-image", "custom");
    expect(ref.current).toHaveAttribute("data-ratio", "portrait");
    expect(ref.current).toHaveAttribute("data-fit", "contain");
    expect(container.querySelector(".kb-image-fallback")).toHaveClass("placeholder");
  });
});

function requiredImage(container: HTMLElement): HTMLImageElement {
  const image = container.querySelector("img");
  if (!image) throw new Error("Expected a native image request");
  return image;
}
