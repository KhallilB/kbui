import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  forwardRef,
  type ReactNode,
} from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type SkeletonVariant = "text" | "rect" | "circle" | "pill";
export type SkeletonSize = "sm" | "md" | "lg";
export type SkeletonAnimation = "shimmer" | "pulse" | "wave" | "none";
export type SkeletonTone = "default" | "subtle" | "accent";
export type SkeletonPart = "root" | "line" | "content";

export interface SkeletonProps extends ComponentPropsWithoutRef<"div"> {
  /** Shape preset for the placeholder geometry. */
  variant?: SkeletonVariant | undefined;
  /** Size preset controlling line height or avatar diameter. */
  size?: SkeletonSize | undefined;
  /** Number of stacked placeholder lines when `variant="text"`. */
  lines?: number | undefined;
  /** Enable motion on placeholder shapes; set `false` for static placeholders. */
  animated?: boolean | undefined;
  /** Motion choreography (`shimmer` diagonal sweep, `pulse` breathing opacity, `wave` staggered cascade, or `none`). */
  animation?: SkeletonAnimation | undefined;
  /** Surface color treatment (`default` surface, `subtle` recessed tint, or `accent` warm synthesis tint). */
  tone?: SkeletonTone | undefined;
  /** Whether content is still loading; when `false`, renders `children` inside `.kb-skeleton-content`. */
  loading?: boolean | undefined;
  /** Optional explicit inline size (`px` number or CSS length string). */
  width?: number | string | undefined;
  /** Optional explicit block size (`px` number or CSS length string). */
  height?: number | string | undefined;
  /** Loaded content revealed when `loading` is `false`. */
  children?: ReactNode | undefined;
  /** Custom class names for internal component slots. */
  classNames?: ClassNames<SkeletonPart> | undefined;
}

function toDimension(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  {
    variant = "text",
    size = "md",
    lines = 1,
    animated = true,
    animation = "shimmer",
    tone = "default",
    loading = true,
    width,
    height,
    style,
    className,
    classNames,
    children,
    ...props
  },
  ref,
) {
  const count = variant === "text" ? Math.max(1, Math.trunc(lines)) : 1;
  const inlineSize = toDimension(width);
  const blockSize = toDimension(height);
  const isAnimated = animated && animation !== "none";
  const rootStyle: CSSProperties | undefined =
    inlineSize !== undefined ? { ...style, inlineSize } : style;
  const lineStyle: CSSProperties | undefined = blockSize !== undefined ? { blockSize } : undefined;
  const lineIndices = Array.from({ length: count }, (_, idx) => idx);

  return (
    <div
      ref={ref}
      aria-hidden={loading ? "true" : undefined}
      style={rootStyle}
      {...props}
      {...kb(
        "skeleton",
        {
          variant,
          size,
          tone,
          animation: isAnimated ? animation : false,
          animated: isAnimated,
          loaded: !loading,
        },
        classNames?.root ?? className,
      )}
    >
      {loading ? (
        lineIndices.map((lineNumber) => (
          <span
            key={`line-${lineNumber}`}
            style={lineStyle}
            className={clsx("kb-skeleton-line", classNames?.line)}
          />
        ))
      ) : (
        <div className={clsx("kb-skeleton-content", classNames?.content)}>{children}</div>
      )}
    </div>
  );
});
