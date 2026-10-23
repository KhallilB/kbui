import { Progress as Base } from "@base-ui/react/progress";
import type { ReactNode } from "react";
import { kb } from "../../utils/kb";

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
};

export function Progress({ label, value, valueText, className, ...props }: ProgressProps) {
  return (
    <Base.Root
      {...props}
      value={value}
      {...(valueText ? { getAriaValueText: () => valueText } : {})}
      {...kb("progress", {}, className)}
    >
      <div className="kb-progress-head">
        <Base.Label className="kb-progress-label">{label}</Base.Label>
        <Base.Value className="kb-progress-value">
          {(formatted) => valueText ?? formatted}
        </Base.Value>
      </div>
      <Base.Track className="kb-progress-track">
        <Base.Indicator className="kb-progress-indicator" />
      </Base.Track>
    </Base.Root>
  );
}
