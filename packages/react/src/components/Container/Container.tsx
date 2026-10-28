import { createElement } from "react";
import { kb } from "../../utils/kb";
import type { LayoutElementProps } from "../../utils/layout";

export type ContainerElement =
  | "div"
  | "main"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer";
export type ContainerSize = "sm" | "md" | "lg" | "full";
export type ContainerProps<T extends ContainerElement = "div"> = LayoutElementProps<T> & {
  /** Maximum outer width, including gutters. */
  size?: ContainerSize;
  /** Shared responsive gutters; disable when the parent owns padding. */
  gutter?: boolean;
};

export function Container<T extends ContainerElement = "div">({
  as,
  size = "lg",
  gutter = true,
  className,
  ...props
}: ContainerProps<T>) {
  return createElement(as ?? "div", {
    ...props,
    "data-gutter": undefined,
    ...kb("container", { size, gutter: gutter ? undefined : "none" }, className),
  });
}
