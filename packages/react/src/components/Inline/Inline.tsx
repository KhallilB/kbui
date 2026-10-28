import { createElement } from "react";
import { kb } from "../../utils/kb";
import type { LayoutAlign, LayoutElementProps, LayoutGap } from "../../utils/layout";

export type InlineElement = "div" | "ul" | "ol" | "nav";
export type InlineJustify = "start" | "center" | "end" | "between";
export type InlineProps<T extends InlineElement = "div"> = LayoutElementProps<T> & {
  /** Space between items and wrapped rows. */
  gap?: LayoutGap;
  /** Cross-axis alignment within each row. */
  align?: LayoutAlign;
  /** Main-axis distribution within each row. */
  justify?: InlineJustify;
};

export function Inline<T extends InlineElement = "div">({
  as,
  gap = "md",
  align = "center",
  justify = "start",
  className,
  ...props
}: InlineProps<T>) {
  return createElement(as ?? "div", {
    ...props,
    ...kb("inline", { gap, align, justify }, className),
  });
}
