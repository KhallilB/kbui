// kbui recipe ListDetail, Inbox · needs @kb.ui/react ≥ 0.12.0 · https://kbui.kcb.pro/recipes/
// Configure through options; replace this file whole to take upstream fixes.
import { type RefCallback, useEffect, useReducer, useRef } from "react";
import {
  type CommitResult,
  errorFocusTarget,
  type FlowNotice,
  type FlowRouter,
  isFocusDisconnected,
  observeHiddenFocus,
  takeFocusTarget,
  useAnnounce,
  without,
} from "./flow-router";

// Keys outside the rendered fields can still arrive from a server.
type Errors = Partial<Record<string, string>>;

/** Commits the record prop has not echoed yet, oldest first. */
export type Committed<R, D> = { base: R; drafts: D[] };

export type FlowState<R, D, Filter> = {
  selectedId: string | null;
  /** Row that list focus returns to. */
  lastSelectedId: string | null;
  query: string;
  filter: Filter;
  defaultFilter: Filter;
  drafts: Record<string, D | undefined>;
  errors: Record<string, Errors | undefined>;
  failures: Record<string, true | undefined>;
  pending: Record<string, true | undefined>;
  committed: Record<string, Committed<R, D> | undefined>;
};

export type FlowAction<R, D, Filter> =
  | { type: "select"; id: string | null }
  | { type: "begin"; draft: D }
  | { type: "change"; draft: D }
  | { type: "discard" }
  | { type: "remove"; id: string }
  /** `errors` from `validate`; empty starts the commit. */
  | { type: "submit"; id: string; errors: Errors }
  | { type: "refused"; id: string; errors: Errors }
  | { type: "failed"; id: string }
  /** `base` is the record prop when the commit started. */
  | { type: "committed"; id: string; base: R | undefined; draft: D }
  | { type: "setQuery"; query: string }
  | { type: "setFilter"; filter: Filter | null }
  | { type: "clearFilters" };

export function initialFlowState<R, D, Filter>(options: {
  selectedId: string | null;
  defaultFilter: Filter;
}): FlowState<R, D, Filter> {
  const selectedId = options.selectedId || null;
  return {
    selectedId,
    lastSelectedId: selectedId,
    query: "",
    filter: options.defaultFilter,
    defaultFilter: options.defaultFilter,
    drafts: {},
    errors: {},
    failures: {},
    pending: {},
    committed: {},
  };
}

function close<R, D, Filter>(state: FlowState<R, D, Filter>, id: string): FlowState<R, D, Filter> {
  return {
    ...state,
    drafts: without(state.drafts, id),
    errors: without(state.errors, id),
    failures: without(state.failures, id),
  };
}

export function reduceFlow<R, D, Filter>(
  state: FlowState<R, D, Filter>,
  action: FlowAction<R, D, Filter>,
): FlowState<R, D, Filter> {
  const open = state.selectedId;
  switch (action.type) {
    case "select":
      if (action.id === open) return state;
      return { ...state, selectedId: action.id, lastSelectedId: open ?? state.lastSelectedId };
    case "begin":
    case "change":
      if (open === null) return state;
      return { ...state, drafts: { ...state.drafts, [open]: action.draft } };
    case "discard":
      return open === null ? state : close(state, open);
    case "remove":
      return close(state, action.id);
    case "submit": {
      if (state.pending[action.id]) return state;
      const failures = without(state.failures, action.id);
      if (Object.keys(action.errors).length)
        return { ...state, failures, errors: { ...state.errors, [action.id]: action.errors } };
      return {
        ...state,
        failures,
        errors: without(state.errors, action.id),
        pending: { ...state.pending, [action.id]: true },
      };
    }
    case "refused":
      return {
        ...state,
        errors: { ...state.errors, [action.id]: action.errors },
        pending: without(state.pending, action.id),
      };
    case "failed":
      return {
        ...state,
        failures: { ...state.failures, [action.id]: true },
        pending: without(state.pending, action.id),
      };
    case "committed": {
      const { id, base, draft } = action;
      const previous = state.committed[id];
      const drafts = previous && previous.base === base ? [...previous.drafts, draft] : [draft];
      return {
        ...state,
        drafts: without(state.drafts, id),
        pending: without(state.pending, id),
        committed: base ? { ...state.committed, [id]: { base, drafts } } : state.committed,
      };
    }
    case "setQuery":
      return { ...state, query: action.query };
    case "setFilter":
      return { ...state, filter: action.filter ?? state.defaultFilter };
    case "clearFilters":
      return { ...state, query: "", filter: state.defaultFilter };
  }
}

