import { Progress as Base } from "@base-ui/react/progress";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { type ClassNames, kb } from "../../utils/kb";

/** Determinate progress with a visible label; valueText replaces the percent, e.g. "3 of 5". */
export type ProgressProps = Omit<Base.Root.Props, "className" | "children" | "value"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
  /** Visible name of the progressbar. */
  label: ReactNode;
  /** Current value, from 0 to max. */
  value: number;
  /** Shown beside the label and announced instead of the percent. */
  valueText?: string;
  /** Classes for inner parts, keyed by part. */
  classNames?: ClassNames<"head" | "label" | "value" | "track" | "indicator">;
};

export function Progress({
  classNames,
  label,
  value,
  valueText,
  className,
  ...props
}: ProgressProps) {
  return (
    <Base.Root
      {...props}
      value={value}
      {...(valueText ? { getAriaValueText: () => valueText } : {})}
      {...kb("progress", {}, className)}
    >
      <div className={clsx("kb-progress-head", classNames?.head)}>
        <Base.Label className={clsx("kb-progress-label", classNames?.label)}>{label}</Base.Label>
        <Base.Value className={clsx("kb-progress-value", classNames?.value)}>
          {(formatted) => valueText ?? formatted}
        </Base.Value>
      </div>
      <Base.Track className={clsx("kb-progress-track", classNames?.track)}>
        <Base.Indicator className={clsx("kb-progress-indicator", classNames?.indicator)} />
      </Base.Track>
    </Base.Root>
  );
}
