import type { ComponentProps, CSSProperties } from "react";
import { type ClassNames, kb } from "../../utils/kb";
import { Checkbox, type CheckboxProps } from "../Checkbox/Checkbox";

export type TableProps = ComponentProps<"table"> & {
  /** Cell spacing; dense retains full-size control targets. */
  density?: "comfortable" | "dense" | undefined;
  /** Keep column headers visible inside the scrolling container. */
  stickyHeader?: boolean | undefined;
  /** Fixed column sizing; supply widths through colgroup or cell styles. */
  layout?: "auto" | "fixed" | undefined;
};
export function TableRoot({
  density = "comfortable",
  stickyHeader = false,
  layout = "auto",
  className,
  ...props
}: TableProps) {
  return (
    <table
      {...props}
      {...kb("table", { density, "sticky-header": stickyHeader, layout }, className)}
    />
  );
}
function revealTableFocus(viewport: HTMLElement, target: HTMLElement) {
  const table = [...viewport.querySelectorAll<HTMLTableElement>(".kb-table")].find(
    (candidate) => candidate.contains(target) && candidate.closest(".kb-table-scroll") === viewport,
  );
  if (!table) return;
  const bounds = viewport.getBoundingClientRect();
  const left = bounds.left + viewport.clientLeft;
  const top = bounds.top + viewport.clientTop;
  let focusedEdge: string | undefined;
  for (let cell: HTMLElement | null = target; cell && cell !== table; cell = cell.parentElement) {
    if (cell.matches("th[data-sticky], td[data-sticky]") && cell.closest(".kb-table") === table) {
      focusedEdge = cell.dataset.sticky;
      break;
    }
  }
  let visibleLeft = left;
  let visibleRight = left + viewport.clientWidth;
  const pinnedCells = table.querySelectorAll<HTMLElement>(
    ":scope > thead > tr > [data-sticky], :scope > :is(tbody, tfoot) > tr:first-child > [data-sticky]",
  );
  for (const cell of pinnedCells) {
    const appearance = getComputedStyle(cell);
    if (
      cell.dataset.sticky === focusedEdge ||
      appearance.position !== "sticky" ||
      appearance.visibility !== "visible"
    )
      continue;
    const cellBounds = cell.getBoundingClientRect();
    if (cellBounds.width <= 0 || cellBounds.height <= 0) continue;
    const leftEdge = (cell.dataset.sticky === "start") !== (appearance.direction === "rtl");
    if (leftEdge) visibleLeft = Math.max(visibleLeft, cellBounds.right);
    else visibleRight = Math.min(visibleRight, cellBounds.left);
  }
  const head = table.tHead;
  const visibleTop =
    head && table.hasAttribute("data-sticky-header") && !head.contains(target)
      ? Math.max(top, head.getBoundingClientRect().bottom)
      : top;
  const visibleBottom = top + viewport.clientHeight;
  const targetBounds = target.getBoundingClientRect();
  if (visibleRight > visibleLeft) {
    if (targetBounds.left < visibleLeft)
      viewport.scrollLeft += Math.floor(targetBounds.left - visibleLeft);
    else if (targetBounds.right > visibleRight)
      viewport.scrollLeft += Math.ceil(targetBounds.right - visibleRight);
  }
  if (visibleBottom > visibleTop) {
    if (targetBounds.top < visibleTop)
      viewport.scrollTop += Math.floor(targetBounds.top - visibleTop);
    else if (targetBounds.bottom > visibleBottom)
      viewport.scrollTop += Math.ceil(targetBounds.bottom - visibleBottom);
  }
}

