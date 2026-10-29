import { clsx } from "clsx";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { type ClassNames, kb } from "../../utils/kb";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { Input } from "../Input/Input";
import { Select } from "../Select/Select";
import {
  collectionPageCount,
  positiveInteger,
  type UseCollectionOptions,
  useCollection,
} from "./useCollection";

export type CollectionColumn<T> = {
  /** Unique column identity used in sort requests. */
  key: string;
  /** Visible column label. */
  header: string;
  /** Record cell content. */
  cell: (item: T) => ReactNode;
  /** Ascending comparator; enables sorting in client mode. */
  compare?: ((a: T, b: T) => number) | undefined;
  /** Enable a server-owned sortable column without a local comparator. */
  sortable?: boolean | undefined;
};
export type CollectionFilter = {
  /** State filter key. */
  key: string;
  /** Visible select label. */
  label: string;
  /** Nonempty facet values and their visible labels. */
  options: readonly { value: string; label: string }[];
};
export type CollectionBulkAction = {
  /** Unique action identity. */
  key: string;
  /** Visible action label. */
  label: string;
  /** Receives explicit ID snapshot; rejection preserves selection. */
  onAction: (keys: readonly string[]) => void | Promise<void>;
  /** Caller-owned permission or availability constraint. */
  disabled?: boolean | undefined;
};
export type CollectionPaginationProps = Omit<ComponentProps<"nav">, "onChange"> & {
  /** One-based current page; clamped to available pages. */
  page: number;
  /** Positive integer page size. */
  pageSize: number;
  /** Known non-negative total after filtering. */
  totalItems: number;
  /** Receives bounded one-based page requests. */
  onPageChange: (page: number) => void;
  /** Receives page-size requests; caller also resets page to one. */
  onPageSizeChange?: ((pageSize: number) => void) | undefined;
  /** Positive integer page-size choices. */
  pageSizes?: readonly number[] | undefined;
  /** Disable navigation while data or actions are pending. */
  disabled?: boolean | undefined;
};
export function CollectionPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizes = [10, 25, 50],
  disabled,
  className,
  ...props
}: CollectionPaginationProps) {
  const count = collectionPageCount(totalItems, pageSize);
  const current = Math.min(positiveInteger(page, "page"), count);
  const sizes = [...new Set([pageSize, ...pageSizes])].sort((a, b) => a - b);
  for (const size of sizes) positiveInteger(size, "pageSizes");
  return (
    <nav
      {...props}
      {...kb("collection-pagination", {}, className)}
      aria-label={props["aria-label"] ?? "Collection pagination"}
    >
      <div>
        <span>
          {totalItems ? (current - 1) * pageSize + 1 : 0}–{Math.min(current * pageSize, totalItems)}{" "}
          of {totalItems}
        </span>
        {onPageSizeChange && (
          <Select
            label="Rows per page"
            disabled={Boolean(disabled)}
            value={String(pageSize)}
            options={sizes.map((size) => ({ value: String(size), label: String(size) }))}
            onValueChange={(value) => {
              if (value !== null) onPageSizeChange(Number(value));
            }}
          />
        )}
      </div>
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || current === 1}
          onClick={() => onPageChange(current - 1)}
          aria-label="Previous page"
        >
          Previous
        </Button>
        <span aria-live="polite" aria-atomic="true">
          Page {current} of {count}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || current === count}
          onClick={() => onPageChange(current + 1)}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
