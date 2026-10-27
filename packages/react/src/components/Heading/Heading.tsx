import { type ComponentProps, createElement } from "react";
import { kb } from "../../utils/kb";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "sm" | "md" | "lg" | "xl" | "display";
export type HeadingProps = ComponentProps<"h2"> & {
  /** Native heading rank; follow document hierarchy. */
  level?: HeadingLevel;
  /** Visual size, independent of rank; defaults from level. */
  size?: HeadingSize;
};

const sizes: Record<HeadingLevel, HeadingSize> = {
  1: "xl",
  2: "lg",
  3: "md",
  4: "sm",
  5: "sm",
  6: "sm",
};

export function Heading({ level = 2, size = sizes[level], className, ...props }: HeadingProps) {
  return createElement(`h${level}`, { ...props, ...kb("heading", { size }, className) });
}
