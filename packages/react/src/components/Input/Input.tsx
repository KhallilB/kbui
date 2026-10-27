import { Field } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<BaseInput.Props, "size" | "className"> & {
  /** Plain class string for the root. */
  className?: string;
  /** Visible label; required for accessibility. */
  label: string;
  /** Hide the label visually, keep it for screen readers. */
  visuallyHidden?: boolean;
  /** Helper text under the control. */
  description?: string;
  /** Error message; when set the field is invalid. */
  error?: string;
  /** Control height scale. */
  size?: InputSize;
  /** Content before control text, such as icons. */
  startContent?: ReactNode;
  /** Content after control text, such as a named action. */
  endContent?: ReactNode;
  /** Classes for inner parts, keyed by part. */
  classNames?: ClassNames<
    "label" | "shell" | "start" | "control" | "end" | "description" | "error"
  >;
};

export function Input({
  classNames,
  label,
  visuallyHidden,
  description,
  error,
  size = "md",
  disabled,
  className,
  startContent,
  endContent,
  ...props
}: InputProps) {
  const invalid = Boolean(error);
  return (
    <Field.Root
      {...kb(
        "input",
        {
          size,
          "start-adornment": Boolean(startContent),
          "end-adornment": Boolean(endContent),
        },
        className,
      )}
      invalid={invalid}
      disabled={Boolean(disabled)}
    >
      <Field.Label
        className={clsx("kb-input-label", classNames?.label, visuallyHidden && "kb-sr-only")}
      >
        {label}
      </Field.Label>
      <div className={clsx("kb-input-shell", classNames?.shell)}>
        {startContent && (
          <span className={clsx("kb-input-start", classNames?.start)}>{startContent}</span>
        )}
        <BaseInput {...props} className={clsx("kb-input-control", classNames?.control)} />
        {endContent && <span className={clsx("kb-input-end", classNames?.end)}>{endContent}</span>}
      </div>
      {description ? (
        <Field.Description className={clsx("kb-input-description", classNames?.description)}>
          {description}
        </Field.Description>
      ) : null}
      {error ? (
        <Field.Error className={clsx("kb-input-error", classNames?.error)} match>
          {error}
        </Field.Error>
      ) : null}
    </Field.Root>
  );
}
