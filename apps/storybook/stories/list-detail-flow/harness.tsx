import { Fragment, type ReactElement, useEffect, useState } from "react";

export type HarnessControls = {
  setRecords(next: readonly unknown[]): void;
  setLoading(next: boolean): void;
  unmount(): void;
  remount(): void;
};

let bound: HarnessControls | null = null;

function current(): HarnessControls {
  if (!bound) throw new Error("No flow harness is mounted");
  return bound;
}

/** Drives the mounted `Harness`; throws if none is mounted. */
export const controls: HarnessControls = {
  setRecords: (next) => current().setRecords(next),
  setLoading: (next) => current().setLoading(next),
  unmount: () => current().unmount(),
  remount: () => current().remount(),
};

/** Renders a recipe whose records, loading, mount and remount a contract check controls. */
export function Harness({
  records,
  loading: initiallyLoading = false,
  render,
}: {
  records: readonly unknown[];
  loading?: boolean;
  render: (records: readonly unknown[], loading: boolean) => ReactElement;
}): ReactElement {
  const [live, setLive] = useState(records);
  const [loading, setLoading] = useState(initiallyLoading);
  const [mounted, setMounted] = useState(true);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    const mine: HarnessControls = {
      setRecords: setLive,
      setLoading,
      unmount: () => setMounted(false),
      remount: () => {
        setMounted(true);
        setGeneration((value) => value + 1);
      },
    };
    bound = mine;
    return () => {
      // An overlapping harness may have bound since; keep its controls.
      if (bound === mine) bound = null;
    };
  }, []);
  return <Fragment key={generation}>{mounted ? render(live, loading) : null}</Fragment>;
}
