import { Dialog as Base } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import type { ReactNode } from "react";

export type DialogProps = Base.Root.Props;
export type DialogTriggerProps = Base.Trigger.Props;
export type DialogCloseProps = Base.Close.Props;

export type DialogContentProps = Omit<Base.Popup.Props, "className"> & {
  /** Accessible name; omit and compose Dialog.Title yourself. */
  title?: ReactNode;
  /** Accessible description; omit and compose Dialog.Description yourself. */
  description?: ReactNode;
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
};

function Root(props: DialogProps) {
  return <Base.Root {...props} />;
}

function Trigger(props: DialogTriggerProps) {
  return <Base.Trigger {...props} />;
}

function Close(props: DialogCloseProps) {
  return <Base.Close {...props} />;
}

function Title({
  className,
  ...props
}: Omit<Base.Title.Props, "className"> & { className?: string }) {
  return <Base.Title {...props} className={clsx("kb-dialog-title", className)} />;
}

function Description({
  className,
  ...props
}: Omit<Base.Description.Props, "className"> & { className?: string }) {
  return <Base.Description {...props} className={clsx("kb-dialog-description", className)} />;
}

function Content({ title, description, children, className, ...props }: DialogContentProps) {
  return (
    <Base.Portal>
      <Base.Backdrop className="kb-dialog-backdrop" />
      <Base.Popup {...props} className={clsx("kb-dialog-popup", className)}>
        {title ? <Title>{title}</Title> : null}
        {description ? <Description>{description}</Description> : null}
        <div className="kb-dialog-body">{children}</div>
      </Base.Popup>
    </Base.Portal>
  );
}

export const Dialog = Object.assign(Root, { Trigger, Content, Title, Description, Close });
