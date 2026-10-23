import { type ComponentProps, createElement } from "react";
import { kb } from "../../utils/kb";

type Container = "div" | "ul" | "ol";
export type GridProps<T extends Container = "div"> = ComponentProps<T> & {
  /** Native container; list children must be list items. */
  as?: T;
  /** Responsive equal columns or a single vertical track. */
  layout?: "auto" | "stack";
};

export function Grid<T extends Container = "div">({
  as,
  layout = "auto",
  className,
  ...props
}: GridProps<T>) {
  return createElement(as ?? "div", { ...props, ...kb("grid", { layout }, className) });
}
