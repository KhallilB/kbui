import { Menu as Base } from "@base-ui/react/menu";
import { Separator } from "@base-ui/react/separator";
import { clsx } from "clsx";

export type MenuProps = Base.Root.Props;
export type MenuTriggerProps = Base.Trigger.Props;
export type MenuItemProps = Omit<Base.Item.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
};
export type MenuContentProps = Omit<Base.Popup.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
  /** Side of the trigger the popup prefers. */
  side?: Base.Positioner.Props["side"];
  /** Alignment along that side. */
  align?: Base.Positioner.Props["align"];
};

function MenuRoot(props: MenuProps) {
  return <Base.Root {...props} />;
}

function MenuTrigger(props: MenuTriggerProps) {
  return <Base.Trigger {...props} />;
}

function MenuContent({ side = "bottom", align = "start", className, ...props }: MenuContentProps) {
  return (
    <Base.Portal>
      <Base.Positioner side={side} align={align} sideOffset={6}>
        <Base.Popup {...props} className={clsx("kb-menu", className)} />
      </Base.Positioner>
    </Base.Portal>
  );
}

function MenuItem({ className, ...props }: MenuItemProps) {
  return <Base.Item {...props} className={clsx("kb-menu-item", className)} />;
}

function MenuSeparator() {
  return <Separator className="kb-menu-separator" />;
}

export const Menu = Object.assign(MenuRoot, {
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  Separator: MenuSeparator,
});
