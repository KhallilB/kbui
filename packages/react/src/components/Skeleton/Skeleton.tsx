import { clsx } from "clsx";
import type { ComponentProps, CSSProperties } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type SkeletonVariant = "text" | "rect" | "circle" | "pill";
export type SkeletonSize = "sm" | "md" | "lg";

export type SkeletonProps = ComponentProps<"div"> & {
  /** Shape archetype matching incoming content geometry. */
  variant?: SkeletonVariant;
  size?: SkeletonSize;
  /** Number of stacked text lines when `variant="text"`. */
  lines?: number;
  /** Optional explicit inline size (`px` number or CSS length). */
  width?: number | string;
  /** Optional explicit block size (`px` number or CSS length). */
  height?: number | string;
  /** Enables the shimmer sweep; disabled automatically under `prefers-reduced-motion`. */
  animated?: boolean;
  /** Renders placeholder geometry when `true`, or `children` inside `.kb-skeleton-content` when `false`. */
  loading?: boolean;
  classNames?: ClassNames<"line" | "content">;
};

const toCssSize = (value?: number | string): string | undefined =>
  typeof value === "number" ? `${value}px` : value;

/** Decorative placeholder geometry that preserves layout while content loads. */
export function Skeleton({
  variant = "text",
  size = "md",
  lines = 1,
  width,
  height,
  animated = true,
  loading = true,
  style,
  className,
  classNames,
  "aria-hidden": ariaHidden,
  children,
  ...rest
}: SkeletonProps) {
  const inlineSize = toCssSize(width);
  const blockSize = toCssSize(height);
  const rootStyle: CSSProperties | undefined =
    inlineSize !== undefined || (variant === "circle" && blockSize !== undefined)
      ? {
          ...style,
          ...(inlineSize !== undefined ? { inlineSize } : {}),
          ...(variant === "circle" && blockSize !== undefined ? { blockSize } : {}),
        }
      : style;
  const lineStyle: CSSProperties | undefined = blockSize !== undefined ? { blockSize } : undefined;
  const count = variant === "text" ? Math.max(1, Math.floor(lines)) : 1;

  return (
    <div
      {...rest}
      aria-hidden={loading ? (ariaHidden ?? "true") : ariaHidden}
      style={rootStyle}
      {...kb(
        "skeleton",
        {
          variant,
          size,
          animated: loading && animated,
          loaded: !loading,
        },
        className,
      )}
    >
      {loading ? (
        Array.from({ length: count }, (_, index) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder line count
            key={index}
            style={lineStyle}
            className={clsx("kb-skeleton-line", classNames?.line)}
          />
        ))
      ) : (
        <div className={clsx("kb-skeleton-content", classNames?.content)}>{children}</div>
      )}
    </div>
  );
}
