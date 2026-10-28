import type { ComponentProps } from "react";
import { kb } from "../../utils/kb";

export type FormActionsAlign = "end" | "start" | "between";

export interface FormActionsProps extends ComponentProps<"div"> {
  /** Horizontal alignment for form action buttons. */
  align?: FormActionsAlign | undefined;
  /** Add a top border and spacing above the action row. */
  divider?: boolean | undefined;
}

/** Wrapping action footer for form submit, reset and secondary buttons. */
export const FormActions = ({
  ref,
  align = "end",
  divider = false,
  className,
  children,
  ...props
}: FormActionsProps) => (
  <div {...props} ref={ref} {...kb("formactions", { align, divider }, className)}>
    {children}
  </div>
);
