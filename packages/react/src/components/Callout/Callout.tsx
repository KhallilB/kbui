import type { ComponentProps, ReactNode } from "react";
import { kb } from "../../utils/kb";

export type CalloutTone = "neutral" | "info" | "success" | "warning" | "danger";

/** Inline message with optional actions; text carries the meaning, tone only reinforces it. */
export type CalloutProps = Omit<ComponentProps<"div">, "title"> & {
  /** Ink of the edge, tint and icon. */
  tone?: CalloutTone;
  /** Short heading line. */
  title?: ReactNode;
  /** Caller-provided decorative icon. */
  icon?: ReactNode;
  /** Buttons that resolve the message. */
  actions?: ReactNode;
  /** Announce changes: adds role="status" and nothing else. */
  live?: boolean;
};

export function Callout({
  tone = "neutral",
  title,
  icon,
  actions,
  live = false,
  className,
  children,
  ...props
}: CalloutProps) {
  return (
    <div {...props} {...(live ? { role: "status" } : {})} {...kb("callout", { tone }, className)}>
      {icon != null ? (
        <span className="kb-callout-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className="kb-callout-content">
        {title != null ? <div className="kb-callout-title">{title}</div> : null}
        <div className="kb-callout-body">{children}</div>
        {actions != null ? <div className="kb-callout-actions">{actions}</div> : null}
      </div>
    </div>
  );
}
