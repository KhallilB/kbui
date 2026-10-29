import { Toast as Base } from "@base-ui/react/toast";
import { clsx } from "clsx";
import {
  Children,
  type ComponentProps,
  isValidElement,
  type MouseEvent,
  type ReactNode,
  useState,
} from "react";
import { type ClassNames, kb } from "../../utils/kb";
import { Spinner } from "../Spinner/Spinner";

export type ToastTone = "neutral" | "info" | "success" | "warning" | "danger" | "loading";
export type ToastPlacement =
  | "bottom-end"
  | "bottom-start"
  | "top-end"
  | "top-start"
  | "bottom-center"
  | "top-center";

export type ToastClassNames = ClassNames<
  | "viewport"
  | "content"
  | "icon"
  | "body"
  | "title"
  | "description"
  | "actions"
  | "action"
  | "close"
>;

export type ToastData = {
  tone?: ToastTone;
  icon?: ReactNode;
  action?: ReactNode;
  actionLabel?: ReactNode;
  onAction?: (event: MouseEvent<HTMLButtonElement>) => void;
  closable?: boolean;
  closeLabel?: string;
};

export type ToastObject<Data extends object = ToastData> = Base.Root.ToastObject<Data>;
export type ToastManager<Data extends object = ToastData> = ReturnType<
  typeof Base.createToastManager<Data>
>;

export const useToastManager = Base.useToastManager<ToastData>;
export const createToastManager = Base.createToastManager<ToastData>;

const resolveTone = (tone?: ToastTone, type?: string): ToastTone => {
  if (tone) return tone;
  if (type === "error" || type === "danger") return "danger";
  if (
    type === "info" ||
    type === "success" ||
    type === "warning" ||
    type === "loading" ||
    type === "neutral"
  ) {
    return type;
  }
  return "neutral";
};

