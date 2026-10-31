import { Fragment, type ReactElement, useEffect, useState } from "react";

export type HarnessControls = {
  setRecords(next: readonly unknown[]): void;
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
  unmount: () => current().unmount(),
  remount: () => current().remount(),
};

/** Renders a recipe whose records, mount and remount a contract check controls. */
export function Harness({
  records,
  render,
}: {
  records: readonly unknown[];
  render: (records: readonly unknown[]) => ReactElement;
}): ReactElement {
  const [live, setLive] = useState(records);
  const [mounted, setMounted] = useState(true);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    bound = {
      setRecords: setLive,
      unmount: () => setMounted(false),
      remount: () => {
        setMounted(true);
        setGeneration((value) => value + 1);
      },
    };
    return () => {
      bound = null;
    };
  }, []);
  return <Fragment key={generation}>{mounted ? render(live) : null}</Fragment>;
}
