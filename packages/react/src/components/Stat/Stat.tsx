import type { ComponentProps, ReactNode } from "react";
import { kb } from "../../utils/kb";

export type StatSize = "md" | "display";

/** A labelled value; the label renders first so it is read first. */
export type StatProps = Omit<ComponentProps<"div">, "children"> & {
  /** What the value measures. */
  label: ReactNode;
  /** The number or short text; figures are tabular. */
  value: ReactNode;
  /** Value size; display is for one headline number. */
  size?: StatSize;
};

export function Stat({ label, value, size = "md", className, ...props }: StatProps) {
  return (
    <div {...props} {...kb("stat", { size }, className)}>
      <span className="kb-stat-label">{label}</span>
      <span className="kb-stat-value">{value}</span>
    </div>
  );
}
