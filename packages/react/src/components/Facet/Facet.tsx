import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { kb } from "../../utils/kb";

export type FacetTone = "quiet" | "default" | "active" | "critical";
export type FacetCut = "none" | "start" | "end";
export type FacetRail = "none" | "accent" | "status";
export type FacetDensity = "compact" | "standard";

/** Name the region with aria-labelledby pointing at the heading inside Facet.Header. */
export type FacetProps = ComponentProps<"section"> & {
  /** Plane weight: quiet has no seam, active lifts, critical warns. */
  tone?: FacetTone;
  /** Which corner the decorative clip removes; the root itself is never clipped. */
  cut?: FacetCut;
  /** Inline-start rail: accent is always accent; status follows the tone. */
  rail?: FacetRail;
  /** Padding scale. */
  density?: FacetDensity;
};
export type FacetHeaderProps = ComponentProps<"header">;
export type FacetBodyProps = ComponentProps<"div">;
export type FacetFooterProps = ComponentProps<"footer">;

function FacetRoot({
  tone = "default",
  cut = "none",
  rail = "none",
  density = "standard",
  className,
  children,
  ...props
}: FacetProps) {
  return (
    <section {...props} {...kb("facet", { tone, cut, rail, density }, className)}>
      {rail !== "none" ? <span className="kb-facet-rail" aria-hidden="true" /> : null}
      {children}
    </section>
  );
}

function FacetHeader({ className, ...props }: FacetHeaderProps) {
  return <header {...props} className={clsx("kb-facet-header", className)} />;
}

function FacetBody({ className, ...props }: FacetBodyProps) {
  return <div {...props} className={clsx("kb-facet-body", className)} />;
}

function FacetFooter({ className, ...props }: FacetFooterProps) {
  return <footer {...props} className={clsx("kb-facet-footer", className)} />;
}

export const Facet = Object.assign(FacetRoot, {
  Header: FacetHeader,
  Body: FacetBody,
  Footer: FacetFooter,
});
