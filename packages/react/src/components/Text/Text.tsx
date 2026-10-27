import { type ComponentProps, createElement } from "react";
import { kb } from "../../utils/kb";

export type TextElement = "p" | "span" | "div";
export type TextSize = "sm" | "md" | "lg";
export type TextTone = "default" | "muted";
export type TextProps<T extends TextElement = "p"> = ComponentProps<T> & {
  /** Native element; use span inside paragraphs and div for block children. */
  as?: T;
  /** Body size; inline links and code inherit surrounding size. */
  size?: TextSize;
  /** Default ink or secondary text with readable contrast. */
  tone?: TextTone;
};

export function Text<T extends TextElement = "p">({
  as,
  size = "md",
  tone = "default",
  className,
  ...props
}: TextProps<T>) {
  return createElement(as ?? "p", { ...props, ...kb("text", { size, tone }, className) });
}
