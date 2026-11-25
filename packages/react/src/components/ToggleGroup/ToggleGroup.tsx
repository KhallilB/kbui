import { DirectionProvider } from "@base-ui/react/direction-provider";
import { ToggleGroup as Base } from "@base-ui/react/toggle-group";
import { Toolbar } from "@base-ui/react/toolbar";
import { type KeyboardEvent, type Ref, useContext, useLayoutEffect, useRef, useState } from "react";
import { kb } from "../../utils/kb";
import { ToolbarFocusContext } from "../Toolbar/Toolbar";

type ManagedProp = "aria-orientation" | "multiple" | "render" | "role";

export type ToggleGroupProps<Value extends string = string> = Omit<
  Base.Props<Value>,
  "className" | ManagedProp
> &
  Partial<Record<ManagedProp, never>> & {
    /** Extra class on the group. */
    className?: string | undefined;
    /** Ref to the underlying group. */
    ref?: Ref<HTMLDivElement> | undefined;
  };

function moveToBoundary(event: KeyboardEvent<HTMLDivElement>) {
  const { altKey, ctrlKey, metaKey, shiftKey, key, currentTarget } = event;
  if (altKey || ctrlKey || metaKey || shiftKey || (key !== "Home" && key !== "End")) return;

  const options = Array.from(
    currentTarget.querySelectorAll<HTMLButtonElement>(".kb-togglebutton:enabled"),
  ).filter((button) => button.closest(".kb-togglegroup") === currentTarget);
  const option = key === "Home" ? options[0] : options.at(-1);
  if (!option) return;

  event.preventDefault();
  event.stopPropagation();
  option.focus();
}

/** A named group of independently pressed toggle buttons with arrow-key navigation. */
export function ToggleGroup<Value extends string = string>({
  className,
  dir,
  disabled,
  loopFocus,
  onKeyDown,
  orientation = "horizontal",
  ref,
  "aria-orientation": _ariaOrientation,
  render: _render,
  role: _role,
  ...props
}: ToggleGroupProps<Value>) {
  const withinToolbar = useContext(ToolbarFocusContext);
  const root = useRef<HTMLDivElement>(null);
  const [inheritedDirection, setInheritedDirection] = useState<"ltr" | "rtl">("ltr");
  const explicitDirection = dir === "rtl" || dir === "ltr" ? dir : undefined;

  useLayoutEffect(() => {
    const element = root.current;
    if (withinToolbar || explicitDirection || !element) return;

    const syncDirection = () => setInheritedDirection(element.matches(":dir(rtl)") ? "rtl" : "ltr");
    syncDirection();
    const observer = new MutationObserver(syncDirection);
    for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
      observer.observe(ancestor, { attributeFilter: ["dir"] });
    }
    return () => observer.disconnect();
  }, [explicitDirection, withinToolbar]);

  const group = (
    <Base
      {...props}
      ref={ref}
      disabled={disabled}
      dir={dir}
      orientation={orientation}
      multiple
      onKeyDown={
        withinToolbar
          ? onKeyDown
          : (event) => {
              onKeyDown?.(event);
              if (!event.defaultPrevented && !event.baseUIHandlerPrevented) moveToBoundary(event);
            }
      }
      render={<div ref={root} />}
      {...kb("togglegroup", { orientation }, className)}
    />
  );

  if (withinToolbar) return group;

  return (
    <DirectionProvider direction={explicitDirection ?? inheritedDirection}>
      {/* Toolbar supplies the disabled-item registry for the group's single tab stop. */}
      <Toolbar.Root
        disabled={disabled}
        loopFocus={loopFocus}
        orientation={orientation}
        role="group"
        aria-orientation={undefined}
        render={group}
      />
    </DirectionProvider>
  );
}
