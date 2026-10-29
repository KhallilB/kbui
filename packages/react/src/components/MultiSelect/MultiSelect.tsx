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
import { type ClassNames, kb, resolveInvalid } from "../../utils/kb";

/** Single selectable option in a MultiSelect list. */
export interface MultiSelectOption {
  /** Option value included in `value` and passed to `onValueChange`. */
  value: string;
  /** Visible option label shown in the popup list and selection chip. */
  label: string;
  /** Prevent selecting or deselecting this option in the list. */
  disabled?: boolean;
}

/** Styleable inner anatomy slots of MultiSelect. */
export type MultiSelectSlot =
  | "label"
  | "shell"
  | "chips"
  | "chip"
  | "chipLabel"
  | "chipRemove"
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

/** Props for the searchable multi-select component with removable chips. */
export interface MultiSelectProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange"> {
  /** Visible label naming the multiselect input. */
  label: string;
  /** Selectable options shown and filtered in the popup list. */
  options: readonly MultiSelectOption[];
  /** Selected option values rendered as removable chips. */
  value: readonly string[];
  /** Called when the user adds, removes, or clears selected values. */
  onValueChange: (value: string[]) => void;
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
  /** Require at least one selection for form validation. */
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
  /** Accessible name builder for each chip remove button (defaults to `"Remove {option.label}"`). */
  removeLabel?: (option: MultiSelectOption) => string;
  /** Accessible name for the clear-all button (defaults to `"Clear {label}"`). */
  clearLabel?: string;
  /** Accessible name for the popup toggle button (defaults to `"Toggle {label} options"`). */
  toggleLabel?: string;
  /** Portal host; defaults to field root to retain nested themes. */
  container?: Base.Portal.Props["container"];
  /** Extra classes for inner parts, keyed by slot name. */
  classNames?: ClassNames<MultiSelectSlot>;
}

const defaultRemoveLabel = (option: MultiSelectOption) => `Remove ${option.label}`;
// Strip prohibited aria-readonly/aria-disabled emitted by Base UI on generic chip div.
const chipAriaReset: Record<string, undefined> = {
  "aria-readonly": undefined,
  "aria-disabled": undefined,
};

/** Searchable multi-choice selection control with removable selection chips. */
export const MultiSelect = forwardRef<HTMLInputElement, MultiSelectProps>(function MultiSelect(
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
    removeLabel = defaultRemoveLabel,
    clearLabel,
    toggleLabel,
    container,
    className,
    classNames,
    id,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": callerAriaInvalid,
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
  const { invalid: isInvalid, ariaInvalid } = resolveInvalid(
    Boolean(invalid) || hasError,
    callerAriaInvalid,
  );
  const hasDescription = Boolean(description);
  const describedBy =
    [hasDescription ? descId : null, hasError ? errId : null, ariaDescribedBy]
      .filter(Boolean)
      .join(" ") || undefined;

  const collection = useMemo(
    () => Base.createItems(options, { getValue: (o) => o.value, getLabel: (o) => o.label }),
    [options],
  );

  const optionMap = useMemo(() => new Map(options.map((o) => [o.value, o])), [options]);

  const selectedValues = useMemo(
    () => value.filter((v, idx) => optionMap.has(v) && value.indexOf(v) === idx),
    [value, optionMap],
  );

  const selectedOptions = useMemo(
    () =>
      selectedValues
        .map((v) => optionMap.get(v))
        .filter((o): o is MultiSelectOption => o !== undefined),
    [selectedValues, optionMap],
  );

  return (
    <Base.Root<string, true, MultiSelectOption>
      multiple
      items={collection}
      value={selectedValues}
      onValueChange={(next) => {
        if (disabled || readOnly) return;
        onValueChange(next ?? []);
      }}
      inputValue={inputValue}
      onInputValueChange={(next) => {
        onInputValueChange?.(next);
      }}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next, details) => {
        if (!next && details.reason === "item-press") {
          details.cancel();
          return;
        }
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
          "multiselect",
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
          className={clsx("kb-multiselect-label", classNames?.label)}
        >
          {label}
        </label>
        <Base.InputGroup
          aria-labelledby={labelId}
          className={clsx("kb-multiselect-shell", classNames?.shell)}
        >
          <Base.Chips
            aria-label={`${label} selections`}
            className={clsx("kb-multiselect-chips", classNames?.chips)}
          >
            {selectedOptions.map((option) => (
              <Base.Chip
                key={option.value}
                {...chipAriaReset}
                className={clsx("kb-multiselect-chip", classNames?.chip)}
              >
                <span className={clsx("kb-multiselect-chip-label", classNames?.chipLabel)}>
                  {option.label}
                </span>
                <Base.ChipRemove
                  aria-label={removeLabel(option)}
                  disabled={disabled || readOnly}
                  className={clsx("kb-multiselect-chip-remove", classNames?.chipRemove)}
                >
                  <span aria-hidden="true">×</span>
                </Base.ChipRemove>
              </Base.Chip>
            ))}
            <Base.Input
              ref={ref}
              id={inputId}
              placeholder={placeholder}
              aria-labelledby={labelId}
              aria-invalid={ariaInvalid}
              aria-describedby={describedBy}
              className={clsx("kb-multiselect-input", classNames?.input)}
            />
          </Base.Chips>
          <div className={clsx("kb-multiselect-actions", classNames?.actions)}>
            <Base.Clear
              aria-label={clearLabel ?? `Clear ${label}`}
              disabled={disabled || readOnly}
              className={clsx("kb-multiselect-clear", classNames?.clear)}
            >
              <span aria-hidden="true">×</span>
            </Base.Clear>
            <Base.Trigger
              aria-label={toggleLabel ?? `Toggle ${label} options`}
              disabled={disabled}
              className={clsx("kb-multiselect-trigger", classNames?.trigger)}
            >
              <span aria-hidden="true">▾</span>
            </Base.Trigger>
          </div>
        </Base.InputGroup>
        <Base.Portal container={container ?? rootRef}>
          <Base.Positioner
            sideOffset={6}
            className={clsx("kb-multiselect-positioner", classNames?.positioner)}
          >
            <Base.Popup className={clsx("kb-multiselect-popup", classNames?.popup)}>
              <Base.List
                aria-labelledby={labelId}
                className={clsx("kb-multiselect-list", classNames?.list)}
              >
                {(option: MultiSelectOption) => (
                  <Base.Item
                    key={option.value}
                    value={option.value}
                    disabled={Boolean(option.disabled)}
                    className={clsx("kb-multiselect-option", classNames?.option)}
                  >
                    <Base.ItemIndicator
                      keepMounted
                      className={clsx(
                        "kb-multiselect-option-indicator",
                        classNames?.optionIndicator,
                      )}
                    >
                      ✓
                    </Base.ItemIndicator>
                    <span className={clsx("kb-multiselect-option-label", classNames?.optionLabel)}>
                      {option.label}
                    </span>
                  </Base.Item>
                )}
              </Base.List>
              <Base.Empty className={clsx("kb-multiselect-empty", classNames?.empty)}>
                {emptyMessage}
              </Base.Empty>
            </Base.Popup>
          </Base.Positioner>
        </Base.Portal>
        {hasDescription && (
          <p id={descId} className={clsx("kb-multiselect-description", classNames?.description)}>
            {description}
          </p>
        )}
        {hasError && (
          <p id={errId} className={clsx("kb-multiselect-error", classNames?.error)}>
            {error}
          </p>
        )}
      </div>
    </Base.Root>
  );
});
