// kbui recipe ListDetail, Inbox · from kbui 0.12.0 · https://kbui.kcb.pro/recipes/
// Shared by the flow recipes: the router seam, `CommitResult`, announcements and focus helpers.
import { useState } from "react";

/** `errors` keeps the draft and focuses the first invalid field; `form`, owned by no field, focuses submit. */
export type CommitResult<Field extends string = string> =
  // biome-ignore lint/suspicious/noConfusingVoidType: lets `async () => {}` mean success.
  void | { errors: Partial<Record<Field | "form", string>> };

export type FlowNotice = { id: number; text: string };

/** Advances `id` so screen readers re-announce an identical message. */
export function nextNotice(current: FlowNotice, text: string): FlowNotice {
  return { id: current.id + 1, text };
}

/** Keyed live-region state that re-mounts on repeated messages. */
export function useAnnounce(): [FlowNotice, (message: string) => void] {
  const [notice, setNotice] = useState<FlowNotice>({ id: 0, text: "" });
  return [
    notice,
    (message: string) => {
      setNotice((current) => nextNotice(current, message));
    },
  ];
}

/** First invalid rendered field, or `"submit"` when errors are form-level. */
export function errorFocusTarget<Field extends string>(
  errors: Partial<Record<string, string>>,
  fields: readonly Field[],
): Field | "submit" {
  return fields.find((field) => errors[field]) ?? "submit";
}

/** Consumes a pending focus target once a deep-linked record has settled. */
export function takeFocusTarget<Target>(
  targetRef: { current: Target | null },
  waitingForSelection = false,
): Target | null {
  if (waitingForSelection) return null;
  const target = targetRef.current;
  targetRef.current = null;
  return target;
}

/** True when focus was inside a subtree that just unmounted. */
export function isFocusDisconnected(
  ...candidates: readonly (Element | null | undefined)[]
): boolean {
  return candidates.some((element) => Boolean(element && !element.isConnected));
}

/** Moves focus to the open record heading or list search when resize hides the focused control. */
export function observeHiddenFocus(
  root: HTMLElement | null,
  focused: { current: HTMLElement | null },
  currentId: { current: string | null },
  heading: { current: HTMLElement | null },
  search: { current: HTMLElement | null },
): () => void {
  if (!root) return () => {};
  const observer = new ResizeObserver(() => {
    const active = document.activeElement;
    const candidate = active === document.body ? focused.current : active;
    if (
      candidate instanceof HTMLElement &&
      root.contains(candidate) &&
      candidate.getClientRects().length === 0
    ) {
      (currentId.current !== null ? heading.current : search.current)?.focus();
    }
  });
  observer.observe(root);
  return () => observer.disconnect();
}

export function without<Value>(
  map: Record<string, Value | undefined>,
  id: string,
): Record<string, Value | undefined> {
  const { [id]: _, ...rest } = map;
  return rest;
}

/** Where a list-and-detail recipe keeps its open record id. Preview: may change before 1.0. */
export type FlowRouter = {
  /** Open id; an empty value reads as `null`. */
  read(): string | null;
  /** Pushes one history entry. */
  write(id: string | null): void;
  subscribe(onChange: () => void): () => void;
};

/** Keeps the open id in one URL search parameter and leaves the others alone. */
export function searchParamRouter(param: string): FlowRouter {
  return {
    read: () => new URL(window.location.href).searchParams.get(param) || null,
    write(id) {
      const url = new URL(window.location.href);
      if (id) url.searchParams.set(param, id);
      else url.searchParams.delete(param);
      window.history.pushState(window.history.state, "", url);
    },
    subscribe(onChange) {
      window.addEventListener("popstate", onChange);
      return () => window.removeEventListener("popstate", onChange);
    },
  };
}
