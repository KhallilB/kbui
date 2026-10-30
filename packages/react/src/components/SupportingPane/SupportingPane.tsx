import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type SupportingPanePart = "main" | "aside";

export interface SupportingPaneProps extends ComponentProps<"div"> {
  /** Supporting content, such as an order summary; moves below main at compact size. */
  aside?: ReactNode | undefined;
  /** Accessible name for the aside landmark. */
  asideLabel?: string | undefined;
  /** Id of a visible heading that names the aside; preferred over `asideLabel`. */
  asideLabelledBy?: string | undefined;
  /** Classes for inner regions, keyed by region. */
  classNames?: ClassNames<SupportingPanePart> | undefined;
}

/** Layout intent for a main column with a complementary aside beside it, or below it when narrow. */
export const SupportingPane = ({
  ref,
  aside,
  asideLabel,
  asideLabelledBy,
  className,
  classNames,
  children,
  ...props
}: SupportingPaneProps) => (
  <div {...props} ref={ref} {...kb("supportingpane", {}, className)}>
    <div className={clsx("kb-supportingpane-main", classNames?.main)}>{children}</div>
    {aside ? (
      <aside
        className={clsx("kb-supportingpane-aside", classNames?.aside)}
        aria-label={asideLabelledBy ? undefined : asideLabel}
        aria-labelledby={asideLabelledBy}
      >
        {aside}
      </aside>
    ) : null}
  </div>
);
