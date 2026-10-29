import { type ComponentProps, createElement } from "react";
import { kb } from "../../utils/kb";
import type { LayoutAlign, LayoutGap } from "../../utils/layout";

export type GridElement = "div" | "ul" | "ol";
export type GridLayout = "auto" | "stack";
export type GridColumns = "auto" | 1 | 2 | 3 | 4;
export type GridMinItemWidth = "sm" | "md" | "lg";
export type GridProps<T extends GridElement = "div"> = ComponentProps<T> & {
  /** Native container; list children must be list items. */
  as?: T | undefined;
  /** Responsive equal columns or a single vertical track. */
  layout?: GridLayout | undefined;
  /** Explicit column count or automatic wrapping columns. */
  columns?: GridColumns | undefined;
  /** Minimum column width before automatic columns wrap. */
  minItemWidth?: GridMinItemWidth | undefined;
  /** Space between columns and stacked rows. */
  gap?: LayoutGap | undefined;
  /** Cross-axis alignment within each grid row. */
  align?: LayoutAlign | undefined;
};

export function Grid<T extends GridElement = "div">({
  as,
  layout = "auto",
  columns,
  minItemWidth,
  gap,
  align,
  className,
  ...props
}: GridProps<T>) {
  return createElement(as ?? "div", {
    ...props,
    ...kb(
      "grid",
      {
        layout,
        columns: columns === undefined ? undefined : String(columns),
        "min-item-width": minItemWidth,
        gap,
        align,
      },
      className,
    ),
  });
}
