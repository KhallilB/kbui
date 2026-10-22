import type { ComponentProps, ReactNode } from "react";
import { kb } from "../../utils/kb";

export type StatusTone = "neutral" | "info" | "running" | "success" | "warning" | "blocked";

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
  /** Tighter spacing and smaller text; the text stays visible. */
  compact?: boolean;
};

export function Status({
  tone = "neutral",
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
      {...kb("status", { tone, compact }, className)}
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
