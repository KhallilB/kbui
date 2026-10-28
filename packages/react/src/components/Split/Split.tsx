import { clsx } from "clsx";
import { Children, createElement } from "react";
import { type ClassNames, kb } from "../../utils/kb";
import type { LayoutAlign, LayoutElementProps, LayoutGap } from "../../utils/layout";

export type SplitElement = "div" | "section" | "article";
export type SplitRatio = "equal" | "wide-start" | "wide-end";
export type SplitCollapse = "sm" | "md" | "lg";
export type SplitProps<T extends SplitElement = "div"> = LayoutElementProps<T> & {
  /** Classes for each layout-owned column track. */
  classNames?: ClassNames<"track">;
  /** Column proportions: 1:1, 2:1 or 1:2 in source order. */
  ratio?: SplitRatio;
  /** Available-width threshold below which columns stack. */
  collapse?: SplitCollapse;
  /** Space between columns or stacked rows. */
  gap?: LayoutGap;
  /** Cross-axis alignment while columns share a row. */
  align?: LayoutAlign;
};

export function Split<T extends SplitElement = "div">({
  as,
  ratio = "equal",
  collapse = "md",
  gap = "md",
  align = "stretch",
  className,
  classNames,
  children,
  ...props
}: SplitProps<T>) {
  const trackClassName = clsx("kb-split-track", classNames?.track);
  return createElement(
    as ?? "div",
    { ...props, ...kb("split", { ratio, collapse, gap, align }, className) },
    Children.map(children, (child) =>
      child == null ? null : <div className={trackClassName}>{child}</div>,
    ),
  );
}
