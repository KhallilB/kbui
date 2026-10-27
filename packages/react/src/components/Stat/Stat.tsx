import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type StatSize = "md" | "display";

/** A labelled value; the label renders first so it is read first. */
export type StatProps = Omit<ComponentProps<"div">, "children"> & {
  /** What the value measures. */
  label: ReactNode;
  /** The number or short text; figures are tabular. */
  value: ReactNode;
  /** Value size; display is for one headline number. */
  size?: StatSize;
  /** Classes for inner parts, keyed by part. */
  classNames?: ClassNames<"label" | "value">;
};

export function Stat({ classNames, label, value, size = "md", className, ...props }: StatProps) {
  return (
    <div {...props} {...kb("stat", { size }, className)}>
      <span className={clsx("kb-stat-label", classNames?.label)}>{label}</span>
      <span className={clsx("kb-stat-value", classNames?.value)}>{value}</span>
    </div>
  );
}
