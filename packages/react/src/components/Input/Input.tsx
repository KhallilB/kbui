import { Field } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { clsx } from "clsx";
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
};

export function Input({
  label,
  visuallyHidden,
  description,
  error,
  size = "md",
  disabled,
  className,
  ...props
}: InputProps) {
  const invalid = Boolean(error);
  return (
    <Field.Root
      {...kb("input", { size }, className)}
      invalid={invalid}
      disabled={Boolean(disabled)}
    >
      <Field.Label className={clsx("kb-input-label", visuallyHidden && "kb-sr-only")}>
        {label}
      </Field.Label>
      <BaseInput {...props} className="kb-input-control" />
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
