// x-release-please-start-version
// kbui recipe PageHeader · from kbui 0.11.0 · https://kbui.kcb.pro/recipes/?recipe=pageheader
// x-release-please-end
import { Heading, type HeadingLevel, Inline, Text } from "@kb.ui/react";
import type { ComponentProps, ReactNode } from "react";
import "./recipes.css";

export type PageHeaderProps = Omit<ComponentProps<"header">, "title" | "children"> & {
  /** Visible page or region title. */
  title: string;
  /** Heading rank follows document outline. */
  level?: HeadingLevel | undefined;
  /** Supporting prose; omit when title is sufficient. */
  description?: ReactNode;
  /** Caller-owned status, ownership, timestamps or breadcrumbs. */
  metadata?: ReactNode;
  /** Inline for independent actions; Toolbar for coordinated actions. */
  actions?: ReactNode;
};

export function PageHeader({
  title,
  level = 1,
  description,
  metadata,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header {...props} className={["page-header", className].filter(Boolean).join(" ")}>
      <Inline align="start" justify="between" gap="lg">
        <div className="page-header-copy">
          <Heading level={level}>{title}</Heading>
          {description ? (
            <Text className="page-header-description" tone="muted">
              {description}
            </Text>
          ) : null}
          {metadata ? <div className="page-header-metadata">{metadata}</div> : null}
        </div>
        {actions ? <div className="page-header-actions">{actions}</div> : null}
      </Inline>
    </header>
  );
}
