import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
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

export type SpinnerProps = Omit<ComponentProps<"span">, "children"> & {
  /** Accessible status label announced by assistive technology; defaults to `"Loading"`. */
  label?: ReactNode;
  /** Renders the label visibly beside the indicator instead of screen-reader-only. */
  showLabel?: boolean;
  /** Hides the indicator from assistive tech when an ancestor control already announces busy state. */
  decorative?: boolean;
  size?: SpinnerSize;
  tone?: SpinnerTone;
  classNames?: ClassNames<"icon" | "track" | "arc" | "label">;
};

/** Indeterminate activity indicator for short waits and busy controls. */
export function Spinner({
  label = "Loading",
  showLabel = false,
  decorative = false,
  size = "md",
  tone = "accent",
  className,
  classNames,
  "aria-hidden": ariaHidden,
  role,
  ...rest
}: SpinnerProps) {
  const isDecorative = decorative || ariaHidden === true || ariaHidden === "true";

  return (
    <span
      {...rest}
      role={isDecorative ? undefined : (role ?? "status")}
      aria-hidden={isDecorative ? "true" : ariaHidden}
      {...kb("spinner", { size, tone, "show-label": showLabel }, className)}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        className={clsx("kb-spinner-icon", classNames?.icon)}
      >
        <circle className={clsx("kb-spinner-track", classNames?.track)} cx="12" cy="12" r="9.5" />
        <path
          className={clsx("kb-spinner-arc", classNames?.arc)}
          d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5"
        />
      </svg>
      {showLabel ? (
        <span className={clsx("kb-spinner-label", classNames?.label)}>{label}</span>
      ) : !isDecorative ? (
        <span className={clsx("kb-spinner-label", "kb-sr-only", classNames?.label)}>{label}</span>
      ) : null}
    </span>
  );
}
