import { clsx } from "clsx";
import { type ComponentProps, useId, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { kb } from "../../utils/kb";
export type CheckboxProps = Omit<
  ComponentProps<"input">,
  "type" | "checked" | "defaultChecked" | "onChange" | "size"
> & {
  /** Visible accessible label. */
  label: string;
  /** Controlled checked state. */
  checked: boolean;
  /** Receives next checked state; mixed resolves to checked. */
  onCheckedChange: (checked: boolean) => void;
  /** Announce a mixed aggregate selection. */
  indeterminate?: boolean;
  /** Hide label text visually. */
  visuallyHidden?: boolean;
  /** Helper text associated with the input. */
  description?: string;
  /** Visible error; marks the input invalid. */
  error?: string;
  /** Class on the native input slot. */
  controlClassName?: string;
};
export function Checkbox({
  label,
  checked,
  onCheckedChange,
  indeterminate = false,
  visuallyHidden,
  description,
  error,
  disabled,
  readOnly,
  className,
  controlClassName,
  id: providedId,
  ref,
  ...props
}: CheckboxProps) {
  const generated = useId();
  const id = providedId ?? generated;
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => input.current as HTMLInputElement);
  useLayoutEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate;
  });
  const described =
    [
      description ? `${id}-description` : null,
      error ? `${id}-error` : null,
      props["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div {...kb("checkbox", { disabled, invalid: Boolean(error) }, className)}>
      <input
        {...props}
        id={id}
        ref={input}
        type="checkbox"
        checked={checked}
        aria-checked={indeterminate ? "mixed" : checked}
        disabled={disabled}
        readOnly={readOnly}
        aria-readonly={readOnly || undefined}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={described}
        className={clsx("kb-checkbox-control", controlClassName)}
        onChange={(event) => {
          event.target.indeterminate = indeterminate;
          if (!disabled && !readOnly) onCheckedChange(indeterminate ? true : event.target.checked);
        }}
      />
      <label htmlFor={id} className={clsx("kb-checkbox-label", visuallyHidden && "kb-sr-only")}>
        {label}
      </label>
      {description && (
        <p id={`${id}-description`} className="kb-checkbox-description">
          {description}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="kb-checkbox-error">
          {error}
        </p>
      )}
    </div>
  );
}
