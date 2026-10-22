import type { ComponentProps, ReactNode } from "react";
import { kb } from "../../utils/kb";

export type StatusTone = "neutral" | "info" | "running" | "success" | "warning" | "blocked";
export type StatusAppearance = "plain" | "chip";

/** Text is mandatory: tone is never conveyed by color alone. */
export type StatusProps = Omit<ComponentProps<"span">, "children"> & {
  /** Visible label. */
  children: ReactNode;
  /** Meaning of the state; drives color and the icon slot's color. */
  tone?: StatusTone;
  /** Caller-provided decorative icon; kbui ships no icons. */
  icon?: ReactNode;
  /** Announce changes: adds role="status" and nothing else. */
  live?: boolean;
  /** Plain text and icon, or a chip tinted from the tone. */
  appearance?: StatusAppearance;
  /** Tighter spacing and smaller text; the text stays visible. */
  compact?: boolean;
};

export function Status({
  tone = "neutral",
  appearance = "plain",
  icon,
  live = false,
  compact = false,
  className,
  children,
  ...props
}: StatusProps) {
  return (
    <span
      {...props}
      {...(live ? { role: "status" } : {})}
      {...kb("status", { tone, appearance, compact }, className)}
    >
      {icon != null ? (
        <span className="kb-status-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="kb-status-text">{children}</span>
    </span>
  );
}
