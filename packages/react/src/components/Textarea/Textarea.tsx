import { clsx } from "clsx";
import { type ComponentProps, useId } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type TextareaResize = "vertical" | "none" | "both";
export type TextareaPart = "label" | "control" | "description" | "error";

export interface TextareaProps extends Omit<ComponentProps<"textarea">, "children"> {
  /** Visible field label and accessible name. */
  label: string;
  /** Hide the label visually while keeping its accessible name. */
  visuallyHidden?: boolean | undefined;
  /** Supporting helper text below the textarea. */
  description?: string | undefined;
  /** Validation error message; marks the textarea invalid. */
  error?: string | undefined;
  /** Drag-resize axis for the native textarea. */
  resize?: TextareaResize | undefined;
  /** Callback fired with the next string value on change. */
  onValueChange?: ((value: string) => void) | undefined;
  /** Root wrapper class name. */
  className?: string | undefined;
  /** Classes for the label, control, description and error slots. */
  classNames?: ClassNames<TextareaPart> | undefined;
}

/** Labelled multiline text control with associated helper and error messages. */
export const Textarea = ({
  ref,
  id,
  label,
  visuallyHidden,
  description,
  error,
  resize = "vertical",
  rows = 4,
  disabled,
  readOnly,
  onChange,
  onValueChange,
  className,
  classNames,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: TextareaProps) => {
  const reactId = useId();
  const controlId = id ?? `kb-textarea-${reactId}`;
  const hasAriaInvalid =
    ariaInvalid !== undefined && ariaInvalid !== false && ariaInvalid !== "false";
  const invalid = Boolean(error) || hasAriaInvalid;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy =
    [descriptionId, errorId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  return (
    <div {...kb("textarea", { resize, invalid, disabled, readonly: readOnly }, className)}>
      <label
        htmlFor={controlId}
        className={clsx("kb-textarea-label", visuallyHidden && "kb-sr-only", classNames?.label)}
      >
        {label}
      </label>
      <textarea
        {...props}
        ref={ref}
        id={controlId}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={hasAriaInvalid ? ariaInvalid : invalid ? true : ariaInvalid}
        aria-describedby={describedBy}
        className={clsx("kb-textarea-control", classNames?.control)}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.currentTarget.value);
        }}
      />
      {description ? (
        <p id={descriptionId} className={clsx("kb-textarea-description", classNames?.description)}>
          {description}
        </p>
      ) : null}
      {error ? (
        <div id={errorId} className={clsx("kb-textarea-error", classNames?.error)}>
          {error}
        </div>
      ) : null}
    </div>
  );
};
