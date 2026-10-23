import { Collapsible } from "@base-ui/react/collapsible";
import { clsx } from "clsx";
import { type ComponentProps, createContext, type Ref, useContext } from "react";
import { kb } from "../../utils/kb";

export type FacetTone = "quiet" | "default" | "active" | "critical";
export type FacetCut = "none" | "start" | "end" | "both";
export type FacetRail = "none" | "accent" | "status";
export type FacetDensity = "compact" | "standard";
export type FacetGroupDirection = "row" | "column";

/** Name the region with aria-labelledby pointing at the heading inside Facet.Header. */
export type FacetProps = ComponentProps<"section"> & {
  /** Plane weight: quiet has no seam, active lifts, critical warns. */
  tone?: FacetTone;
  /** Which corners the decorative clip removes; the root itself is never clipped. */
  cut?: FacetCut;
  /** Inline-start rail: accent is always accent; status follows the tone. */
  rail?: FacetRail;
  /** Padding scale. */
  density?: FacetDensity;
  /** Makes Facet.Body a collapsible panel driven by Facet.Toggle. */
  collapsible?: boolean;
  /** Controlled open state; collapsible only. */
  open?: boolean;
  /** Initial open state; collapsible only. */
  defaultOpen?: boolean;
  /** Called when the toggle changes the open state; collapsible only. */
  onOpenChange?: (open: boolean) => void;
};
export type FacetHeaderProps = ComponentProps<"header">;
export type FacetToolbarProps = ComponentProps<"div">;
export type FacetBodyProps = ComponentProps<"div">;
export type FacetFooterProps = ComponentProps<"footer">;
export type FacetToggleProps = Omit<Collapsible.Trigger.Props, "className"> & {
  /** Plain class string; Base UI's function form is not supported. */
  className?: string;
};
export type FacetGroupProps = ComponentProps<"div"> & {
  /** Flow of the facets inside the group. */
  direction?: FacetGroupDirection;
};

const NestedContext = createContext(false);
const CollapsibleContext = createContext(false);

function FacetRoot({
  tone = "default",
  cut = "none",
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
}: FacetProps) {
  const nested = useContext(NestedContext);
  const attrs = kb("facet", { tone, cut, rail, density, nested, collapsible }, className);
  const content = (
    <NestedContext value={true}>
      <CollapsibleContext value={collapsible}>
        {rail !== "none" ? <span className="kb-facet-rail" aria-hidden="true" /> : null}
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

function FacetHeader({ className, ...props }: FacetHeaderProps) {
  return <header {...props} className={clsx("kb-facet-header", className)} />;
}

function FacetToolbar({ className, ...props }: FacetToolbarProps) {
  return <div {...props} className={clsx("kb-facet-toolbar", className)} />;
}

function FacetBody({ className, ...props }: FacetBodyProps) {
  const collapsible = useContext(CollapsibleContext);
  const merged = clsx("kb-facet-body", className);
  if (collapsible) return <Collapsible.Panel {...props} className={merged} />;
  return <div {...props} className={merged} />;
}

function FacetFooter({ className, ...props }: FacetFooterProps) {
  return <footer {...props} className={clsx("kb-facet-footer", className)} />;
}

function FacetToggle({ className, ...props }: FacetToggleProps) {
  return <Collapsible.Trigger {...props} className={clsx("kb-facet-toggle", className)} />;
}

function FacetGroup({ direction = "column", className, ...props }: FacetGroupProps) {
  return <div {...props} {...kb("facet-group", { direction }, className)} />;
}

export const Facet = Object.assign(FacetRoot, {
  Header: FacetHeader,
  Toolbar: FacetToolbar,
  Body: FacetBody,
  Footer: FacetFooter,
  Toggle: FacetToggle,
  Group: FacetGroup,
});
