import type { ComponentProps } from "react";
import { kb } from "../../utils/kb";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";
export type BadgeAppearance = "chip" | "plain";

/** Static metadata label; use Status for a state that changes. */
export type BadgeProps = ComponentProps<"span"> & {
  /** Ink and tint. */
  tone?: BadgeTone;
  /** Chip draws a tinted ring; plain is inline text. */
  appearance?: BadgeAppearance;
  /** Small uppercase monospace, for identifiers and roles. */
  mono?: boolean;
};

export function Badge({
  tone = "neutral",
  appearance = "chip",
  mono = false,
  className,
  ...props
}: BadgeProps) {
  return <span {...props} {...kb("badge", { tone, appearance, mono }, className)} />;
}
