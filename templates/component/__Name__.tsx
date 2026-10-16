import type { ComponentProps } from "react";
import { kb } from "../../utils/kb";

export type __Name__Props = ComponentProps<"div"> & {
  /** Visual variant. */
  variant?: "default";
};

export function __Name__({ variant = "default", className, ...props }: __Name__Props) {
  return <div {...props} {...kb("__name__", { variant }, className)} />;
}
