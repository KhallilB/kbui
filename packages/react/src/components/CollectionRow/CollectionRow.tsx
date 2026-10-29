import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type CollectionRowProps = Omit<ComponentProps<"li">, "title" | "children"> & {
  /** Primary record name; compose a named link for navigation. */
  title: ReactNode;
  /** Supporting detail; rich content and zero values remain intact. */
  description?: ReactNode | undefined;
  /** Leading icon, avatar or independent selection control. */
  leading?: ReactNode | undefined;
  /** Scannable status or metadata beside the record. */
  metadata?: ReactNode | undefined;
  /** Independent named links, Buttons or Menu composition. */
  actions?: ReactNode | undefined;
  /** Visual selection; selection control supplies accessible state. */
  selected?: boolean | undefined;
  /** Classes for layout, leading, content, title, description, aside, metadata and actions. */
  classNames?:
    | ClassNames<
        | "layout"
        | "leading"
        | "content"
        | "title"
        | "description"
        | "aside"
        | "metadata"
        | "actions"
      >
    | undefined;
};
function hasSlotContent(value: ReactNode): boolean {
  return value != null && typeof value !== "boolean" && value !== "";
}

export function CollectionRow({
  title,
  description,
  leading,
  metadata,
  actions,
  selected = false,
  classNames,
  className,
  ...props
}: CollectionRowProps) {
  const aside = hasSlotContent(metadata) || hasSlotContent(actions);
  return (
    <li
      {...props}
      {...kb("collectionrow", { selected, leading: hasSlotContent(leading), aside }, className)}
    >
      <div className={clsx("kb-collectionrow-layout", classNames?.layout)}>
        {hasSlotContent(leading) && (
          <div className={clsx("kb-collectionrow-leading", classNames?.leading)}>{leading}</div>
        )}
        <div className={clsx("kb-collectionrow-content", classNames?.content)}>
          <div className={clsx("kb-collectionrow-title", classNames?.title)}>{title}</div>
          {hasSlotContent(description) && (
            <div className={clsx("kb-collectionrow-description", classNames?.description)}>
              {description}
            </div>
          )}
        </div>
        {aside && (
          <div className={clsx("kb-collectionrow-aside", classNames?.aside)}>
            {hasSlotContent(metadata) && (
              <div className={clsx("kb-collectionrow-metadata", classNames?.metadata)}>
                {metadata}
              </div>
            )}
            {hasSlotContent(actions) && (
              <div className={clsx("kb-collectionrow-actions", classNames?.actions)}>{actions}</div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
