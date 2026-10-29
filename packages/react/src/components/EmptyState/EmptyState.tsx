import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type EmptyStateSize = "sm" | "md" | "lg";
export type EmptyStateVariant = "surface" | "subtle" | "plain";
export type EmptyStateTone = "neutral" | "info" | "warning" | "danger";
export type EmptyStateHeadingLevel = 2 | 3 | 4;

export type EmptyStateProps = Omit<ComponentProps<"div">, "title"> & {
  /** Primary heading explaining why the region is empty or unavailable. */
  title: ReactNode;
  /** Supporting guidance explaining what appears here or how to proceed. */
  description?: ReactNode;
  /** Short category or state label above the title. */
  eyebrow?: ReactNode;
  /** Decorative glyph or emblem rendered above the header. */
  icon?: ReactNode;
  /** Primary and secondary recovery or creation controls. */
  actions?: ReactNode;
  /** Quiet metadata or secondary link below the actions. */
  footer?: ReactNode;
  /** Document outline rank for the title heading (`2`–`4`). */
  headingLevel?: EmptyStateHeadingLevel;
  size?: EmptyStateSize;
  variant?: EmptyStateVariant;
  tone?: EmptyStateTone;
  /** Announces dynamic empty or recoverable failure updates via `role="status"`. */
  live?: boolean;
  classNames?: ClassNames<
    "icon" | "header" | "eyebrow" | "title" | "description" | "body" | "actions" | "footer"
  >;
};

const headingTags = {
  2: "h2",
  3: "h3",
  4: "h4",
} as const;

/** Structured placeholder for empty collections, zero-match filters, and recoverable section errors. */
export function EmptyState({
  title,
  description,
  eyebrow,
  icon,
  actions,
  footer,
  headingLevel = 3,
  size = "md",
  variant = "surface",
  tone = "neutral",
  live = false,
  className,
  classNames,
  children,
  ...rest
}: EmptyStateProps) {
  const HeadingTag = headingTags[headingLevel];

  return (
    <div
      {...rest}
      {...(live ? { role: "status" } : {})}
      {...kb("emptystate", { size, variant, tone }, className)}
    >
      {icon != null ? (
        <span className={clsx("kb-emptystate-icon", classNames?.icon)} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className={clsx("kb-emptystate-header", classNames?.header)}>
        {eyebrow != null ? (
          <p className={clsx("kb-emptystate-eyebrow", classNames?.eyebrow)}>{eyebrow}</p>
        ) : null}
        <HeadingTag className={clsx("kb-emptystate-title", classNames?.title)}>{title}</HeadingTag>
        {description != null ? (
          <p className={clsx("kb-emptystate-description", classNames?.description)}>
            {description}
          </p>
        ) : null}
      </div>
      {children != null ? (
        <div className={clsx("kb-emptystate-body", classNames?.body)}>{children}</div>
      ) : null}
      {actions != null ? (
        <div className={clsx("kb-emptystate-actions", classNames?.actions)}>{actions}</div>
      ) : null}
      {footer != null ? (
        <div className={clsx("kb-emptystate-footer", classNames?.footer)}>{footer}</div>
      ) : null}
    </div>
  );
}
