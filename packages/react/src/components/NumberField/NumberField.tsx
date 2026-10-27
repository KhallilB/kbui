import { NumberField as Base } from "@base-ui/react/number-field";
import { clsx } from "clsx";
import { type ComponentProps, type Ref, useId } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type NumberFieldSize = "sm" | "md" | "lg";
export type NumberFieldProps = Omit<
  ComponentProps<"div">,
  "onChange" | "children" | "defaultValue"
> & {
  /** Accessible label for the numeric input. */
  label: string;
  /** Controlled number; null represents an empty field. */
  value: number | null;
  /** Receives numeric edits and null on clearing. */
  onValueChange: (value: number | null) => void;
  /** Lower stepping bound; typed drafts remain visible outside it. */
  min?: number;
  /** Upper stepping bound; typed drafts remain visible outside it. */
  max?: number;
  /** Step for buttons and arrows; defaults to one. */
  step?: number;
  /** Locale for numeric editing and display. */
  locale?: Intl.LocalesArgument;
  /** Native form field name. */
  name?: string;
  /** External native form identifier. */
  form?: string;
  /** Require a value for native form validation. */
  required?: boolean;
  /** Disable editing, stepping and form submission. */
  disabled?: boolean;
  /** Preserve value while blocking edits and stepping. */
  readOnly?: boolean;
  /** Keep label accessible while hiding it visually. */
  visuallyHidden?: boolean;
  /** Help associated with the visible input. */
  description?: string;
  /** Invalid message; callers own business validation. */
  error?: string;
  /** Control height; defaults to md. */
  size?: NumberFieldSize;
  /** Class on the visible numeric input. */
  inputClassName?: string;
  /** Class on the group containing the input and steppers. */
  groupClassName?: string;
  /** Ref to the visible input; root ref targets the outer div. */
  inputRef?: Ref<HTMLInputElement>;
  /** Native input extensions; value and behavior remain controlled. */
  inputProps?: Omit<
    Base.Input.Props,
    | "className"
    | "render"
    | "value"
    | "defaultValue"
    | "onChange"
    | "id"
    | "ref"
    | "type"
    | "disabled"
    | "readOnly"
    | "required"
    | "name"
  >;
  /** Localized decrement action; defaults to Decrease plus label. */
  decrementLabel?: string;
  /** Localized increment action; defaults to Increase plus label. */
  incrementLabel?: string;
  /** Classes for inner parts, keyed by part. */
  classNames?: ClassNames<
    "label" | "group" | "input" | "editor" | "decrement" | "increment" | "description" | "error"
  >;
};

export function NumberField({
  classNames,
  label,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  locale,
  name,
  form,
  required,
  disabled = false,
  readOnly = false,
  visuallyHidden,
  description,
  error,
  size = "md",
  inputClassName,
  groupClassName,
  inputRef,
  inputProps,
  decrementLabel = `Decrease ${label}`,
  incrementLabel = `Increase ${label}`,
  className,
  "aria-describedby": callerDescription,
  ...props
}: NumberFieldProps) {
  const id = useId();
  const described =
    [
      description ? `${id}-description` : null,
      error ? `${id}-error` : null,
      callerDescription,
      inputProps?.["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div
      {...props}
      {...kb(
        "numberfield",
        { size, disabled, readonly: readOnly, invalid: Boolean(error) },
        className,
      )}
    >
      <label
        htmlFor={id}
        className={clsx("kb-numberfield-label", classNames?.label, visuallyHidden && "kb-sr-only")}
      >
        {label}
      </label>
      <Base.Root
        id={id}
        value={value}
        onValueChange={(next) => {
          if (!disabled && !readOnly) onValueChange(next);
        }}
        min={min}
        max={max}
        step={step}
        smallStep={step}
        largeStep={step * 10}
        locale={locale}
        name={name}
        form={form}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        snapOnStep
        allowOutOfRange
        allowWheelScrub={false}
        className={clsx("kb-numberfield-editor", classNames?.editor)}
      >
        <Base.Group className={clsx("kb-numberfield-group", classNames?.group, groupClassName)}>
          <Base.Decrement
            aria-label={decrementLabel}
            className={clsx("kb-numberfield-decrement", classNames?.decrement)}
          >
            −
          </Base.Decrement>
          <Base.Input
            {...inputProps}
            ref={inputRef}
            aria-describedby={described}
            aria-invalid={Boolean(error) || undefined}
            className={clsx("kb-numberfield-input", classNames?.input, inputClassName)}
          />
          <Base.Increment
            aria-label={incrementLabel}
            className={clsx("kb-numberfield-increment", classNames?.increment)}
          >
            +
          </Base.Increment>
        </Base.Group>
      </Base.Root>
      {description && (
        <p
          id={`${id}-description`}
          className={clsx("kb-numberfield-description", classNames?.description)}
        >
          {description}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={clsx("kb-numberfield-error", classNames?.error)}>
          {error}
        </p>
      )}
    </div>
  );
}
