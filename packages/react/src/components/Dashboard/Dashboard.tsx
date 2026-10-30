import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type DashboardPart = "header" | "metrics" | "panels" | "primary" | "secondary";

export interface DashboardProps extends Omit<ComponentProps<"div">, "children"> {
  /** Page title, freshness and page actions; usually a PageHeader. */
  header?: ReactNode | undefined;
  /** Row of headline metrics below the header. */
  metrics?: ReactNode | undefined;
  /** Main panels; take two thirds beside secondary on wide pages. */
  primary?: ReactNode | undefined;
  /** Supporting panels; move below primary on narrow pages. */
  secondary?: ReactNode | undefined;
  /** Classes for inner regions, keyed by region. */
  classNames?: ClassNames<DashboardPart> | undefined;
}

/** Layout intent for an overview page: header, metrics, then primary and secondary panels. */
export const Dashboard = ({
  ref,
  header,
  metrics,
  primary,
  secondary,
  className,
  classNames,
  ...props
}: DashboardProps) => (
  <div {...props} ref={ref} {...kb("dashboard", {}, className)}>
    {header ? (
      <div className={clsx("kb-dashboard-header", classNames?.header)}>{header}</div>
    ) : null}
    {metrics ? (
      <div className={clsx("kb-dashboard-metrics", classNames?.metrics)}>{metrics}</div>
    ) : null}
    {primary || secondary ? (
      <div className={clsx("kb-dashboard-panels", classNames?.panels)}>
        {primary ? (
          <div className={clsx("kb-dashboard-primary", classNames?.primary)}>{primary}</div>
        ) : null}
        {secondary ? (
          <div className={clsx("kb-dashboard-secondary", classNames?.secondary)}>{secondary}</div>
        ) : null}
      </div>
    ) : null}
  </div>
);
