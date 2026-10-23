import { Tooltip as Base } from "@base-ui/react/tooltip";
import type { ReactElement, ReactNode } from "react";

/** A visual hint only; the trigger still needs its own accessible name. */
export type TooltipProps = {
  /** Text shown in the popup. */
  content: ReactNode;
  /** The element that shows the tooltip on hover and focus. */
  children: ReactElement;
  /** Side of the trigger the popup prefers. */
  side?: Base.Positioner.Props["side"];
  /** Hover delay in ms before opening. */
  delay?: number;
};

export function Tooltip({ content, children, side = "top", delay = 400 }: TooltipProps) {
  return (
    <Base.Root>
      <Base.Trigger delay={delay} render={children} />
      <Base.Portal>
        <Base.Positioner side={side} sideOffset={6}>
          <Base.Popup className="kb-tooltip">{content}</Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
