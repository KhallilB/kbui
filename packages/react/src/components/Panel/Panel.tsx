import { Collapsible } from "@base-ui/react/collapsible";
import { clsx } from "clsx";
import { type ComponentProps, createContext, type Ref, useContext } from "react";
import { kb } from "../../utils/kb";

export type PanelTone = "quiet" | "default" | "sunken" | "active" | "critical";
export type PanelRail = "none" | "accent" | "status";
export type PanelDensity = "compact" | "standard";
export type PanelGroupDirection = "row" | "column";

/** Name the region with aria-labelledby pointing at the heading inside Panel.Header. */
export type PanelProps = ComponentProps<"section"> & {
  /** Plane weight: quiet has no seam, sunken recesses, active lifts, critical warns. */
  tone?: PanelTone;
  /** Inline-start rail: accent is always accent; status follows the tone. */
  rail?: PanelRail;
  /** Padding scale. */
  density?: PanelDensity;
  /** Makes Panel.Body collapse and expand from Panel.Toggle. */
  collapsible?: boolean;
  /** Controlled open state; collapsible only. */
  open?: boolean;
  /** Initial open state; collapsible only. */
  defaultOpen?: boolean;
  /** Called when the toggle changes the open state; collapsible only. */
  onOpenChange?: (open: boolean) => void;
};
export type PanelHeaderProps = ComponentProps<"header">;
export type PanelToolbarProps = ComponentProps<"div">;
export type PanelBodyProps = ComponentProps<"div">;
export type PanelFooterProps = ComponentProps<"footer">;
export type PanelWellProps = ComponentProps<"div">;
export type PanelToggleProps = Omit<Collapsible.Trigger.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
};
export type PanelGroupProps = ComponentProps<"div"> & {
  /** Flow of the panels inside the group. */
  direction?: PanelGroupDirection;
};

const NestedContext = createContext(false);
const CollapsibleContext = createContext(false);

function PanelRoot({
  tone = "default",
  rail = "none",
  density = "standard",
  collapsible = false,
  open,
  defaultOpen,
  onOpenChange,
  className,
  children,
  ref,
  ...props
}: PanelProps) {
  const nested = useContext(NestedContext);
  const attrs = kb("panel", { tone, rail, density, nested, collapsible }, className);
  const content = (
    <NestedContext value={true}>
      <CollapsibleContext value={collapsible}>
        <span className="kb-panel-glow" aria-hidden="true" />
        <span className="kb-panel-plate" aria-hidden="true">
          {rail !== "none" ? <span className="kb-panel-rail" /> : null}
        </span>
        {children}
      </CollapsibleContext>
    </NestedContext>
  );
  if (!collapsible) {
    return (
      <section {...props} ref={ref} {...attrs}>
        {content}
      </section>
    );
  }
  return (
    <Collapsible.Root
      {...props}
      // Base UI types the root as a div; render swaps in the section.
      ref={ref as Ref<HTMLDivElement>}
      {...(open !== undefined ? { open } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange ? { onOpenChange: (next: boolean) => onOpenChange(next) } : {})}
      render={<section />}
      {...attrs}
    >
      {content}
    </Collapsible.Root>
  );
}

function PanelHeader({ className, ...props }: PanelHeaderProps) {
  return <header {...props} className={clsx("kb-panel-header", className)} />;
}

function PanelToolbar({ className, ...props }: PanelToolbarProps) {
  return <div {...props} className={clsx("kb-panel-toolbar", className)} />;
}

function PanelBody({ className, ...props }: PanelBodyProps) {
  const collapsible = useContext(CollapsibleContext);
  const merged = clsx("kb-panel-body", className);
  if (collapsible) return <Collapsible.Panel {...props} className={merged} />;
  return <div {...props} className={merged} />;
}

function PanelFooter({ className, ...props }: PanelFooterProps) {
  return <footer {...props} className={clsx("kb-panel-footer", className)} />;
}

function PanelWell({ className, ...props }: PanelWellProps) {
  return <div {...props} className={clsx("kb-panel-well", className)} />;
}

function PanelToggle({ className, ...props }: PanelToggleProps) {
  return <Collapsible.Trigger {...props} className={clsx("kb-panel-toggle", className)} />;
}

function PanelGroup({ direction = "column", className, ...props }: PanelGroupProps) {
  return <div {...props} {...kb("panel-group", { direction }, className)} />;
}

export const Panel = Object.assign(PanelRoot, {
  Header: PanelHeader,
  Toolbar: PanelToolbar,
  Body: PanelBody,
  Footer: PanelFooter,
  Well: PanelWell,
  Toggle: PanelToggle,
  Group: PanelGroup,
});
