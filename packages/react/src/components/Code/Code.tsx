import type { ComponentProps } from "react";
import { kb } from "../../utils/kb";

export type CodeProps = ComponentProps<"code">;

export function Code({ className, ...props }: CodeProps) {
  return <code {...props} {...kb("code", {}, className)} />;
}
