import { act, renderHook } from "@testing-library/react";
import { type ReactNode, StrictMode } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { useClipboard } from "./useClipboard";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

test("consumer callback errors leave successful clipboard result intact", async () => {
  const failure = new Error("Consumer failed");
  const onCopyError = vi.fn();
  vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  const { result } = renderHook(() =>
    useClipboard("reference", {
      onCopy: () => {
        throw failure;
      },
      onCopyError,
    }),
  );
  await act(async () => {
    await expect(result.current.copy()).rejects.toBe(failure);
  });
  expect(result.current.state).toBe("copied");
  expect(onCopyError).not.toHaveBeenCalled();
});

test("strict effects allow copies and clean up success timers on unmount", async () => {
  vi.useFakeTimers();
  const onCopy = vi.fn();
  vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  const { result, unmount } = renderHook(() => useClipboard("reference", { onCopy }), {
    wrapper: ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>,
  });
  await act(async () => result.current.copy());
  expect(result.current.state).toBe("copied");
  expect(onCopy).toHaveBeenCalledExactlyOnceWith("reference");
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
