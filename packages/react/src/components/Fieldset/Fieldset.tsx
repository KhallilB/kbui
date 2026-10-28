import { clsx } from "clsx";
import { type ComponentProps, type ReactNode, useId } from "react";
import { type ClassNames, kb, resolveInvalid } from "../../utils/kb";

export type FieldsetPart = "legend" | "description" | "fields" | "error";

export interface FieldsetProps extends ComponentProps<"fieldset"> {
  /** Group heading rendered inside the native legend element. */
  legend: ReactNode;
  /** Hide the legend visually while keeping the accessible group name. */
  visuallyHidden?: boolean | undefined;
  /** Supporting context explaining the grouped fields. */
  description?: ReactNode | undefined;
  /** Group-level validation error message. */
  error?: ReactNode | undefined;
  /** Classes for the legend, description, fields and error slots. */
  classNames?: ClassNames<FieldsetPart> | undefined;
}

/** Semantic fieldset and legend section that groups related form controls. */
export const Fieldset = ({
  ref,
  legend,
  visuallyHidden,
  description,
  error,
  disabled,
  className,
  classNames,
  children,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": callerAriaInvalid,
  ...props
}: FieldsetProps) => {
  const reactId = useId();
  const baseId = props.id ?? `kb-fieldset-${reactId}`;
  const hasError = Boolean(error);
  const { invalid, ariaInvalid } = resolveInvalid(hasError, callerAriaInvalid);
  const descriptionId = description ? `${baseId}-description` : undefined;
  const errorId = hasError ? `${baseId}-error` : undefined;
  const describedBy =
    [descriptionId, errorId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset
      {...props}
      ref={ref}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      aria-describedby={describedBy}
      {...kb("fieldset", { disabled: Boolean(disabled), invalid }, className)}
    >
      <legend
        className={clsx("kb-fieldset-legend", visuallyHidden && "kb-sr-only", classNames?.legend)}
      >
        {legend}
      </legend>
      {description ? (
        <p id={descriptionId} className={clsx("kb-fieldset-description", classNames?.description)}>
          {description}
        </p>
      ) : null}
      <div className={clsx("kb-fieldset-fields", classNames?.fields)}>{children}</div>
      {hasError ? (
        <div id={errorId} className={clsx("kb-fieldset-error", classNames?.error)}>
          {error}
        </div>
      ) : null}
    </fieldset>
  );
};
