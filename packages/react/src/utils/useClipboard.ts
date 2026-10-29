import { useEffect, useRef, useState } from "react";

export type CopyState = "idle" | "pending" | "copied" | "failed";

export type CopyFeedbackProps = {
  /** Disable copying while keeping content selectable. */
  disabled?: boolean | undefined;
  /** Idle copy button text and accessible name. */
  copyLabel?: string | undefined;
  /** Pending copy button text. */
  copyingLabel?: string | undefined;
  /** Successful copy button text. */
  copiedLabel?: string | undefined;
  /** Failed copy button text; activation retries. */
  copyErrorLabel?: string | undefined;
  /** Polite success announcement. */
  successMessage?: string | undefined;
  /** Visible, polite failure message with recovery instructions. */
  errorMessage?: string | undefined;
  /** Success feedback lifetime in milliseconds; zero keeps feedback until next action. */
  feedbackDuration?: number | undefined;
  /** Called after clipboard write succeeds for current content. */
  onCopy?: ((value: string) => void) | undefined;
  /** Called when current clipboard write fails, including unavailable Clipboard API. */
  onCopyError?: ((error: unknown) => void) | undefined;
};

export function useClipboard(
  value: string,
  { disabled = false, feedbackDuration = 2000, onCopy, onCopyError }: CopyFeedbackProps,
) {
  const [feedback, setFeedback] = useState({ value, disabled, status: "idle" as CopyState });
  const epoch = useRef(0);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const state =
    feedback.value === value && feedback.disabled === disabled ? feedback.status : "idle";

  useEffect(() => {
    setFeedback({ value, disabled, status: "idle" });
    return () => {
      // Ignore writes completed after content changes, disable, or unmount.
      epoch.current += 1;
      busy.current = false;
      clearTimeout(timer.current);
    };
  }, [value, disabled]);

  async function copy() {
    if (disabled || value.length === 0 || busy.current) return;
    const request = ++epoch.current;
    busy.current = true;
    clearTimeout(timer.current);
    setFeedback({ value, disabled, status: "pending" });
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(value);
    } catch (error) {
      if (request !== epoch.current) return;
      busy.current = false;
      setFeedback({ value, disabled, status: "failed" });
      onCopyError?.(error);
      return;
    }
    if (request !== epoch.current) return;
    busy.current = false;
    setFeedback({ value, disabled, status: "copied" });
    const duration =
      Number.isFinite(feedbackDuration) && feedbackDuration >= 0 ? feedbackDuration : 2000;
    if (duration > 0) {
      timer.current = setTimeout(() => {
        if (request === epoch.current) setFeedback({ value, disabled, status: "idle" });
      }, duration);
    }
    // Consumer callback errors must not turn successful writes into copy failures.
    onCopy?.(value);
  }

  return { state, copy, disabled: disabled || value.length === 0 };
}
