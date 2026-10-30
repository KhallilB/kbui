import { clsx } from "clsx";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { type ClassNames, kb } from "../../utils/kb";
import { Button } from "../Button/Button";
import { Callout } from "../Callout/Callout";
import { Dialog, type DialogContentProps, type DialogTriggerProps } from "../Dialog/Dialog";

export type ConfirmActionSlot = "popup" | "backdrop" | "details" | "error";

/** Destructive action behind a modal confirmation; the trigger only opens it. */
export type ConfirmActionProps = Omit<
  DialogTriggerProps,
  "className" | "title" | "children" | "handle" | "payload"
> & {
  /** Trigger text; also the confirm button text unless confirmLabel is set. */
  children: ReactNode;
  /** Plain class string for the trigger. */
  className?: string | undefined;
  /** Dialog heading and accessible name; ask the question the action settles. */
  title: ReactNode;
  /** Consequence of confirming; the dialog's accessible description. */
  description?: ReactNode | undefined;
  /** Further consequence detail, such as what else is removed. */
  details?: ReactNode | undefined;
  /** Runs the action. Throw or reject to keep the dialog open with an error. */
  onConfirm: () => unknown;
  /** Runs once after success, after the dialog has closed; remove the trigger here. */
  onConfirmed?: (() => void) | undefined;
  /** Confirm button text; defaults to the trigger's children. */
  confirmLabel?: ReactNode | undefined;
  /** Confirm button text while the action runs; defaults to confirmLabel. */
  pendingLabel?: ReactNode | undefined;
  /** Cancel button text. */
  cancelLabel?: ReactNode | undefined;
  /** Alert shown after a failure; a function receives the thrown reason. */
  errorMessage?: ReactNode | ((error: unknown) => ReactNode) | undefined;
  /** Controlled visibility. */
  open?: boolean | undefined;
  /** Initial visibility when uncontrolled. */
  defaultOpen?: boolean | undefined;
  /** Receives each requested visibility change, including the close after success. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Focus target after closing; set it when success removes the trigger. */
  finalFocus?: DialogContentProps["finalFocus"] | undefined;
  /** Portal target; defaults to document.body. */
  container?: DialogContentProps["container"] | undefined;
  /** Classes for inner parts, keyed by part. */
  classNames?: ClassNames<ConfirmActionSlot> | undefined;
};

const DEFAULT_ERROR = "The action did not complete. Try again.";

export function ConfirmAction({
  title,
  description,
  details,
  onConfirm,
  onConfirmed,
  confirmLabel,
  pendingLabel,
  cancelLabel = "Cancel",
  errorMessage = DEFAULT_ERROR,
  open,
  defaultOpen = false,
  onOpenChange,
  finalFocus,
  container,
  classNames,
  className,
  children,
  render = <Button variant="danger" />,
  ...props
}: ConfirmActionProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<{ reason: unknown } | null>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  // Guards repeat activation before React commits `pending`.
  const submitting = useRef(false);
  const succeeded = useRef(false);
  const mounted = useRef(true);
  const isOpen = open ?? uncontrolledOpen;
  const openNow = useRef(isOpen);
  const latestConfirmed = useRef(onConfirmed);
  const [confirmedCount, setConfirmedCount] = useState(0);
  useEffect(() => {
    openNow.current = isOpen;
    latestConfirmed.current = onConfirmed;
  });
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  // An effect, so the popup has unmounted before the caller removes the trigger.
  useEffect(() => {
    if (confirmedCount > 0) latestConfirmed.current?.();
  }, [confirmedCount]);

  function change(next: boolean) {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  async function confirm() {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setFailure(null);
    try {
      await onConfirm();
      if (!mounted.current) return;
      if (openNow.current) {
        succeeded.current = true;
        change(false);
      } else {
        setConfirmedCount((n) => n + 1);
      }
    } catch (reason) {
      if (mounted.current) setFailure({ reason });
    } finally {
      submitting.current = false;
      if (mounted.current) setPending(false);
    }
  }

  const confirmText = confirmLabel ?? children;
  const message =
    failure && (typeof errorMessage === "function" ? errorMessage(failure.reason) : errorMessage);

  return (
    <Dialog
      open={isOpen}
      disablePointerDismissal
      onOpenChange={(next, eventDetails) => {
        if (submitting.current) {
          eventDetails.cancel();
          return;
        }
        succeeded.current = false;
        setFailure(null);
        change(next);
      }}
      onOpenChangeComplete={(next) => {
        if (!succeeded.current) return;
        succeeded.current = false;
        if (!next) setConfirmedCount((n) => n + 1);
      }}
    >
      <Dialog.Trigger {...props} render={render} className={className}>
        {children}
      </Dialog.Trigger>
      <Dialog.Content
        title={title}
        description={description}
        initialFocus={cancel}
        aria-busy={pending || undefined}
        {...(finalFocus === undefined ? {} : { finalFocus })}
        {...(container === undefined ? {} : { container })}
        {...(classNames?.backdrop ? { classNames: { backdrop: classNames.backdrop } } : {})}
        {...kb("confirmaction", { pending }, classNames?.popup)}
      >
        {details != null ? (
          <div className={clsx("kb-confirmaction-details", classNames?.details)}>{details}</div>
        ) : null}
        {failure ? (
          <Callout
            tone="danger"
            role="alert"
            className={clsx("kb-confirmaction-error", classNames?.error)}
          >
            {message}
          </Callout>
        ) : null}
        <Dialog.Actions>
          <Dialog.Close
            ref={cancel}
            render={<Button variant="ghost" disabled={pending} focusableWhenDisabled />}
          >
            {cancelLabel}
          </Dialog.Close>
          <Button
            variant="danger"
            disabled={pending}
            focusableWhenDisabled
            onClick={() => void confirm()}
          >
            {pending ? (pendingLabel ?? confirmText) : confirmText}
          </Button>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  );
}