export type TableScrollContainerProps = ComponentProps<"section"> & {
  /** Accessible name for the keyboard-scrollable region. */
  label: string;
  /** Height cap; sticky headers use this scroll boundary. */
  maxHeight?: CSSProperties["maxHeight"] | undefined;
};
export function TableScrollContainer({
  label,
  maxHeight,
  onFocus,
  className,
  style,
  ...props
}: TableScrollContainerProps) {
  return (
    <section
      {...props}
      aria-label={label}
      tabIndex={props.tabIndex ?? 0}
      {...kb("table-scroll", {}, className)}
      style={{ maxHeight, ...style }}
      onFocus={(event) => {
        onFocus?.(event);
        if (!event.defaultPrevented && event.target instanceof HTMLElement)
          revealTableFocus(event.currentTarget, event.target);
      }}
    />
  );
}
export type TableCaptionProps = ComponentProps<"caption">;
export function TableCaption({ className, ...props }: TableCaptionProps) {
  return <caption {...props} {...kb("table-caption", {}, className)} />;
}
export type TableHeadProps = ComponentProps<"thead">;
export function TableHead({ className, ...props }: TableHeadProps) {
  return <thead {...props} {...kb("table-head", {}, className)} />;
}
export type TableBodyProps = ComponentProps<"tbody">;
export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody {...props} {...kb("table-body", {}, className)} />;
}
export type TableFootProps = ComponentProps<"tfoot">;
export function TableFoot({ className, ...props }: TableFootProps) {
  return <tfoot {...props} {...kb("table-foot", {}, className)} />;
}
export type TableRowProps = ComponentProps<"tr"> & {
  /** Highlight a row whose checkbox is selected; adds no grid role. */
  selected?: boolean | undefined;
};
export function TableRow({ selected = false, className, ...props }: TableRowProps) {
  return <tr {...props} {...kb("table-row", { selected }, className)} />;
}
export type TableCellOptions = {
  /** Logical text alignment; follows writing direction. */
  align?: "start" | "center" | "end" | undefined;
  /** Pin one edge cell; use matching edges in header and body. */
  sticky?: "start" | "end" | undefined;
};
export type TableSortDirection = "none" | "ascending" | "descending";
export type TableColumnHeaderProps = Omit<ComponentProps<"th">, "align"> &
  TableCellOptions & {
    /** Controlled order; app owns sorting and resets other columns to none. */
    sortDirection?: TableSortDirection | undefined;
    /** Enables native sort button; none starts ascending, then toggles. */
    onSortChange?: ((direction: Exclude<TableSortDirection, "none">) => void) | undefined;
    /** Prevent sort interaction while data is unavailable. */
    sortDisabled?: boolean | undefined;
    /** Classes for sort button and decorative icon. */
    classNames?: ClassNames<"sortButton" | "sortIcon"> | undefined;
  };
export function TableColumnHeader({
  align = "start",
  sticky,
  sortDirection,
  onSortChange,
  sortDisabled,
  className,
  classNames,
  children,
  scope = "col",
  "aria-sort": ariaSort,
  ...props
}: TableColumnHeaderProps) {
  const direction =
    sortDirection ?? (ariaSort === "ascending" || ariaSort === "descending" ? ariaSort : "none");
  return (
    <th
      {...props}
      scope={scope}
      aria-sort={sortDirection === "none" ? undefined : (sortDirection ?? ariaSort)}
      {...kb("table-columnheader", { align, sticky }, className)}
    >
      {onSortChange ? (
        <button
          type="button"
          disabled={sortDisabled}
          {...kb("table-sort-button", {}, classNames?.sortButton)}
          onClick={() => onSortChange(direction === "ascending" ? "descending" : "ascending")}
        >
          {children}
          <span aria-hidden="true" {...kb("table-sort-icon", {}, classNames?.sortIcon)}>
            {direction === "ascending" ? "↑" : direction === "descending" ? "↓" : "↕"}
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  );
}
export type TableRowHeaderProps = Omit<ComponentProps<"th">, "align"> & TableCellOptions;
export function TableRowHeader({
  align = "start",
  sticky,
  scope = "row",
  className,
  ...props
}: TableRowHeaderProps) {
  return <th {...props} scope={scope} {...kb("table-rowheader", { align, sticky }, className)} />;
}
export type TableCellProps = Omit<ComponentProps<"td">, "align"> & TableCellOptions;
export function TableCell({ align = "start", sticky, className, ...props }: TableCellProps) {
  return <td {...props} {...kb("table-cell", { align, sticky }, className)} />;
}
export type TableSelectionCheckboxProps = CheckboxProps;
export type TableRowActionsProps = ComponentProps<"div">;
export function TableRowActions({ className, ...props }: TableRowActionsProps) {
  return <div {...props} {...kb("table-rowactions", {}, className)} />;
}

export const Table = Object.assign(TableRoot, {
  ScrollContainer: TableScrollContainer,
  Caption: TableCaption,
  Head: TableHead,
  Body: TableBody,
  Foot: TableFoot,
  Row: TableRow,
  ColumnHeader: TableColumnHeader,
  RowHeader: TableRowHeader,
  Cell: TableCell,
  SelectionCheckbox: Checkbox,
  RowActions: TableRowActions,
});
