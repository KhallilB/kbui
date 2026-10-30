import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type SpinnerSize = "sm" | "md" | "lg";
export type SpinnerTone =
  | "current"
  | "accent"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";
export type SpinnerVariant = "ring" | "orbit" | "dots" | "bars";
export type SpinnerAppearance = "plain" | "pill";
export type SpinnerPart = "root" | "icon" | "track" | "arc" | "core" | "dot" | "bar" | "label";

export interface SpinnerProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /** Accessible status label announced by assistive technology and optionally shown beside the indicator. */
  label?: string | undefined;
  /** Render the label visibly beside the spinner instead of visually hidden. */
  showLabel?: boolean | undefined;
  /** Mark spinner as purely decorative (`aria-hidden="true"`, no status role) when a parent control already owns busy semantics. */
  decorative?: boolean | undefined;
  /** Visual size token preset. */
  size?: SpinnerSize | undefined;
  /** Semantic color tone; use `current` inside buttons or badges to inherit text color. */
  tone?: SpinnerTone | undefined;
  /** Indicator geometry and motion style. */
  variant?: SpinnerVariant | undefined;
  /** Container framing; `pill` wraps the indicator and label in a tinted status pill. */
  appearance?: SpinnerAppearance | undefined;
  /** Custom class names for internal component slots. */
  classNames?: ClassNames<SpinnerPart> | undefined;
}

const DOT_CX = [5, 12, 19] as const;
const BAR_X = [3.5, 8.25, 13, 17.75] as const;

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  {
    label = "Loading",
    showLabel = false,
    decorative = false,
    size = "md",
    tone = "accent",
    variant = "ring",
    appearance = "plain",
    className,
    classNames,
    ...props
  },
  ref,
) {
  return (
    <span
      ref={ref}
      role={decorative ? undefined : "status"}
      aria-live={decorative ? undefined : "polite"}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
      {...kb(
        "spinner",
        { size, tone, variant, appearance, "show-label": showLabel },
        classNames?.root ?? className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        className={clsx("kb-spinner-icon", classNames?.icon)}
      >
        {variant === "ring" && (
          <>
            <circle
              cx="12"
              cy="12"
              r="9.5"
              className={clsx("kb-spinner-track", classNames?.track)}
            />
            <path
              d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5"
              className={clsx("kb-spinner-arc", classNames?.arc)}
            />
          </>
        )}
        {variant === "orbit" && (
          <>
            <circle
              cx="12"
              cy="12"
              r="9.5"
              className={clsx("kb-spinner-track", classNames?.track)}
            />
            <circle
              cx="12"
              cy="12"
              r="5.5"
              className={clsx("kb-spinner-track", classNames?.track)}
            />
            <path
              d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5"
              className={clsx("kb-spinner-arc", classNames?.arc)}
            />
            <path
              d="M12 17.5a5.5 5.5 0 0 1 -5.5 -5.5"
              className={clsx("kb-spinner-arc", classNames?.arc)}
            />
            <circle
              cx="12"
              cy="12"
              r="1.75"
              className={clsx("kb-spinner-core", classNames?.core)}
            />
          </>
        )}
        {variant === "dots" &&
          DOT_CX.map((cxPos) => (
            <circle
              key={cxPos}
              cx={cxPos}
              cy="12"
              r="2.25"
              className={clsx("kb-spinner-dot", classNames?.dot)}
            />
          ))}
        {variant === "bars" &&
          BAR_X.map((xPos) => (
            <rect
              key={xPos}
              x={xPos}
              y="5"
              width="2.5"
              height="14"
              rx="1.25"
              className={clsx("kb-spinner-bar", classNames?.bar)}
            />
          ))}
      </svg>
      {!decorative && (
        <span className={clsx("kb-spinner-label", !showLabel && "kb-sr-only", classNames?.label)}>
          {label}
        </span>
      )}
    </span>
  );
});
