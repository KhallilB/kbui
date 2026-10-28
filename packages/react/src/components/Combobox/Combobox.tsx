import { Combobox as Base } from "@base-ui/react/combobox";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useId,
  useMemo,
  useRef,
} from "react";
import { type ClassNames, kb } from "../../utils/kb";

/** Single selectable option in a Combobox list. */
export interface ComboboxOption {
  /** Option value committed to `onValueChange`. */
  value: string;
  /** Visible option label used for display and filtering. */
  label: string;
  /** Prevent selecting this option while keeping it visible. */
  disabled?: boolean;
}

/** Styleable inner anatomy slots of Combobox. */
export type ComboboxSlot =
  | "label"
  | "shell"
  | "input"
  | "actions"
  | "clear"
  | "trigger"
  | "positioner"
  | "popup"
  | "list"
  | "option"
  | "optionIndicator"
  | "optionLabel"
  | "empty"
  | "description"
  | "error";

/** Props for the searchable single-select Combobox component. */
export interface ComboboxProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange"> {
  /** Visible label naming the combobox input. */
  label: string;
  /** Selectable options shown and filtered in the popup list. */
  options: readonly ComboboxOption[];
  /** Selected option value, or `null` when nothing is selected. */
  value: string | null;
  /** Called when the user selects or clears an option. */
  onValueChange: (value: string | null) => void;
  /** Placeholder text shown when the input is empty. */
  placeholder?: string;
  /** Message announced and shown when no options match the query. */
  emptyMessage?: ReactNode;
  /** Control height and typography scale. */
  size?: "sm" | "md" | "lg";
  /** Supporting helper text linked through `aria-describedby`. */
  description?: ReactNode;
  /** Validation error message; marks the control invalid when truthy. */
  error?: ReactNode;
  /** Mark the control invalid without an error message. */
  invalid?: boolean;
  /** Disable interaction and form submission. */
  disabled?: boolean;
  /** Allow focus and inspection while preventing value changes. */
  readOnly?: boolean;
  /** Require a selection for form validation. */
  required?: boolean;
  /** Form field name for native form submission. */
  name?: string;
  /** Controlled popup open state. */
  open?: boolean;
  /** Initial popup open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the popup opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Controlled search query text inside the input. */
  inputValue?: string;
  /** Called when the search query text changes. */
  onInputValueChange?: (inputValue: string) => void;
  /** Accessible name for the clear button (defaults to `"Clear {label}"`). */
  clearLabel?: string;
  /** Accessible name for the popup toggle button (defaults to `"Toggle {label} options"`). */
  toggleLabel?: string;
  /** Portal host; defaults to field root to retain nested themes. */
  container?: Base.Portal.Props["container"];
  /** Extra classes for inner parts, keyed by slot name. */
  classNames?: ClassNames<ComboboxSlot>;
}

/** Searchable single-choice combobox with type-to-filter and removable selection. */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    label,
    options,
    value,
    onValueChange,
    placeholder,
    emptyMessage = "No matching options",
    size = "md",
    description,
    error,
    invalid,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    open,
    defaultOpen,
    onOpenChange,
    inputValue,
    onInputValueChange,
    clearLabel,
    toggleLabel,
    container,
    className,
    classNames,
    id,
    "aria-describedby": ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const uid = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputId = id ?? `${uid}-input`;
  const labelId = `${uid}-label`;
  const descId = `${uid}-desc`;
  const errId = `${uid}-err`;
  const hasError = Boolean(error);
  const isInvalid = Boolean(invalid) || hasError;
  const hasDescription = Boolean(description);
  const describedBy =
    [hasDescription ? descId : null, hasError ? errId : null, ariaDescribedBy]
      .filter(Boolean)
      .join(" ") || undefined;

  const collection = useMemo(
    () => Base.createItems(options, { getValue: (o) => o.value, getLabel: (o) => o.label }),
    [options],
  );

  const validValue = useMemo(
    () => (value !== null && options.some((o) => o.value === value) ? value : null),
    [value, options],
  );

  return (
    <Base.Root<string, false, ComboboxOption>
      items={collection}
      value={validValue}
      onValueChange={(next) => {
        if (disabled || readOnly) return;
        onValueChange(next ?? null);
      }}
      inputValue={inputValue}
      onInputValueChange={(next) => {
        onInputValueChange?.(next);
      }}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => {
        onOpenChange?.(next);
      }}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
    >
      <div
        {...rest}
        ref={rootRef}
        {...kb(
          "combobox",
          {
            size,
            invalid: isInvalid,
            disabled,
            readonly: readOnly,
            required,
          },
          className,
        )}
      >
        <label
          id={labelId}
          htmlFor={inputId}
          className={clsx("kb-combobox-label", classNames?.label)}
        >
          {label}
        </label>
        <Base.InputGroup
          aria-labelledby={labelId}
          className={clsx("kb-combobox-shell", classNames?.shell)}
        >
          <Base.Input
            ref={ref}
            id={inputId}
            placeholder={placeholder}
            aria-labelledby={labelId}
            aria-invalid={isInvalid || undefined}
            aria-describedby={describedBy}
            className={clsx("kb-combobox-input", classNames?.input)}
          />
          <div className={clsx("kb-combobox-actions", classNames?.actions)}>
            <Base.Clear
              aria-label={clearLabel ?? `Clear ${label}`}
              disabled={disabled || readOnly}
              className={clsx("kb-combobox-clear", classNames?.clear)}
            >
              <span aria-hidden="true">×</span>
            </Base.Clear>
            <Base.Trigger
              aria-label={toggleLabel ?? `Toggle ${label} options`}
              disabled={disabled}
              className={clsx("kb-combobox-trigger", classNames?.trigger)}
            >
              <span aria-hidden="true">▾</span>
            </Base.Trigger>
          </div>
        </Base.InputGroup>
        <Base.Portal container={container ?? rootRef}>
          <Base.Positioner
            sideOffset={6}
            className={clsx("kb-combobox-positioner", classNames?.positioner)}
          >
            <Base.Popup className={clsx("kb-combobox-popup", classNames?.popup)}>
              <Base.List
                aria-labelledby={labelId}
                className={clsx("kb-combobox-list", classNames?.list)}
              >
                {(option: ComboboxOption) => (
                  <Base.Item
                    key={option.value}
                    value={option.value}
                    disabled={Boolean(option.disabled)}
                    className={clsx("kb-combobox-option", classNames?.option)}
                  >
                    <Base.ItemIndicator
                      keepMounted
                      className={clsx("kb-combobox-option-indicator", classNames?.optionIndicator)}
                    >
                      ✓
                    </Base.ItemIndicator>
                    <span className={clsx("kb-combobox-option-label", classNames?.optionLabel)}>
                      {option.label}
                    </span>
                  </Base.Item>
                )}
              </Base.List>
              <Base.Empty className={clsx("kb-combobox-empty", classNames?.empty)}>
                {emptyMessage}
              </Base.Empty>
            </Base.Popup>
          </Base.Positioner>
        </Base.Portal>
        {hasDescription && (
          <p id={descId} className={clsx("kb-combobox-description", classNames?.description)}>
            {description}
          </p>
        )}
        {hasError && (
          <p id={errId} className={clsx("kb-combobox-error", classNames?.error)}>
            {error}
          </p>
        )}
      </div>
    </Base.Root>
  );
});
