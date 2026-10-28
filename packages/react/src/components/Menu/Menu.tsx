import { Menu as Base } from "@base-ui/react/menu";
import { Separator } from "@base-ui/react/separator";
import { clsx } from "clsx";
import { createContext, useContext, useEffect, useState } from "react";

const PointerFocus = createContext(false);

export type MenuProps = Base.Root.Props;
export type MenuTriggerProps = Base.Trigger.Props;
export type MenuItemProps = Omit<Base.Item.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
};
export type MenuSeparatorProps = Omit<Separator.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
};
export type MenuContentProps = Omit<Base.Popup.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
  /** Portal target; pass the consumer theme host for nested themes. */
  container?: Base.Portal.Props["container"];
  /** Side of the trigger the popup prefers. */
  side?: Base.Positioner.Props["side"];
  /** Alignment along that side. */
  align?: Base.Positioner.Props["align"];
};

function MenuRoot({ onOpenChange, ...props }: MenuProps) {
  const [pointerFocus, setPointerFocus] = useState(false);
  useEffect(() => {
    if (!pointerFocus) return;
    const keyboard = () => setPointerFocus(false);
    document.addEventListener("keydown", keyboard, { capture: true, once: true });
    return () => document.removeEventListener("keydown", keyboard, true);
  }, [pointerFocus]);
  return (
    <PointerFocus.Provider value={pointerFocus}>
      <Base.Root
        {...props}
        onOpenChange={(open, details) => {
          const event = details.event;
          setPointerFocus(
            /^(pointer|mouse|touch|click)/.test(event.type) &&
              !(event.type === "click" && "detail" in event && event.detail === 0),
          );
          onOpenChange?.(open, details);
        }}
      />
    </PointerFocus.Provider>
  );
}

function MenuTrigger(props: MenuTriggerProps) {
  const pointerFocus = useContext(PointerFocus);
  return (
    <Base.Trigger
      {...props}
      data-kb-menu-trigger=""
      data-pointer-focus={pointerFocus || undefined}
    />
  );
}

function MenuContent({
  side = "bottom",
  align = "start",
  className,
  container,
  ...props
}: MenuContentProps) {
  return (
    <Base.Portal container={container}>
      <Base.Positioner side={side} align={align} sideOffset={6}>
        <Base.Popup {...props} className={clsx("kb-menu", className)} />
      </Base.Positioner>
    </Base.Portal>
  );
}

function MenuItem({ className, ...props }: MenuItemProps) {
  return <Base.Item {...props} className={clsx("kb-menu-item", className)} />;
}

function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  return <Separator {...props} className={clsx("kb-menu-separator", className)} />;
}

export const Menu = Object.assign(MenuRoot, {
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  Separator: MenuSeparator,
});
