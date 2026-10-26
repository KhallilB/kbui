import { Field } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { kb } from "../../utils/kb";

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
};

export function Input({
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
      <Field.Label className={clsx("kb-input-label", visuallyHidden && "kb-sr-only")}>
        {label}
      </Field.Label>
      <div className="kb-input-shell">
        {startContent && <span className="kb-input-start">{startContent}</span>}
        <BaseInput {...props} className="kb-input-control" />
        {endContent && <span className="kb-input-end">{endContent}</span>}
      </div>
      {description ? (
        <Field.Description className="kb-input-description">{description}</Field.Description>
      ) : null}
      {error ? (
        <Field.Error className="kb-input-error" match>
          {error}
        </Field.Error>
      ) : null}
    </Field.Root>
  );
}
