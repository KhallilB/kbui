import { ScrollArea as Base } from "@base-ui/react/scroll-area";
import type { CSSProperties, ReactNode } from "react";
import { kb } from "../../utils/kb";

/** Scrolling region that keyboard users can reach: the viewport is a named, focusable region. */
export type ScrollAreaProps = Omit<Base.Root.Props, "className" | "children"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
  /** Accessible name of the region. */
  label: string;
  /** Height cap, any CSS length; content scrolls past it. */
  maxHeight?: string;
  /** Scrolled content. */
  children: ReactNode;
};

export function ScrollArea({
  label,
  maxHeight,
  className,
  style,
  children,
  ...props
}: ScrollAreaProps) {
  const vars = maxHeight ? ({ "--_scrollarea-max-height": maxHeight } as CSSProperties) : {};
  return (
    <Base.Root
      {...props}
      style={{ ...vars, ...(typeof style === "object" ? style : {}) }}
      {...kb("scrollarea", {}, className)}
    >
      <Base.Viewport
        className="kb-scrollarea-viewport"
        tabIndex={0}
        role="region"
        aria-label={label}
      >
        <Base.Content>{children}</Base.Content>
      </Base.Viewport>
      <Base.Scrollbar className="kb-scrollarea-scrollbar" orientation="vertical">
        <Base.Thumb className="kb-scrollarea-thumb" />
      </Base.Scrollbar>
    </Base.Root>
  );
}
