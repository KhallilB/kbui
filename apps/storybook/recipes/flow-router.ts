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
