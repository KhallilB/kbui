import { type ComponentProps, createElement } from "react";
import { kb } from "../../utils/kb";

type Container = "article" | "div" | "li";
export type CardProps<T extends Container = "article"> = ComponentProps<T> & {
  /** Semantic container; links and controls stay caller-owned. */
  as?: T;
  /** Outlined surface or unstyled list content. */
  appearance?: "outlined" | "plain";
};

export function Card<T extends Container = "article">({
  as,
  appearance = "outlined",
  className,
  ...props
}: CardProps<T>) {
  return createElement(as ?? "article", { ...props, ...kb("card", { appearance }, className) });
}
