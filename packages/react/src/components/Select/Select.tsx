import { Select as Base } from "@base-ui/react/select";
import { clsx } from "clsx";
import { type ComponentProps, useId, useImperativeHandle, useRef } from "react";
import { kb } from "../../utils/kb";
export type SelectOption = { value: string; label: string; disabled?: boolean };
export type SelectProps = Omit<ComponentProps<"div">, "onChange" | "children" | "defaultValue"> & {
  /** Visible label for the trigger. */
  label: string;
  /** Controlled selection; null displays the placeholder. */
  value: string | null;
  /** Receives selected value; consumers own domain transitions. */
  onValueChange: (value: string | null) => void;
  /** Unique string-valued options; an empty collection is supported. */
  options: readonly SelectOption[];
  /** Text when value is null. */
  placeholder?: string;
  /** Field helper text. */
  description?: string;
  /** Visible invalid-state message. */
  error?: string;
  /** Disable interaction and form submission. */
  disabled?: boolean;
  /** Preserve value while preventing changes. */
  readOnly?: boolean;
  /** Native form field name. */
  name?: string;
  /** Class on trigger slot. */
  controlClassName?: string;
  /** Class on popup slot. */
  popupClassName?: string;
  /** Portal host; defaults to field root to retain theme. */
  container?: Base.Portal.Props["container"];
};
export function Select({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Choose an option",
  description,
  error,
  disabled = false,
  readOnly = false,
  name,
  className,
  controlClassName,
  popupClassName,
  container,
  ref,
  "aria-describedby": callerDescription,
  ...props
}: SelectProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current as HTMLDivElement);
  const described =
    [description ? `${id}-description` : null, error ? `${id}-error` : null, callerDescription]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div {...props} ref={root} {...kb("select", { disabled, invalid: Boolean(error) }, className)}>
      <Base.Root<string>
        items={options}
        value={value}
        onValueChange={(next) => {
          if (
            !disabled &&
            !readOnly &&
            (next === null || options.some((item) => item.value === next && !item.disabled))
          )
            onValueChange(next);
        }}
        disabled={disabled}
        readOnly={readOnly}
        {...(name ? { name } : {})}
      >
        <Base.Label className="kb-select-label">{label}</Base.Label>
        <Base.Trigger
          className={clsx("kb-select-control", controlClassName)}
          aria-describedby={described}
          aria-invalid={Boolean(error) || undefined}
        >
          <Base.Value placeholder={placeholder} />
          <Base.Icon className="kb-select-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </Base.Icon>
        </Base.Trigger>
        <Base.Portal container={container ?? root}>
          <Base.Positioner
            className="kb-select-positioner"
            sideOffset={6}
            alignItemWithTrigger={false}
          >
            <Base.Popup className={clsx("kb-select-popup", popupClassName)}>
              <Base.List className="kb-select-list">
                {options.length ? (
                  options.map((option) => (
                    <Base.Item
                      key={option.value}
                      value={option.value}
                      disabled={Boolean(option.disabled)}
                      className="kb-select-item"
                    >
                      <Base.ItemText>{option.label}</Base.ItemText>
                      <Base.ItemIndicator className="kb-select-indicator" aria-hidden="true">
                        ✓
                      </Base.ItemIndicator>
                    </Base.Item>
                  ))
                ) : (
                  <Base.Item value="" disabled className="kb-select-item kb-select-empty">
                    <Base.ItemText>No options available</Base.ItemText>
                  </Base.Item>
                )}
              </Base.List>
            </Base.Popup>
          </Base.Positioner>
        </Base.Portal>
      </Base.Root>
      {description && (
        <p className="kb-select-description" id={`${id}-description`}>
          {description}
        </p>
      )}
      {error && (
        <p className="kb-select-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
