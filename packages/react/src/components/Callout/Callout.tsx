import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { type ClassNames, kb } from "../../utils/kb";

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
  /** Classes for inner parts, keyed by part. */
  classNames?: ClassNames<"icon" | "content" | "title" | "body" | "actions">;
};

export function Callout({
  classNames,
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
        <span className={clsx("kb-callout-icon", classNames?.icon)} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className={clsx("kb-callout-content", classNames?.content)}>
        {title != null ? (
          <div className={clsx("kb-callout-title", classNames?.title)}>{title}</div>
        ) : null}
        <div className={clsx("kb-callout-body", classNames?.body)}>{children}</div>
        {actions != null ? (
          <div className={clsx("kb-callout-actions", classNames?.actions)}>{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