export type ToastProps = Omit<ComponentProps<"div">, "title"> & {
  /** Managed toast item when rendered inside `Toast.Viewport`. */
  toast?: ToastObject<ToastData>;
  tone?: ToastTone;
  title?: ReactNode;
  description?: ReactNode;
  /** Decorative icon; defaults to a spinner when `tone="loading"`. */
  icon?: ReactNode;
  /** Custom recovery or follow-up action control. */
  action?: ReactNode;
  /** Label for the built-in recovery action button. */
  actionLabel?: ReactNode;
  /** Click handler for `actionLabel`. */
  onAction?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Additional button attributes for the action control. */
  actionProps?: ComponentProps<"button">;
  /** Shows the dismiss button; defaults to `true` except while `tone="loading"`. */
  closable?: boolean;
  /** Accessible name for the dismiss button. */
  closeLabel?: string;
  /** Called when a standalone toast is dismissed. */
  onClose?: () => void;
  /** Controlled visibility for standalone usage. */
  open?: boolean;
  /** Initial visibility for standalone uncontrolled usage. */
  defaultOpen?: boolean;
  /** Visibility change handler for standalone usage. */
  onOpenChange?: (open: boolean) => void;
  classNames?: ToastClassNames;
};

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function ToastRoot({
  toast,
  tone: toneProp,
  title: titleProp,
  description: descriptionProp,
  icon: iconProp,
  action: actionProp,
  actionLabel: actionLabelProp,
  onAction: onActionProp,
  actionProps: actionPropsProp,
  closable: closableProp,
  closeLabel: closeLabelProp,
  onClose,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
  classNames,
  children,
  role,
  ...rest
}: ToastProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;

  const data = toast?.data;
  const tone = resolveTone(toneProp ?? data?.tone, toast?.type);
  const title = titleProp ?? toast?.title;
  const description = descriptionProp ?? toast?.description;
  const resolvedIcon =
    iconProp !== undefined ? (
      iconProp
    ) : data?.icon !== undefined ? (
      data.icon
    ) : tone === "loading" ? (
      <Spinner decorative size="sm" tone="current" />
    ) : undefined;
  const action = actionProp ?? data?.action;
  const mergedActionProps = actionPropsProp ?? toast?.actionProps;
  const actionLabel = actionLabelProp ?? data?.actionLabel ?? mergedActionProps?.children;
  const onAction = onActionProp ?? data?.onAction ?? mergedActionProps?.onClick;
  const closable = closableProp ?? data?.closable ?? tone !== "loading";
  const closeLabel = closeLabelProp ?? data?.closeLabel ?? "Dismiss notification";

  if (toast) {
    return (
      <Base.Root {...rest} toast={toast} {...kb("toast", { tone }, className)}>
        <Base.Content className={clsx("kb-toast-content", classNames?.content)}>
          {resolvedIcon != null ? (
            <span className={clsx("kb-toast-icon", classNames?.icon)} aria-hidden="true">
              {resolvedIcon}
            </span>
          ) : null}
          <div className={clsx("kb-toast-body", classNames?.body)}>
            {title != null ? (
              <Base.Title className={clsx("kb-toast-title", classNames?.title)}>{title}</Base.Title>
            ) : null}
            {description != null ? (
              <Base.Description className={clsx("kb-toast-description", classNames?.description)}>
                {description}
              </Base.Description>
            ) : null}
            {children}
          </div>
          {action != null || actionLabel != null || closable ? (
            <div className={clsx("kb-toast-actions", classNames?.actions)}>
              {action}
              {action == null && actionLabel != null ? (
                <Base.Action
                  {...actionPropsProp}
                  onClick={onActionProp ?? data?.onAction}
                  className={clsx(
                    "kb-toast-action",
                    mergedActionProps?.className,
                    classNames?.action,
                  )}
                >
                  {actionLabel}
                </Base.Action>
              ) : null}
              {closable ? (
                <Base.Close
                  aria-label={closeLabel}
                  className={clsx("kb-toast-close", classNames?.close)}
                >
                  <CloseIcon />
                </Base.Close>
              ) : null}
            </div>
          ) : null}
        </Base.Content>
      </Base.Root>
    );
  }

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (open === undefined) setUncontrolledOpen(false);
    onOpenChange?.(false);
    onClose?.();
  };

  return (
    <div
      {...rest}
      role={role ?? (tone === "danger" ? "alert" : "status")}
      {...kb("toast", { tone }, className)}
    >
      <div className={clsx("kb-toast-content", classNames?.content)}>
        {resolvedIcon != null ? (
          <span className={clsx("kb-toast-icon", classNames?.icon)} aria-hidden="true">
            {resolvedIcon}
          </span>
        ) : null}
        <div className={clsx("kb-toast-body", classNames?.body)}>
          {title != null ? (
            <div className={clsx("kb-toast-title", classNames?.title)}>{title}</div>
          ) : null}
          {description != null ? (
            <div className={clsx("kb-toast-description", classNames?.description)}>
              {description}
            </div>
          ) : null}
          {children}
        </div>
        {action != null || actionLabel != null || closable ? (
          <div className={clsx("kb-toast-actions", classNames?.actions)}>
            {action}
            {action == null && actionLabel != null ? (
              <button
                type="button"
                {...mergedActionProps}
                onClick={onAction}
                className={clsx(
                  "kb-toast-action",
                  mergedActionProps?.className,
                  classNames?.action,
                )}
              >
                {actionLabel}
              </button>
            ) : null}
            {closable ? (
              <button
                type="button"
                aria-label={closeLabel}
                onClick={handleDismiss}
                className={clsx("kb-toast-close", classNames?.close)}
              >
                <CloseIcon />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export type ToastViewportProps = Omit<ComponentProps<"div">, "children"> & {
  placement?: ToastPlacement;
  /** Renders in document flow instead of a fixed viewport overlay. */
  inline?: boolean;
  /** Portals the viewport into `container` (defaults to `true` unless `inline` is set). */
  portal?: boolean;
  container?: Base.Portal.Props["container"];
  /** Accessible region label announced when jumping to notifications (`F6`). */
  label?: string;
  children?: ReactNode | ((toast: ToastObject<ToastData>) => ReactNode);
  classNames?: ToastClassNames;
};

function ToastViewport({
  placement = "bottom-end",
  inline = false,
  portal,
  container,
  label = "Notifications",
  children,
  className,
  classNames,
  ...rest
}: ToastViewportProps) {
  const { toasts } = useToastManager();
  const shouldPortal = portal ?? !inline;

  const viewport = (
    <Base.Viewport
      {...rest}
      aria-label={label}
      {...kb("toast-viewport", { placement, inline }, clsx(classNames?.viewport, className))}
    >
      {typeof children === "function" ? (
        toasts.map((item) => children(item))
      ) : (
        <>
          {children}
          {toasts.map((item) => (
            <ToastRoot key={item.id} toast={item} {...(classNames ? { classNames } : {})} />
          ))}
        </>
      )}
    </Base.Viewport>
  );

  return shouldPortal ? <Base.Portal container={container}>{viewport}</Base.Portal> : viewport;
}

export type ToastProviderProps = Base.Provider.Props & {
  /** Automatically mounts a `Toast.Viewport` unless `false` or a `Toast.Viewport` child is present. */
  viewport?: boolean;
  placement?: ToastPlacement;
  inline?: boolean;
  portal?: boolean;
  container?: Base.Portal.Props["container"];
  label?: string;
  classNames?: ToastClassNames;
};

function ToastProvider({
  children,
  timeout = 5000,
  limit = 3,
  toastManager,
  viewport = true,
  placement,
  inline,
  portal,
  container,
  label,
  classNames,
}: ToastProviderProps) {
  const hasExplicitViewport = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === ToastViewport,
  );

  return (
    <Base.Provider timeout={timeout} limit={limit} {...(toastManager ? { toastManager } : {})}>
      {children}
      {viewport && !hasExplicitViewport ? (
        <ToastViewport
          {...(placement !== undefined ? { placement } : {})}
          {...(inline !== undefined ? { inline } : {})}
          {...(portal !== undefined ? { portal } : {})}
          {...(container !== undefined ? { container } : {})}
          {...(label !== undefined ? { label } : {})}
          {...(classNames !== undefined ? { classNames } : {})}
        />
      ) : null}
    </Base.Provider>
  );
}

export type ToastTitleProps = ComponentProps<"div">;
function ToastTitle({ className, ...props }: ToastTitleProps) {
  return <div {...props} {...kb("toast-title", {}, className)} />;
}

export type ToastDescriptionProps = ComponentProps<"div">;
function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return <div {...props} {...kb("toast-description", {}, className)} />;
}

export type ToastActionProps = ComponentProps<"button">;
function ToastAction({ className, type = "button", ...props }: ToastActionProps) {
  return <button type={type} {...props} {...kb("toast-action", {}, className)} />;
}

export type ToastCloseProps = ComponentProps<"button"> & {
  label?: string;
};
function ToastClose({
  className,
  type = "button",
  label = "Dismiss notification",
  children,
  ...props
}: ToastCloseProps) {
  return (
    <button
      type={type}
      aria-label={props["aria-label"] ?? label}
      {...props}
      {...kb("toast-close", {}, className)}
    >
      {children ?? <CloseIcon />}
    </button>
  );
}

/** Non-modal notification for asynchronous completion, background progress, and recoverable action failures. */
export const Toast = Object.assign(ToastRoot, {
  Provider: ToastProvider,
  Viewport: ToastViewport,
  Root: ToastRoot,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Close: ToastClose,
  useToastManager,
  createToastManager,
});