export function visibleRecords<R, Filter>(
  records: readonly R[],
  state: { query: string; filter: Filter },
  matches: (record: R, query: string, filter: Filter) => boolean,
): R[] {
  return records.filter((record) => matches(record, state.query, state.filter));
}

/** Reads the raw query, so a whitespace search can still be cleared. */
export function filtersActive<Filter>(state: {
  query: string;
  filter: Filter;
  defaultFilter: Filter;
}): boolean {
  return state.query !== "" || state.filter !== state.defaultFilter;
}

export type FlowNotices<R> = {
  saving(record: R): string;
  saved(record: R): string;
  failed(record: R): string;
  invalid(record: R, errors: Errors): string;
  discarded(record: R): string;
};

/** Preview: may change before 1.0. */
export type ListDetailFlowOptions<R extends { id: string }, D, Field extends string, Filter> = {
  /** Live; matched by id. Keep unchanged records as the same object. */
  records: readonly R[];
  /** `""` reads as `null`. */
  initialId: string | null;
  loading: boolean;
  /** Keep identity stable. */
  router: FlowRouter;
  /** Rendered fields in focus order; `[0]` takes focus on begin and on a failed commit. */
  fields: readonly Field[];
  begin: (record: R) => D;
  normalize: (draft: D) => D;
  validate: (draft: D) => Errors;
  commit: (id: string, draft: D) => Promise<CommitResult<Field>>;
  /** Shows commits the prop has not echoed yet; `committed` is oldest first. */
  view: (record: R, committed: readonly D[]) => R;
  /** Raw query; trim inside. */
  matches: (record: R, query: string, filter: Filter) => boolean;
  defaultFilter: Filter;
  notices: FlowNotices<R>;
};

export type ListDetailFlow<R, D, Field extends string, Filter> = {
  /** With `view` applied. */
  records: R[];
  visible: R[];
  selectedId: string | null;
  /** Held while a loading refetch omits it. */
  selected: R | undefined;
  /** Deep link still loading: render neither unavailable nor empty. */
  waiting: boolean;
  draft: D | undefined;
  hasDraft(id: string): boolean;
  /** Open record's errors. */
  errors: Errors;
  /** Messages for fields the composition does not render. */
  unrendered: string[];
  failed: boolean;
  pending: boolean;
  query: string;
  filter: Filter;
  filtersActive: boolean;
  notice: FlowNotice;
  /** The open id focuses the heading, with no write. */
  open(id: string): void;
  back(): void;
  begin(): void;
  change(draft: D): void;
  discard(): void;
  submit(): void;
  setQuery(query: string): void;
  /** `null` resets to `defaultFilter`. */
  setFilter(filter: Filter | null): void;
  /** Focuses search before its control unmounts. */
  clearFilters(): void;
  /** Spread on the recipe root: tracks focus for resize and removal repair. */
  root: {
    ref: { current: HTMLElement | null };
    onFocusCapture: (event: { target: EventTarget }) => void;
    onBlurCapture: (event: { target: EventTarget }) => void;
  };
  refs: {
    search: { current: HTMLInputElement | null };
    /** Record heading, or the unavailable heading; `tabIndex={-1}`. */
    heading: { current: HTMLHeadingElement | null };
    begin: { current: HTMLButtonElement | null };
    submit: { current: HTMLButtonElement | null };
    field(name: Field): RefCallback<HTMLElement>;
    row(id: string): RefCallback<HTMLElement>;
  };
};

type Target<Field> = "heading" | "list" | "begin" | "submit" | { field: Field };

/** A wrapper element, such as a select's, focuses its own control. */
function focusControl(element: HTMLElement | undefined) {
  if (element?.matches("input, textarea, select, button")) element.focus();
  else (element?.querySelector<HTMLElement>("[role='combobox'], button") ?? element)?.focus();
}

