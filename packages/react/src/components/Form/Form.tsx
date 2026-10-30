import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { type ClassNames, kb } from "../../utils/kb";
import { FormActions, type FormActionsAlign } from "../FormActions/FormActions";

export type FormWidth = "sm" | "md" | "full";
export type FormPart = "header" | "body" | "actions";

export interface FormProps extends ComponentProps<"form"> {
  /** Title and intro above the fields, such as a heading or PageHeader. */
  header?: ReactNode | undefined;
  /** The task's submit button first, then secondary actions. */
  actions?: ReactNode | undefined;
  /** Alignment of the actions row above the compact width. */
  actionsAlign?: FormActionsAlign | undefined;
  /** Maximum inline size: sm 32rem, md 40rem or full. */
  width?: FormWidth | undefined;
  /** Classes for inner regions, keyed by region. */
  classNames?: ClassNames<FormPart> | undefined;
}

/** Layout intent for one task: header, grouped fields, then its actions. */
export const Form = ({
  ref,
  header,
  actions,
  actionsAlign = "end",
  width = "md",
  className,
  classNames,
  children,
  ...props
}: FormProps) => (
  <form {...props} ref={ref} {...kb("form", { width }, className)}>
    {header ? <div className={clsx("kb-form-header", classNames?.header)}>{header}</div> : null}
    <div className={clsx("kb-form-body", classNames?.body)}>{children}</div>
    {actions ? (
      <FormActions
        align={actionsAlign}
        divider
        className={clsx("kb-form-actions", classNames?.actions)}
      >
        {actions}
      </FormActions>
    ) : null}
  </form>
);
