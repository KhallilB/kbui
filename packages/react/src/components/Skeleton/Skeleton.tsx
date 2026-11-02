import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  forwardRef,
  type ReactNode,
} from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type SkeletonVariant = "text" | "rect" | "circle" | "pill" | "auto";
export type SkeletonSize = "sm" | "md" | "lg";
export type SkeletonAnimation = "shimmer" | "pulse" | "wave" | "none";
export type SkeletonTone = "default" | "subtle" | "accent";
export type SkeletonPart = "root" | "line" | "content" | "status";

export interface SkeletonProps extends ComponentPropsWithoutRef<"div"> {
  /** Shape preset; `auto` shapes placeholders from kbui children, falling back to `text` without them. */
  variant?: SkeletonVariant | undefined;
  /** Size preset controlling line height or avatar diameter. */
  size?: SkeletonSize | undefined;
  /** Number of stacked placeholder lines when `variant="text"`. */
  lines?: number | undefined;
  /** Enable motion on placeholder shapes; set `false` for static placeholders. */
  animated?: boolean | undefined;
  /** Motion: `shimmer` sweep, `pulse` fade, `wave` staggered fade, or `none`. */
  animation?: SkeletonAnimation | undefined;
  /** Surface color: `default`, `subtle` recessed, or `accent` tinted. */
  tone?: SkeletonTone | undefined;
  /** Whether content is still loading; when `false`, renders `children` inside `.kb-skeleton-content`. */
  loading?: boolean | undefined;
  /** Loading status announced by `variant="auto"`. */
  label?: string | undefined;
  /** Optional explicit inline size (`px` number or CSS length string). */
  width?: number | string | undefined;
  /** Optional explicit block size (`px` number or CSS length string). */
  height?: number | string | undefined;
  /** Loaded content; `variant="auto"` also renders it inert as the placeholder layout. */
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
    label = "Loading",
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
  const derived = variant === "auto" && children != null && typeof children !== "boolean";
  const shape = variant === "auto" && !derived ? "text" : variant;
  const placeholder = loading && !derived;
  const busy = loading && derived;
  const count = shape === "text" ? Math.max(1, Math.trunc(lines)) : 1;
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
      aria-hidden={placeholder ? "true" : undefined}
      aria-busy={busy ? "true" : undefined}
      style={rootStyle}
      {...props}
      {...kb(
        "skeleton",
        {
          variant: shape,
          size,
          tone,
          animation: isAnimated ? animation : false,
          animated: isAnimated,
          loaded: !loading,
        },
        classNames?.root ?? className,
      )}
    >
      {placeholder ? (
        lineIndices.map((lineNumber) => (
          <span
            key={`line-${lineNumber}`}
            style={lineStyle}
            className={clsx("kb-skeleton-line", classNames?.line)}
          />
        ))
      ) : (
        <div
          className={clsx("kb-skeleton-content", classNames?.content)}
          inert={busy}
          aria-hidden={busy ? "true" : undefined}
        >
          {children}
        </div>
      )}
      {busy ? (
        <span role="status" className={clsx("kb-sr-only", classNames?.status)}>
          {label}
        </span>
      ) : null}
    </div>
  );
});
