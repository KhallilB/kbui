import type { ComponentProps, JSX } from "react";

export type LayoutGap = "none" | "sm" | "md" | "lg";
export type LayoutAlign = "start" | "center" | "end" | "baseline" | "stretch";

export type LayoutElementProps<T extends keyof JSX.IntrinsicElements> = T extends "div"
  ? ComponentProps<T> & {
      /** Native wrapper; div is the default. */
      as?: T;
    }
  : ComponentProps<T> & {
      /** Native element; required when selecting a non-default type. */
      as: T;
    };
