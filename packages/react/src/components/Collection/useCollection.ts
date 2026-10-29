import { useLayoutEffect, useRef, useState } from "react";

export type CollectionSort = {
  /** Column identifier. */
  key: string;
  /** Comparison direction. */
  direction: "ascending" | "descending";
};
export type CollectionState = {
  /** Search text, interpreted by matches or the server. */
  query: string;
  /** Facet values; empty values mean no constraint. */
  filters: Readonly<Record<string, string>>;
  /** Active sort; null preserves input order. */
  sort: CollectionSort | null;
  /** One-based page. */
  page: number;
  /** Positive integer records per page. */
  pageSize: number;
  /** Explicit record IDs; never an implicit all-results selection. */
  selectedKeys: readonly string[];
};
export type CollectionData<T> = {
  /** Complete local dataset or one server page. */
  items: readonly T[];
  /** Unique, stable identity across pages and updates. */
  getKey: (item: T) => string;
  /** Disable selection for an ineligible record. */
  isItemDisabled?: ((item: T) => boolean) | undefined;
  /** Client search and facet predicate; server mode ignores it. */
  matches?: ((item: T, query: string, filters: CollectionState["filters"]) => boolean) | undefined;
  /** Client comparison for the requested sort; server mode ignores it. */
  compare?: ((a: T, b: T, sort: CollectionSort) => number) | undefined;
} & ({ mode?: "client" | undefined; totalItems?: never } | { mode: "server"; totalItems: number });
export type UseCollectionOptions<T> = CollectionData<T> & {
  /** Controlled workflow state; owner must apply changes. */
  state?: CollectionState | undefined;
  /** Initial uncontrolled workflow state. */
  defaultState?: Partial<CollectionState> | undefined;
  /** Receives complete next state for URL, server or external ownership. */
  onStateChange?: ((state: CollectionState) => void) | undefined;
};

export function positiveInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value < 1)
    throw new RangeError(`${name} must be a positive safe integer`);
  return value;
}
export function collectionPageCount(totalItems: number, pageSize: number): number {
  positiveInteger(pageSize, "pageSize");
  if (!Number.isSafeInteger(totalItems) || totalItems < 0)
    throw new RangeError("totalItems must be a non-negative safe integer");
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function useCollection<T>(options: UseCollectionOptions<T>) {
  const { items, getKey, isItemDisabled, matches, compare } = options;
  const [internal, setInternal] = useState<CollectionState>(() => ({
    query: "",
    filters: {},
    sort: null,
    page: 1,
    pageSize: 10,
    selectedKeys: [],
    ...options.defaultState,
  }));
  const derive = (requested: CollectionState) => {
    positiveInteger(requested.page, "page");
    positiveInteger(requested.pageSize, "pageSize");
    const keys = new Set<string>();
    const disabledKeys = new Set<string>();
    for (const item of items) {
      const key = getKey(item);
      if (keys.has(key)) throw new Error("Collection record keys must be unique");
      keys.add(key);
      if (isItemDisabled?.(item)) disabledKeys.add(key);
    }
    let processed = items;
    if (options.mode !== "server") {
      processed = matches
        ? items.filter((item) => matches(item, requested.query, requested.filters))
        : items;
      if (requested.sort && compare) {
        const sort = requested.sort;
        processed = [...processed].sort(
          (a, b) => compare(a, b, sort) * (sort.direction === "ascending" ? 1 : -1),
        );
      }
    }
    const totalItems = options.mode === "server" ? options.totalItems : processed.length;
    const pageCount = collectionPageCount(totalItems, requested.pageSize);
    const state: CollectionState = {
      ...requested,
      page: Math.min(requested.page, pageCount),
      selectedKeys: [...new Set(requested.selectedKeys)].filter(
        (key) => !disabledKeys.has(key) && (options.mode === "server" || keys.has(key)),
      ),
    };
    const pageItems =
      options.mode === "server"
        ? items
        : processed.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
    const selectableKeys = pageItems.map(getKey).filter((key) => !disabledKeys.has(key));
    const selected = new Set(state.selectedKeys);
    const selectedOnPage = selectableKeys.filter((key) => selected.has(key)).length;
    const pageSelection: "none" | "some" | "all" =
      selectedOnPage === 0 ? "none" : selectedOnPage === selectableKeys.length ? "all" : "some";
    return {
      state,
      items: pageItems,
      totalItems,
      pageCount,
      pageSelection,
      selectableKeys,
      keys,
      disabledKeys,
    };
  };
  const {
    state,
    items: pageItems,
    totalItems,
    pageCount,
    pageSelection,
    selectableKeys,
    keys,
    disabledKeys,
  } = derive(options.state ?? internal);
  const requested = options.state ?? internal;
  const context = {
    state,
    derive,
    keys,
    disabledKeys,
    controlled: options.state !== undefined,
    onStateChange: options.onStateChange,
  };
  const latest = useRef(context);
  useLayoutEffect(() => {
    latest.current = context;
    if (
      options.state === undefined &&
      (requested.page !== state.page ||
        requested.selectedKeys.length !== state.selectedKeys.length ||
        requested.selectedKeys.some((key, index) => key !== state.selectedKeys[index]))
    )
      setInternal(state);
  });
  const change = (
    patch: Partial<CollectionState> | ((current: CollectionState) => Partial<CollectionState>),
  ) => {
    const current = latest.current;
    const next = current.derive({
      ...current.state,
      ...(typeof patch === "function" ? patch(current.state) : patch),
    }).state;
    if (!current.controlled) {
      current.state = next;
      setInternal(next);
    }
    current.onStateChange?.(next);
  };
  return {
    state,
    items: pageItems,
    totalItems,
    pageCount,
    pageSelection,
    selectableCount: selectableKeys.length,
    setQuery: (query: string) => change({ query, page: 1, selectedKeys: [] }),
    setFilter: (key: string, value: string) =>
      change((current) => ({
        filters: { ...current.filters, [key]: value },
        page: 1,
        selectedKeys: [],
      })),
    setSort: (sort: CollectionSort | null) => change({ sort, page: 1 }),
    setPage: (page: number) => change({ page }),
    setPageSize: (pageSize: number) => change({ pageSize, page: 1 }),
    toggle: (key: string, checked: boolean) => {
      const current = latest.current;
      if (!current.keys.has(key) || current.disabledKeys.has(key)) return;
      change((current) => {
        const next = new Set(current.selectedKeys);
        if (checked) next.add(key);
        else next.delete(key);
        return { selectedKeys: [...next] };
      });
    },
    selectPage: (checked: boolean) => {
      change((current) => {
        const next = new Set(current.selectedKeys);
        for (const key of latest.current.derive(current).selectableKeys) {
          if (checked) next.add(key);
          else next.delete(key);
        }
        return { selectedKeys: [...next] };
      });
    },
    clearSelection: () => change({ selectedKeys: [] }),
    removeSelection: (keysToRemove: readonly string[]) => {
      const removed = new Set(keysToRemove);
      change((current) => ({
        selectedKeys: current.selectedKeys.filter((key) => !removed.has(key)),
      }));
    },
  };
}
export type CollectionController<T> = ReturnType<typeof useCollection<T>>;
