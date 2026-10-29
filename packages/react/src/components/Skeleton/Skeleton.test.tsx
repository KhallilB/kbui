import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import {
  Skeleton,
  type SkeletonAnimation,
  type SkeletonSize,
  type SkeletonTone,
  type SkeletonVariant,
} from "./Skeleton";

const variants: SkeletonVariant[] = ["text", "rect", "circle", "pill"];
const sizes: SkeletonSize[] = ["sm", "md", "lg"];
const animations: Exclude<SkeletonAnimation, "none">[] = ["shimmer", "pulse", "wave"];
const tones: SkeletonTone[] = ["default", "subtle", "accent"];

describe("Skeleton", () => {
  test("renders decorative animated text placeholder by default and forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Skeleton ref={ref} />);
    const root = container.querySelector(".kb-skeleton");
    expect(ref.current).toBe(root);
    expect(root).toHaveAttribute("data-variant", "text");
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).toHaveAttribute("data-tone", "default");
    expect(root).toHaveAttribute("data-animation", "shimmer");
    expect(root).toHaveAttribute("data-animated", "");
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".kb-skeleton-line")).toHaveLength(1);
  });

  test("renders multiple lines when lines > 1", () => {
    const { container } = render(<Skeleton lines={3} />);
    expect(container.querySelectorAll(".kb-skeleton-line")).toHaveLength(3);
  });

  test.each(variants)("applies data-variant=%s", (variant) => {
    const { container } = render(<Skeleton variant={variant} />);
    expect(container.querySelector(".kb-skeleton")).toHaveAttribute("data-variant", variant);
  });

  test.each(sizes)("applies data-size=%s", (size) => {
    const { container } = render(<Skeleton size={size} />);
    expect(container.querySelector(".kb-skeleton")).toHaveAttribute("data-size", size);
  });

  test.each(animations)("applies data-animation=%s when animated", (animation) => {
    const { container } = render(<Skeleton animation={animation} />);
    const root = container.querySelector(".kb-skeleton");
    expect(root).toHaveAttribute("data-animation", animation);
    expect(root).toHaveAttribute("data-animated", "");
  });

  test.each(tones)("applies data-tone=%s", (tone) => {
    const { container } = render(<Skeleton tone={tone} />);
    expect(container.querySelector(".kb-skeleton")).toHaveAttribute("data-tone", tone);
  });

  test("omits data-animated when animated is false or animation is none", () => {
    const { container, rerender } = render(<Skeleton animated={false} />);
    expect(container.querySelector(".kb-skeleton")).not.toHaveAttribute("data-animated");
    expect(container.querySelector(".kb-skeleton")).not.toHaveAttribute("data-animation");

    rerender(<Skeleton animation="none" />);
    expect(container.querySelector(".kb-skeleton")).not.toHaveAttribute("data-animated");
    expect(container.querySelector(".kb-skeleton")).not.toHaveAttribute("data-animation");
  });

  test("applies custom width and height dimensions to placeholder geometry", () => {
    const { container } = render(<Skeleton variant="rect" width="14rem" height={96} />);
    const root = container.querySelector<HTMLElement>(".kb-skeleton");
    const line = container.querySelector<HTMLElement>(".kb-skeleton-line");
    expect(root?.style.inlineSize).toBe("14rem");
    expect(line?.style.blockSize).toBe("96px");
  });

  test("reveals loaded children and removes aria-hidden when loading is false", () => {
    const { container, rerender } = render(
      <Skeleton loading>
        <p>Loaded summary</p>
      </Skeleton>,
    );
    expect(screen.queryByText("Loaded summary")).toBeNull();
    expect(container.querySelector(".kb-skeleton")).toHaveAttribute("aria-hidden", "true");

    rerender(
      <Skeleton loading={false}>
        <p>Loaded summary</p>
      </Skeleton>,
    );
    const root = container.querySelector(".kb-skeleton");
    expect(root).toHaveAttribute("data-loaded", "");
    expect(root).not.toHaveAttribute("aria-hidden");
    expect(container.querySelector(".kb-skeleton-line")).toBeNull();
    expect(screen.getByText("Loaded summary").closest(".kb-skeleton-content")).not.toBeNull();
  });

  test("forwards classNames to line and content slots", () => {
    const { container, rerender } = render(
      <Skeleton classNames={{ line: "slot-line", content: "slot-content" }}>
        <span>Ready</span>
      </Skeleton>,
    );
    expect(container.querySelector(".kb-skeleton-line")).toHaveClass("slot-line");
    rerender(
      <Skeleton loading={false} classNames={{ line: "slot-line", content: "slot-content" }}>
        <span>Ready</span>
      </Skeleton>,
    );
    expect(container.querySelector(".kb-skeleton-content")).toHaveClass("slot-content");
  });
});
