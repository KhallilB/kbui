import type { ComponentProps } from "react";
import { kb } from "../../utils/kb";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

/** Static metadata label; use Status for a state that changes. */
export type BadgeProps = ComponentProps<"span"> & {
  /** Ink and tint. */
  tone?: BadgeTone;
  /** Small uppercase monospace, for identifiers and roles. */
  mono?: boolean;
};

export function Badge({ tone = "neutral", mono = false, className, ...props }: BadgeProps) {
  return <span {...props} {...kb("badge", { tone, mono }, className)} />;
}