export type CollectionBulkActionsProps = ComponentProps<"fieldset"> & {
  /** Explicit selected record IDs, including off-page selection. */
  selectedKeys: readonly string[];
  /** Available application-owned operations. */
  actions: readonly CollectionBulkAction[];
  /** Clear current selection on request. */
  onClear: () => void;
  /** Remove successfully submitted IDs; omitted preserves selection. */
  onSuccess?: ((keys: readonly string[]) => void) | undefined;
  /** Lock surrounding collection controls during an operation. */
  onPendingChange?: ((pending: boolean) => void) | undefined;
  /** Disable actions while parent data is unavailable. */
  disabled?: boolean | undefined;
};
export function CollectionBulkActions({
  selectedKeys,
  actions,
  onClear,
  onSuccess,
  onPendingChange,
  disabled,
  className,
  ...props
}: CollectionBulkActionsProps) {
  const [pending, setPending] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (failed && selectedKeys.length === 0) setFailed(false);
  }, [failed, selectedKeys.length]);
  const lock = useRef(false);
  const selection = [...new Set(selectedKeys)];
  const success = useRef(onSuccess);
  useLayoutEffect(() => {
    success.current = onSuccess;
  });
  const run = async (action: CollectionBulkAction) => {
    if (lock.current || disabled || action.disabled || !selection.length) return;
    lock.current = true;
    const snapshot = [...selection];
    setFailed(false);
    setPending(action.key);
    onPendingChange?.(true);
    try {
      await action.onAction(snapshot);
      success.current?.(snapshot);
    } catch {
      setFailed(true);
    } finally {
      lock.current = false;
      setPending(null);
      onPendingChange?.(false);
    }
  };
  return (
    <fieldset
      {...props}
      {...kb("collection-bulk", { pending: pending !== null }, className)}
      aria-label={props["aria-label"] ?? "Selection actions"}
    >
      <span role="status">{selection.length} selected</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled || pending !== null || !selection.length}
        onClick={() => {
          setFailed(false);
          onClear();
        }}
      >
        Clear selection
      </Button>
      {actions.map((action) => (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          key={action.key}
          disabled={disabled || pending !== null || action.disabled || !selection.length}
          onClick={() => void run(action)}
        >
          {action.label}
        </Button>
      ))}
      <span role="status">{pending !== null ? "Action in progress" : ""}</span>
      {failed && selectedKeys.length > 0 && (
        <span role="alert">Action failed. Selection kept; try again.</span>
      )}
    </fieldset>
  );
}

type CollectionPart =
  | "toolbar"
  | "filters"
  | "viewport"
  | "table"
  | "caption"
  | "head"
  | "cell"
  | "row"
  | "empty"
  | "status"
  | "bulk"
  | "pagination";
export type CollectionProps<T> = UseCollectionOptions<T> &
  Omit<ComponentProps<"section">, "children" | "defaultValue"> & {
    /** Accessible region name and visible table caption. */
    label: string;
    /** Stable accessible record name used by selection controls. */
    getItemLabel: (item: T) => string;
    /** Ordered table columns. */
    columns: readonly CollectionColumn<T>[];
    /** Facet controls; matches applies their values in client mode. */
    filters?: readonly CollectionFilter[] | undefined;
    /** Application-owned operations on explicit selected IDs. */
    bulkActions?: readonly CollectionBulkAction[] | undefined;
    /** Hide selection controls for read-only collections. */
    selectable?: boolean | undefined;
    /** Suppress rows and lock controls while fetching. */
    loading?: boolean | undefined;
    /** Caller-owned fetch failure and recovery content. */
    error?: ReactNode | undefined;
    /** Content shown when no records match. */
    empty?: ReactNode | undefined;
    /** Additional named controls or recovery actions. */
    toolbar?: ReactNode | undefined;
    /** Classes for collection slots. */
    classNames?: ClassNames<CollectionPart> | undefined;
  };
