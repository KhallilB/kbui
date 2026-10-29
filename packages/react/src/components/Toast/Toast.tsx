import {
  Toast as Base,
  type ToastManagerAddOptions as BaseAddOptions,
  type ToastManagerPromiseOptions as BasePromiseOptions,
  type ToastManager as BaseToastManager,
  type ToastObject as BaseToastObject,
  type ToastManagerUpdateOptions as BaseUpdateOptions,
  type UseToastManagerReturnValue,
} from "@base-ui/react/toast";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type ToastTone = "neutral" | "info" | "success" | "warning" | "danger";
export type ToastPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end" | "inline";
export type ToastObject<Data extends object = Record<string, unknown>> = BaseToastObject<Data>;
export type ToastManager<Data extends object = Record<string, unknown>> = BaseToastManager<Data>;
export type ToastAddOptions<Data extends object = Record<string, unknown>> = BaseAddOptions<Data>;
export type ToastUpdateOptions<Data extends object = Record<string, unknown>> =
  BaseUpdateOptions<Data>;
export type ToastPromiseOptions<
  Value,
  Data extends object = Record<string, unknown>,
> = BasePromiseOptions<Value, Data>;
export type ToastProviderProps = Base.Provider.Props;
export type ToastContentProps = Omit<Base.Content.Props, "className"> & {
  /** Extra classes for content. */
  className?: string | undefined;
};
export type ToastTitleProps = Omit<Base.Title.Props, "className"> & {
  /** Extra classes for title. */
  className?: string | undefined;
};
export type ToastDescriptionProps = Omit<Base.Description.Props, "className"> & {
  /** Extra classes for description. */
  className?: string | undefined;
};
export type ToastActionProps = Omit<Base.Action.Props, "className"> & {
  /** Extra classes for action. */
  className?: string | undefined;
};
export type ToastCloseProps = Omit<Base.Close.Props, "className"> & {
  /** Extra classes for dismissal control. */
  className?: string | undefined;
};
export type ToastProps<Data extends object = Record<string, unknown>> = Omit<
  Base.Root.Props,
  "className" | "toast"
> & {
  /** Message object from the matching provider. */
  toast: ToastObject<Data>;
  /** Extra classes for root. */
  className?: string | undefined;
  /** Visual emphasis; defaults to matching toast.type, with error mapped to danger. */
  tone?: ToastTone | undefined;
  /** Localized accessible name for default dismissal control. */
  closeLabel?: string | undefined;
  /** Classes for default parts; custom children own their part classes. */
  classNames?: ClassNames<"content" | "title" | "description" | "action" | "close"> | undefined;
};
export type ToastViewportProps<Data extends object = Record<string, unknown>> = Omit<
  Base.Viewport.Props,
  "className"
> & {
  /** Extra classes for viewport. */
  className?: string | undefined;
  /** Logical screen corner; inline participates in surrounding layout without a portal. */
  placement?: ToastPlacement | undefined;
  /** Theme-scoped portal host; defaults to document.body for fixed placements. */
  container?: Base.Portal.Props["container"];
  /** Custom renderer for each message; defaults to a complete Toast with all parts. */
  renderToast?: ((toast: ToastObject<Data>) => ReactNode) | undefined;
};

export function createToastManager<
  Data extends object = Record<string, unknown>,
>(): ToastManager<Data> {
  return Base.createToastManager<Data>();
}

export function useToastManager<
  Data extends object = Record<string, unknown>,
>(): UseToastManagerReturnValue<Data> {
  return Base.useToastManager<Data>();
}

function ToastContent({ className, ...props }: ToastContentProps) {
  return <Base.Content {...props} className={clsx("kb-toast-content", className)} />;
}

function ToastTitle({ className, ...props }: ToastTitleProps) {
  return <Base.Title {...props} className={clsx("kb-toast-title", className)} />;
}

function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return <Base.Description {...props} className={clsx("kb-toast-description", className)} />;
}

function ToastAction({ className, ...props }: ToastActionProps) {
  return <Base.Action {...props} className={clsx("kb-toast-action", className)} />;
}

function ToastClose({ className, ...props }: ToastCloseProps) {
  return (
    <Base.Close
      aria-label="Dismiss notification"
      aria-hidden={false}
      {...props}
      className={clsx("kb-toast-close", className)}
    />
  );
}

function toastTone(type: string | undefined): ToastTone {
  if (type === "error") return "danger";
  if (type === "loading") return "info";
  return type === "info" || type === "success" || type === "warning" || type === "danger"
    ? type
    : "neutral";
}

function ToastRoot<Data extends object = Record<string, unknown>>({
  toast,
  tone = toastTone(toast.type),
  closeLabel = "Dismiss notification",
  classNames,
  className,
  children,
  ...props
}: ToastProps<Data>) {
  return (
    <Base.Root {...props} toast={toast} {...kb("toast", { tone }, className)}>
      {children === undefined ? (
        <>
          <ToastContent className={classNames?.content}>
            <ToastTitle className={classNames?.title}>
              {toast.title ?? toast.description}
            </ToastTitle>
            {toast.title != null && <ToastDescription className={classNames?.description} />}
            <ToastAction className={classNames?.action} />
          </ToastContent>
          <ToastClose className={classNames?.close} aria-label={closeLabel}>
            <span aria-hidden="true">×</span>
          </ToastClose>
        </>
      ) : (
        children
      )}
    </Base.Root>
  );
}

function ToastViewport<Data extends object = Record<string, unknown>>({
  placement = "bottom-end",
  container,
  renderToast,
  className,
  children,
  ...props
}: ToastViewportProps<Data>) {
  const { toasts } = useToastManager<Data>();
  const viewport = (
    <Base.Viewport {...props} {...kb("toast-viewport", { placement }, className)}>
      {children === undefined
        ? toasts.map((toast) =>
            renderToast ? renderToast(toast) : <ToastRoot key={toast.id} toast={toast} />,
          )
        : children}
    </Base.Viewport>
  );
  return placement === "inline" ? (
    viewport
  ) : (
    <Base.Portal container={container}>{viewport}</Base.Portal>
  );
}

export const Toast = Object.assign(ToastRoot, {
  Provider: Base.Provider,
  Viewport: ToastViewport,
  Content: ToastContent,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Close: ToastClose,
});
