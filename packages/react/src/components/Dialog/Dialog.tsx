import { Dialog as Base } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import type { ClassNames } from "../../utils/kb";

export type DialogProps = Base.Root.Props;
export type DialogTriggerProps = Base.Trigger.Props;
export type DialogCloseProps = Base.Close.Props;
export type DialogTitleProps = Omit<Base.Title.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
};
export type DialogDescriptionProps = Omit<Base.Description.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
};
export type DialogActionsProps = ComponentProps<"div">;
export type DialogSectionProps = ComponentProps<"div">;

export type DialogContentProps = Omit<Base.Popup.Props, "className" | "title"> & {
  /** Centered dialog or inline-end drawer with independently scrolling Body. */
  layout?: "center" | "drawer";
  /** Accessible name; mutually exclusive with a composed Dialog.Title. */
  title?: ReactNode;
  /** Accessible description; mutually exclusive with a composed Dialog.Description. */
  description?: ReactNode;
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
  /** Portal target; defaults to document.body. */
  container?: Base.Portal.Props["container"];
  /** Classes for inner parts, keyed by part. */
  classNames?: ClassNames<"backdrop">;
};

function DialogRoot(props: DialogProps) {
  return <Base.Root {...props} />;
}

function DialogTrigger(props: DialogTriggerProps) {
  return <Base.Trigger {...props} />;
}

function DialogClose(props: DialogCloseProps) {
  return <Base.Close {...props} />;
}

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return <Base.Title {...props} className={clsx("kb-dialog-title", className)} />;
}

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return <Base.Description {...props} className={clsx("kb-dialog-description", className)} />;
}

function DialogActions({ className, ...props }: DialogActionsProps) {
  return <div {...props} className={clsx("kb-dialog-actions", className)} />;
}

function DialogHeader({ className, ...props }: DialogSectionProps) {
  return <div {...props} className={clsx("kb-dialog-header", className)} />;
}
function DialogBody({ className, ...props }: DialogSectionProps) {
  return <div {...props} className={clsx("kb-dialog-body", className)} />;
}
function DialogFooter({ className, ...props }: DialogSectionProps) {
  return <div {...props} className={clsx("kb-dialog-footer", className)} />;
}

function DialogContent({
  layout = "center",
  classNames,
  title,
  description,
  container,
  children,
  className,
  ...props
}: DialogContentProps) {
  const hasTitle = title != null && title !== "";
  const hasDescription = description != null && description !== "";
  const heading = (
    <>
      {hasTitle ? <DialogTitle>{title}</DialogTitle> : null}
      {hasDescription ? <DialogDescription>{description}</DialogDescription> : null}
    </>
  );
  return (
    <Base.Portal container={container}>
      <Base.Backdrop className={clsx("kb-dialog-backdrop", classNames?.backdrop)} />
      <Base.Popup {...props} data-layout={layout} className={clsx("kb-dialog-popup", className)}>
        {layout === "drawer" && (hasTitle || hasDescription) ? (
          <DialogHeader>{heading}</DialogHeader>
        ) : (
          heading
        )}
        {children}
      </Base.Popup>
    </Base.Portal>
  );
}

export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
  Actions: DialogActions,
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter,
});
