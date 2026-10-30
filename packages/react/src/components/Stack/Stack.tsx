import { createElement } from "react";
import { kb } from "../../utils/kb";
import type { LayoutElementProps, LayoutGap } from "../../utils/layout";

export type StackElement = "div" | "section" | "article" | "aside" | "ul" | "ol" | "nav" | "form";
export type StackAlign = "start" | "center" | "end" | "stretch";
export type StackJustify = "start" | "center" | "end" | "between";
export type StackProps<T extends StackElement = "div"> = LayoutElementProps<T> & {
  /** Space between stacked items. */
  gap?: LayoutGap;
  /** Inline-axis alignment; stretch fills the stack width. */
  align?: StackAlign;
  /** Block-axis distribution when the stack is taller than its content. */
  justify?: StackJustify;
};

export function Stack<T extends StackElement = "div">({
  as,
  gap = "md",
  align = "stretch",
  justify = "start",
  className,
  ...props
}: StackProps<T>) {
  return createElement(as ?? "div", {
    ...props,
    ...kb("stack", { gap, align, justify }, className),
  });
}