/** Selection, history, drafts, commits and focus for one list-and-detail screen. */
export function useListDetailFlow<R extends { id: string }, D, Field extends string, Filter>(
  options: ListDetailFlowOptions<R, D, Field, Filter>,
): ListDetailFlow<R, D, Field, Filter> {
  const { router, fields, loading, notices } = options;
  const [state, dispatch] = useReducer(
    (current: FlowState<R, D, Filter>, action: FlowAction<R, D, Filter>) =>
      reduceFlow(current, action),
    undefined,
    () =>
      initialFlowState<R, D, Filter>({
        selectedId: router.read() ?? options.initialId,
        defaultFilter: options.defaultFilter,
      }),
  );
  const { selectedId } = state;
  const [notice, announce] = useAnnounce();
  const root = useRef<HTMLElement>(null);
  const focused = useRef<HTMLElement | null>(null);
  const currentId = useRef(selectedId);
  const latest = useRef(options.records);
  latest.current = options.records;
  const mounted = useRef(false);
  const pending = useRef(new Set<string>());
  // Read before commit: a removed element may never fire blur, so `focused` can be stale.
  const activeBefore = useRef<Element | null>(null);
  activeBefore.current = root.current?.contains(document.activeElement)
    ? document.activeElement
    : null;
  const search = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const beginControl = useRef<HTMLButtonElement>(null);
  const submitControl = useRef<HTMLButtonElement>(null);
  const fieldElements = useRef(new Map<Field, HTMLElement>());
  const fieldRefs = useRef(new Map<Field, RefCallback<HTMLElement>>());
  const rows = useRef(new Map<string, HTMLElement>());
  const rowRefs = useRef(new Map<string, RefCallback<HTMLElement>>());
  // A refetch can remove the focused row before it blurs.
  const rowBefore = useRef<HTMLElement | null>(null);
  rowBefore.current =
    Array.from(rows.current.values()).find((row) => row === activeBefore.current) ?? null;
  const shown = useRef<string | null>(null);
  const focusTarget = useRef<Target<Field> | null>(selectedId !== null ? "heading" : null);
  const records = options.records.map((record) => {
    const committed = state.committed[record.id];
    return committed?.base === record ? options.view(record, committed.drafts) : record;
  });
  // A refetch may omit the open record while loading; it is removed only once loading ends.
  const held = useRef<R | undefined>(undefined);
  const selected =
    records.find((record) => record.id === selectedId) ??
    (loading && held.current?.id === selectedId ? held.current : undefined);
  held.current = selected;
  const errors = (selected && state.errors[selected.id]) || {};

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = router.subscribe(() => {
      const next = router.read();
      if (next === currentId.current) return;
      focusTarget.current = next !== null ? "heading" : "list";
      currentId.current = next;
      dispatch({ type: "select", id: next });
    });
    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    currentId.current = selectedId;
    const target = takeFocusTarget(focusTarget, loading && selectedId !== null && !selected);
    if (target === "heading") heading.current?.focus();
    if (target === "begin") beginControl.current?.focus();
    if (target === "submit") submitControl.current?.focus();
    if (target === "list")
      (rows.current.get(state.lastSelectedId ?? "") ?? search.current)?.focus();
    if (typeof target === "object" && target) focusControl(fieldElements.current.get(target.field));
  });

  // The focused row left the list: search keeps focus in it, as Back does for a filtered row.
  useEffect(() => {
    if (isFocusDisconnected(rowBefore.current) && !root.current?.contains(document.activeElement))
      search.current?.focus();
  });

  // The open record left the prop: drop its draft, and refocus only if focus went with it.
  useEffect(() => {
    if (shown.current !== null && shown.current === selectedId && !selected) {
      dispatch({ type: "remove", id: shown.current });
      if (isFocusDisconnected(activeBefore.current, focused.current)) heading.current?.focus();
    }
    shown.current = selected?.id ?? null;
  }, [selected, selectedId]);

  useEffect(() => observeHiddenFocus(root.current, focused, currentId, heading, search), []);

  function navigate(next: string | null) {
    if (next === selectedId) {
      heading.current?.focus();
      return;
    }
    router.write(next);
    focusTarget.current = next !== null ? "heading" : "list";
    currentId.current = next;
    dispatch({ type: "select", id: next });
  }

  function unrenderedIn(found: Errors): string[] {
    return Object.entries(found).flatMap(([key, text]) =>
      text && !fields.includes(key as Field) ? [text] : [],
    );
  }

  function errorTarget(found: Errors): Target<Field> {
    const target = errorFocusTarget(found, fields);
    return target === "submit" ? "submit" : { field: target as Field };
  }

  /** Records field errors; false when there are none. Server errors are always announced. */
  function reject(record: R, found: Errors, server: boolean) {
    const entries = Object.entries(found).filter(([, text]) => text);
    if (!entries.length) return false;
    const kept = Object.fromEntries(entries);
    dispatch(
      server
        ? { type: "refused", id: record.id, errors: kept }
        : { type: "submit", id: record.id, errors: kept },
    );
    const unrendered = unrenderedIn(kept);
    if (server || unrendered.length)
      announce([...(server ? [notices.invalid(record, found)] : []), ...unrendered].join(" "));
    if (currentId.current === record.id) focusTarget.current = errorTarget(found);
    return true;
  }

  async function submit(record: R, current: D) {
    const id = record.id;
    if (pending.current.has(id)) return;
    const next = options.normalize(current);
    if (reject(record, options.validate(next), false)) return;
    dispatch({ type: "submit", id, errors: {} });
    // An echo that lands while pending is a new object, so the prop wins over this commit.
    const base = latest.current.find((entry) => entry.id === id);
    pending.current.add(id);
    // Pending disables the focused submit; keep focus in the record.
    focusTarget.current = "heading";
    announce(notices.saving(record));
    try {
      const result = await options.commit(id, next);
      if (!mounted.current) return;
      if (result && reject(record, result.errors, true)) return;
      dispatch({ type: "committed", id, base, draft: next });
      announce(notices.saved(record));
      if (currentId.current === id) focusTarget.current = "begin";
    } catch {
      if (!mounted.current) return;
      dispatch({ type: "failed", id });
      announce(notices.failed(record));
      const [first] = fields;
      if (currentId.current === id && first !== undefined) focusTarget.current = { field: first };
    } finally {
      pending.current.delete(id);
    }
  }

  function cached<Key>(
    refs: Map<Key, RefCallback<HTMLElement>>,
    elements: Map<Key, HTMLElement>,
    key: Key,
  ): RefCallback<HTMLElement> {
    let ref = refs.get(key);
    if (!ref) {
      ref = (element) => {
        if (element) elements.set(key, element);
        else elements.delete(key);
      };
      refs.set(key, ref);
    }
    return ref;
  }

  const draft = selected ? state.drafts[selected.id] : undefined;
  return {
    records,
    visible: visibleRecords(records, state, options.matches),
    selectedId,
    selected,
    waiting: selectedId !== null && loading && !selected,
    draft,
    hasDraft: (id) => state.drafts[id] !== undefined,
    errors,
    unrendered: unrenderedIn(errors),
    failed: Boolean(selected && state.failures[selected.id]),
    pending: Boolean(selected && state.pending[selected.id]),
    query: state.query,
    filter: state.filter,
    filtersActive: filtersActive(state),
    notice,
    open: (id) => navigate(id),
    back: () => navigate(null),
    begin() {
      const [first] = fields;
      if (!selected) return;
      dispatch({ type: "begin", draft: options.begin(selected) });
      if (first !== undefined) focusTarget.current = { field: first };
    },
    change(next) {
      dispatch({ type: "change", draft: next });
    },
    discard() {
      if (!selected) return;
      dispatch({ type: "discard" });
      announce(notices.discarded(selected));
      focusTarget.current = "begin";
    },
    submit() {
      if (selected && draft !== undefined) void submit(selected, draft);
    },
    setQuery: (query) => dispatch({ type: "setQuery", query }),
    setFilter: (filter) => dispatch({ type: "setFilter", filter }),
    clearFilters() {
      dispatch({ type: "clearFilters" });
      search.current?.focus();
    },
    root: {
      ref: root,
      onFocusCapture(event) {
        if (event.target instanceof HTMLElement) focused.current = event.target;
      },
      onBlurCapture(event) {
        // Hidden controls may blur before ResizeObserver runs.
        if (event.target instanceof Element && event.target.getClientRects().length)
          focused.current = null;
      },
    },
    refs: {
      search,
      heading,
      begin: beginControl,
      submit: submitControl,
      field: (name) => cached(fieldRefs.current, fieldElements.current, name),
      row: (id) => cached(rowRefs.current, rows.current, id),
    },
  };
}
