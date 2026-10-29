import { Popover as Base } from "@base-ui/react/popover";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type PopoverProps = Base.Root.Props;
export type PopoverTriggerProps = Base.Trigger.Props;
export type PopoverCloseProps = Base.Close.Props;
export type PopoverSectionProps = ComponentProps<"div">;
export type PopoverTitleProps = Omit<Base.Title.Props, "className"> & {
  /** Plain class string on title. */
  className?: string | undefined;
};
export type PopoverDescriptionProps = Omit<Base.Description.Props, "className"> & {
  /** Plain class string on description. */
  className?: string | undefined;
};
export type PopoverContentProps = Omit<Base.Popup.Props, "className" | "title"> & {
  /** Accessible name; omit when composing Popover.Title. */
  title?: ReactNode;
  /** Accessible description; omit when composing Popover.Description. */
  description?: ReactNode;
  /** Plain class string on popup. */
  className?: string | undefined;
  /** Portal target; pass nested theme host when needed. */
  container?: Base.Portal.Props["container"];
  /** Preferred side; collision handling may flip it. */
  side?: Base.Positioner.Props["side"];
  /** Alignment relative to trigger. */
  align?: Base.Positioner.Props["align"];
  /** Gap between trigger and popup, in CSS pixels. */
  sideOffset?: Base.Positioner.Props["sideOffset"];
  /** Advanced positioning, including collision boundary, padding and anchor. */
  positionerProps?:
    | Omit<Base.Positioner.Props, "children" | "className" | "side" | "align" | "sideOffset">
    | undefined;
  /** Classes for inner positioner. */
  classNames?: ClassNames<"positioner"> | undefined;
};

function PopoverRoot(props: PopoverProps) {
  return <Base.Root {...props} />;
}
function PopoverTrigger(props: PopoverTriggerProps) {
  return <Base.Trigger {...props} />;
}
function PopoverClose(props: PopoverCloseProps) {
  return <Base.Close {...props} />;
}
function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return <Base.Title {...props} {...kb("popover-title", {}, className)} />;
}
function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return <Base.Description {...props} {...kb("popover-description", {}, className)} />;
}
function PopoverHeader({ className, ...props }: PopoverSectionProps) {
  return <div {...props} {...kb("popover-header", {}, className)} />;
}
function PopoverBody({ className, ...props }: PopoverSectionProps) {
  return <div {...props} {...kb("popover-body", {}, className)} />;
}
function PopoverFooter({ className, ...props }: PopoverSectionProps) {
  return <div {...props} {...kb("popover-footer", {}, className)} />;
}
function PopoverContent({
  title,
  description,
  container,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  positionerProps,
  classNames,
  className,
  children,
  ...props
}: PopoverContentProps) {
  const hasTitle = title != null && title !== "";
  const hasDescription = description != null && description !== "";
  return (
    <Base.Portal container={container}>
      <Base.Positioner
        {...positionerProps}
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={clsx("kb-popover-positioner", classNames?.positioner)}
      >
        <Base.Popup {...props} {...kb("popover", {}, className)}>
          {hasTitle || hasDescription ? (
            <PopoverHeader>
              {hasTitle ? <PopoverTitle>{title}</PopoverTitle> : null}
              {hasDescription ? <PopoverDescription>{description}</PopoverDescription> : null}
            </PopoverHeader>
          ) : null}
          {children}
        </Base.Popup>
      </Base.Positioner>
    </Base.Portal>
  );
}

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverClose,
  Header: PopoverHeader,
  Body: PopoverBody,
  Footer: PopoverFooter,
});
