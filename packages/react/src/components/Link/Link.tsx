import type { ComponentProps } from "react";
import { kb } from "../../utils/kb";

export type LinkProps = ComponentProps<"a"> & {
  /** Navigation destination; use Button for actions. */
  href: string;
};

export function Link({ className, ...props }: LinkProps) {
  return <a {...props} {...kb("link", {}, className)} />;
}
