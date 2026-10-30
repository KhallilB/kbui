import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type PageHeaderSize = "sm" | "md" | "lg";
export type PageHeaderHeadingLevel = 1 | 2 | 3;

export type PageHeaderProps = Omit<ComponentProps<"div">, "title"> & {
  /** Page title; renders as the screen's main heading. */
  title: ReactNode;
  /** One or two sentences of context below the title. */
  description?: ReactNode | undefined;
  /** Short section or object-type label above the title. */
  eyebrow?: ReactNode | undefined;
  /** Back link or breadcrumb trail above the heading. */
  navigation?: ReactNode | undefined;
  /** Status badges or metadata beside the title, outside its accessible name. */
  meta?: ReactNode | undefined;
  /** Page-level actions; end-aligned, wrapping below the heading when narrow. */
  actions?: ReactNode | undefined;
  /** Document outline rank for the title (`1`–`3`); keep `1` for a screen's own header. */
  headingLevel?: PageHeaderHeadingLevel | undefined;
  /** Title scale: `sm` for dense app shells, `lg` for landing screens. */
  size?: PageHeaderSize | undefined;
  /** Draws a rule below the header to separate it from page content. */
  divider?: boolean | undefined;
  classNames?:
    | ClassNames<
        | "navigation"
        | "main"
        | "heading"
        | "eyebrow"
        | "headline"
        | "title"
        | "meta"
        | "description"
        | "actions"
        | "body"
      >
    | undefined;
};

const headingTags = {
  1: "h1",
  2: "h2",
  3: "h3",
} as const;

/** Opening region of a screen: title, context, status and page-level actions. */
export function PageHeader({
  title,
  description,
  eyebrow,
  navigation,
  meta,
  actions,
  headingLevel = 1,
  size = "md",
  divider = false,
  className,
  classNames,
  children,
  ...rest
}: PageHeaderProps) {
  const HeadingTag = headingTags[headingLevel];

  return (
    <div {...rest} {...kb("pageheader", { size, divider }, className)}>
      {navigation != null ? (
        <div className={clsx("kb-pageheader-navigation", classNames?.navigation)}>{navigation}</div>
      ) : null}
      <div className={clsx("kb-pageheader-main", classNames?.main)}>
        <div className={clsx("kb-pageheader-heading", classNames?.heading)}>
          {eyebrow != null ? (
            <p className={clsx("kb-pageheader-eyebrow", classNames?.eyebrow)}>{eyebrow}</p>
          ) : null}
          <div className={clsx("kb-pageheader-headline", classNames?.headline)}>
            <HeadingTag className={clsx("kb-pageheader-title", classNames?.title)}>
              {title}
            </HeadingTag>
            {meta != null ? (
              <div className={clsx("kb-pageheader-meta", classNames?.meta)}>{meta}</div>
            ) : null}
          </div>
          {description != null ? (
            <p className={clsx("kb-pageheader-description", classNames?.description)}>
              {description}
            </p>
          ) : null}
        </div>
        {actions != null ? (
          <div className={clsx("kb-pageheader-actions", classNames?.actions)}>{actions}</div>
        ) : null}
      </div>
      {children != null ? (
        <div className={clsx("kb-pageheader-body", classNames?.body)}>{children}</div>
      ) : null}
    </div>
  );
}
