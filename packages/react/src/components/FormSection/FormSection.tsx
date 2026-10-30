import { clsx } from "clsx";
import { type ComponentProps, type ReactNode, useId } from "react";
import { type ClassNames, kb, resolveInvalid } from "../../utils/kb";
import { FormActions, type FormActionsAlign } from "../FormActions/FormActions";
import { Heading } from "../Heading/Heading";

export type FormSectionLayout = "stack" | "split";
export type FormSectionHeadingLevel = 2 | 3 | 4 | 5 | 6;
export type FormSectionPart =
  | "header"
  | "title"
  | "description"
  | "body"
  | "fields"
  | "error"
  | "actions";

export interface FormSectionProps extends Omit<ComponentProps<"fieldset">, "title"> {
  /** Section heading; also names the group. */
  title: ReactNode;
  /** Heading rank; follow the page hierarchy. */
  headingLevel?: FormSectionHeadingLevel | undefined;
  /** Supporting context for the grouped fields. */
  description?: ReactNode | undefined;
  /** Section-level validation error. */
  error?: ReactNode | undefined;
  /** Buttons for this section, after the fields in Tab order. */
  actions?: ReactNode | undefined;
  /** Alignment of the actions row. */
  actionsAlign?: FormActionsAlign | undefined;
  /** Heading beside or above fields; unset follows the enclosing intent. */
  layout?: FormSectionLayout | undefined;
  /** Classes for inner parts, keyed by part. */
  classNames?: ClassNames<FormSectionPart> | undefined;
}

/** Named group of related fields with its heading, error and actions. */
export const FormSection = ({
  ref,
  title,
  headingLevel = 2,
  description,
  error,
  actions,
  actionsAlign = "end",
  layout,
  disabled,
  className,
  classNames,
  children,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": callerAriaInvalid,
  ...props
}: FormSectionProps) => {
  const reactId = useId();
  const baseId = props.id ?? `kb-formsection-${reactId}`;
  const hasError = Boolean(error);
  const { invalid, ariaInvalid } = resolveInvalid(hasError, callerAriaInvalid);
  const titleId = `${baseId}-title`;
  const descriptionId = description ? `${baseId}-description` : undefined;
  const errorId = hasError ? `${baseId}-error` : undefined;
  const describedBy =
    [descriptionId, errorId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  return (
    // Heading names the group: a rendered legend cannot join the split layout.
    <fieldset
      aria-labelledby={props["aria-label"] ? undefined : titleId}
      {...props}
      ref={ref}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      aria-describedby={describedBy}
      {...kb("formsection", { layout, disabled: Boolean(disabled), invalid }, className)}
    >
      <div className={clsx("kb-formsection-header", classNames?.header)}>
        <Heading
          level={headingLevel}
          size="md"
          id={titleId}
          className={clsx("kb-formsection-title", classNames?.title)}
        >
          {title}
        </Heading>
        {description ? (
          <p
            id={descriptionId}
            className={clsx("kb-formsection-description", classNames?.description)}
          >
            {description}
          </p>
        ) : null}
      </div>
      <div className={clsx("kb-formsection-body", classNames?.body)}>
        <div className={clsx("kb-formsection-fields", classNames?.fields)}>{children}</div>
        {hasError ? (
          <div id={errorId} className={clsx("kb-formsection-error", classNames?.error)}>
            {error}
          </div>
        ) : null}
        {actions ? (
          <FormActions
            align={actionsAlign}
            className={clsx("kb-formsection-actions", classNames?.actions)}
          >
            {actions}
          </FormActions>
        ) : null}
      </div>
    </fieldset>
  );
};
