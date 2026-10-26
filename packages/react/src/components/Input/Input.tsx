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
  /** Decorative content before the control text. */
  startAdornment?: ReactNode;
  /** Content after the control text, such as a named action. */
  endAdornment?: ReactNode;
};

export function Input({
  label,
  visuallyHidden,
  description,
  error,
  size = "md",
  disabled,
  className,
  startAdornment,
  endAdornment,
  ...props
}: InputProps) {
  const invalid = Boolean(error);
  return (
    <Field.Root
      {...kb(
        "input",
        {
          size,
          "start-adornment": Boolean(startAdornment),
          "end-adornment": Boolean(endAdornment),
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
        {startAdornment && <span className="kb-input-start">{startAdornment}</span>}
        <BaseInput {...props} className="kb-input-control" />
        {endAdornment && <span className="kb-input-end">{endAdornment}</span>}
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
