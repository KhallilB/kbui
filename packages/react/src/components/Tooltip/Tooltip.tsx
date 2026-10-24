import { Tooltip as Base } from "@base-ui/react/tooltip";
import type { ReactElement, ReactNode } from "react";

/** A visual hint only; the trigger still needs its own accessible name. */
export type TooltipProps = {
  /** Text shown in the popup. */
  content: ReactNode;
  /** The element that shows the tooltip on hover and focus. */
  children: ReactElement;
  /** Portal target for nested consumer themes. */
  container?: Base.Portal.Props["container"];
  /** Plain class on popup slot. */
  className?: string;
  /** Side of the trigger the popup prefers. */
  side?: Base.Positioner.Props["side"];
  /** Hover delay in ms before opening. */
  delay?: number;
};

export function Tooltip({
  content,
  children,
  side = "top",
  delay = 400,
  container,
  className,
}: TooltipProps) {
  return (
    <Base.Root>
      <Base.Trigger delay={delay} render={children} />
      <Base.Portal container={container}>
        <Base.Positioner side={side} sideOffset={6}>
          <Base.Popup className={["kb-tooltip", className].filter(Boolean).join(" ")}>
            {content}
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
