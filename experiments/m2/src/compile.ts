import { autoFixSpec, compileSpecStream, type Spec, validateSpec } from "@json-render/core";
import type { Capture } from "./study";

export type Compiled = {
  spec: Spec;
  patchLines: number;
  skippedLines: number;
  /** ms from spawn to the first patch that adds an element; null when the CLI did not stream. */
  firstNodeMs: number | null;
  issues: { code: string; message: string; elementKey?: string }[];
  fixes: { message: string; lossy: boolean }[];
};

// Applies only json-render's lossless fixes, as its docs advise before any re-prompt.
export function compile(capture: Capture): Compiled {
  const patches = capture.lines.filter((l) => l.text.trim().startsWith("{"));
  const spec = compileSpecStream<Spec & Record<string, unknown>>(
    patches.map((l) => l.text.trim()).join("\n"),
  );
  const first = patches.find((l) => l.text.includes('"/elements/'));
  const issues = validateSpec(spec).issues.map(({ code, message, elementKey }) => ({
    code,
    message,
    ...(elementKey ? { elementKey } : {}),
  }));
  const fixed = autoFixSpec(spec, { lossy: false });
  return {
    spec: fixed.spec,
    patchLines: patches.length,
    skippedLines: capture.lines.filter((l) => l.text.trim() && !l.text.trim().startsWith("{"))
      .length,
    firstNodeMs: capture.streamedLines && first ? first.t : null,
    issues,
    fixes: fixed.fixDetails.map(({ message, lossy }) => ({ message, lossy })),
  };
}