function CollectionRoot<T>({
  label,
  getItemLabel,
  columns,
  filters = [],
  bulkActions = [],
  selectable = true,
  loading = false,
  error,
  empty = "No matching records",
  toolbar,
  classNames,
  className,
  items,
  getKey,
  isItemDisabled,
  matches,
  compare,
  mode,
  totalItems,
  state,
  defaultState,
  onStateChange,
  ...props
}: CollectionProps<T>) {
  const [pending, setPending] = useState(false);
  const blocked = loading || Boolean(error) || pending;
  const collection = useCollection<T>({
    items,
    getKey,
    isItemDisabled,
    matches,
    compare:
      compare ??
      ((a, b, sort) => columns.find((column) => column.key === sort.key)?.compare?.(a, b) ?? 0),
    ...(mode === "server" ? { mode, totalItems: totalItems as number } : { mode: "client" }),
    state,
    defaultState,
    onStateChange,
  });
  const id = useId();
  const slot = (part: CollectionPart) => clsx(`kb-collection-${part}`, classNames?.[part]);
  const { state: current } = collection;
  const selectedKeys = new Set(current.selectedKeys);
  return (
    <section
      {...props}
      {...kb("collection", { loading, pending }, className)}
      aria-label={label}
      aria-busy={loading}
    >
      <div className={slot("toolbar")}>
        {(matches || mode === "server") && (
          <Input
            type="search"
            label={`Search ${label}`}
            value={current.query}
            disabled={blocked}
            onChange={(event) => collection.setQuery(event.target.value)}
          />
        )}
        <div className={slot("filters")}>
          {filters.map((filter) => (
            <Select
              key={filter.key}
              label={filter.label}
              disabled={blocked}
              value={current.filters[filter.key] ? `option:${current.filters[filter.key]}` : "all"}
              options={[
                { value: "all", label: "All" },
                ...filter.options.map((option) => ({ ...option, value: `option:${option.value}` })),
              ]}
              onValueChange={(value) =>
                collection.setFilter(
                  filter.key,
                  value && value !== "all" ? value.slice("option:".length) : "",
                )
              }
            />
          ))}
        </div>
        {toolbar}
      </div>
      {selectable && (
        <CollectionBulkActions
          className={classNames?.bulk}
          selectedKeys={current.selectedKeys}
          actions={bulkActions}
          onClear={collection.clearSelection}
          onSuccess={collection.removeSelection}
          onPendingChange={setPending}
          disabled={blocked}
        />
      )}
      <p className={slot("status")} role="status" aria-atomic="true">
        {loading
          ? "Loading records"
          : error
            ? "Records unavailable"
            : `${collection.totalItems} records`}
      </p>
      {error ? (
        <div role="alert">{error}</div>
      ) : (
        // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users must scroll wide tables.
        <section className={slot("viewport")} tabIndex={0} aria-label={`${label} table`}>
          <table className={slot("table")}>
            <caption className={slot("caption")}>{label}</caption>
            <thead>
              <tr>
                {selectable && (
                  <th className={slot("head")} scope="col">
                    <Checkbox
                      label="Select this page"
                      visuallyHidden
                      checked={collection.pageSelection === "all"}
                      indeterminate={collection.pageSelection === "some"}
                      disabled={blocked || collection.selectableCount === 0}
                      onCheckedChange={collection.selectPage}
                    />
                  </th>
                )}
                {columns.map((column) => {
                  const sortable = Boolean(
                    column.compare || (mode === "server" && column.sortable),
                  );
                  const direction =
                    current.sort?.key === column.key ? current.sort.direction : "none";
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      className={slot("head")}
                      aria-sort={sortable ? direction : undefined}
                    >
                      {sortable ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={`Sort by ${column.header}`}
                          disabled={blocked}
                          onClick={() =>
                            collection.setSort(
                              direction === "descending"
                                ? null
                                : {
                                    key: column.key,
                                    direction: direction === "none" ? "ascending" : "descending",
                                  },
                            )
                          }
                        >
                          {column.header}{" "}
                          <span aria-hidden="true">
                            {direction === "ascending"
                              ? "↑"
                              : direction === "descending"
                                ? "↓"
                                : "↕"}
                          </span>
                        </Button>
                      ) : (
                        column.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {!loading &&
                collection.items.map((item) => {
                  const key = getKey(item);
                  const selected = selectedKeys.has(key);
                  return (
                    <tr key={key} className={slot("row")} data-selected={selected || undefined}>
                      {selectable && (
                        <td className={slot("cell")}>
                          <Checkbox
                            label={`Select ${getItemLabel(item)}`}
                            visuallyHidden
                            checked={selected}
                            disabled={blocked || isItemDisabled?.(item)}
                            onCheckedChange={(checked) => collection.toggle(key, checked)}
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td className={slot("cell")} key={column.key}>
                          {column.cell(item)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              {(loading || collection.items.length === 0) && (
                <tr>
                  <td className={slot("empty")} colSpan={columns.length + (selectable ? 1 : 0)}>
                    {loading ? "Loading records…" : empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
      <CollectionPagination
        id={`${id}-pagination`}
        className={classNames?.pagination}
        aria-label={`${label} pagination`}
        page={current.page}
        pageSize={current.pageSize}
        totalItems={collection.totalItems}
        onPageChange={collection.setPage}
        onPageSizeChange={collection.setPageSize}
        disabled={blocked}
      />
    </section>
  );
}

export const Collection = Object.assign(CollectionRoot, {
  Pagination: CollectionPagination,
  BulkActions: CollectionBulkActions,
});
