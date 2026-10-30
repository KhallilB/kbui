import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type SettingsPart = "header" | "sections";

export interface SettingsProps extends ComponentProps<"div"> {
  /** Page title and intro above the sections. */
  header?: ReactNode | undefined;
  /** Classes for inner regions, keyed by region. */
  classNames?: ClassNames<SettingsPart> | undefined;
}

/** Layout intent for sections of fields and managed lists, each saved on its own. */
export const Settings = ({
  ref,
  header,
  className,
  classNames,
  children,
  ...props
}: SettingsProps) => (
  <div {...props} ref={ref} {...kb("settings", {}, className)}>
    {header ? <div className={clsx("kb-settings-header", classNames?.header)}>{header}</div> : null}
    <div className={clsx("kb-settings-sections", classNames?.sections)}>{children}</div>
  </div>
);
