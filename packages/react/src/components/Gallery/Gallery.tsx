import { clsx } from "clsx";
import { Children, type ComponentProps, Fragment, isValidElement, type ReactNode } from "react";
import { type ClassNames, kb } from "../../utils/kb";
import { Grid } from "../Grid/Grid";

export type GalleryPart = "header" | "filters" | "items" | "empty";

export interface GalleryProps extends ComponentProps<"div"> {
  /** Page title, intro and page actions, usually a PageHeader. */
  header?: ReactNode | undefined;
  /** Search, filter and sort controls; they share a row and wrap. */
  filters?: ReactNode | undefined;
  /** Accessible name for the item list. */
  itemsLabel?: string | undefined;
  /** Shown in place of the list when there are no items. */
  empty?: ReactNode | undefined;
  /** Classes for inner regions, keyed by region. */
  classNames?: ClassNames<GalleryPart> | undefined;
}

export interface GalleryItemProps extends ComponentProps<"li"> {
  /** Spans two columns once the list has two; keep featured items first. */
  featured?: boolean | undefined;
}

// Looks through fragments; a component that renders null still counts as an item.
function hasItems(children: ReactNode): boolean {
  return Children.toArray(children).some((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? hasItems(child.props.children)
      : true,
  );
}

function GalleryRoot({
  ref,
  header,
  filters,
  itemsLabel,
  empty,
  className,
  classNames,
  children,
  ...props
}: GalleryProps) {
  const showEmpty = empty != null && !hasItems(children);
  return (
    <div {...props} ref={ref} {...kb("gallery", {}, className)}>
      {header != null ? (
        <div className={clsx("kb-gallery-header", classNames?.header)}>{header}</div>
      ) : null}
      {filters != null ? (
        <div className={clsx("kb-gallery-filters", classNames?.filters)}>{filters}</div>
      ) : null}
      {showEmpty ? (
        <div className={clsx("kb-gallery-empty", classNames?.empty)}>{empty}</div>
      ) : (
        <Grid
          as="ul"
          gap="lg"
          aria-label={itemsLabel}
          className={clsx("kb-gallery-items", classNames?.items)}
        >
          {children}
        </Grid>
      )}
    </div>
  );
}

function GalleryItem({ featured, className, ...props }: GalleryItemProps) {
  return <li {...props} {...kb("gallery-item", { featured }, className)} />;
}

/** Layout intent for a grid of image-led items, such as a product catalog. */
export const Gallery = Object.assign(GalleryRoot, { Item: GalleryItem });
