import { Select as Base } from "@base-ui/react/select";
import { clsx } from "clsx";
import { type ComponentProps, useId, useImperativeHandle, useRef, useState } from "react";
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
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const interaction = useRef<"pointer" | "keyboard">("keyboard");
  const [pointerFocus, setPointerFocus] = useState(false);
  useImperativeHandle(ref, () => root.current as HTMLDivElement);
  const empty = options.length === 0;
  const inactive = disabled || empty;
  const help =
    [description, empty && "No options available"].filter(Boolean).join(" ") || undefined;
  const described =
    [help ? `${id}-description` : null, error ? `${id}-error` : null, callerDescription]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div
      {...props}
      ref={root}
      {...kb("select", { disabled: inactive, invalid: Boolean(error) }, className)}
    >
      <Base.Root<string>
        modal={false}
        items={options}
        value={value}
        onValueChange={(next) => {
          if (
            !inactive &&
            !readOnly &&
            (next === null || options.some((item) => item.value === next && !item.disabled))
          )
            onValueChange(next);
        }}
        disabled={inactive}
        readOnly={readOnly}
        onOpenChange={(_open, details) => {
          if (details.event.type.startsWith("key")) interaction.current = "keyboard";
          else if (/^(pointer|mouse)/.test(details.event.type)) interaction.current = "pointer";
        }}
        {...(name ? { name } : {})}
      >
        <Base.Label className="kb-select-label">{label}</Base.Label>
        <Base.Trigger
          ref={trigger}
          className={clsx("kb-select-control", controlClassName)}
          aria-describedby={described}
          aria-invalid={Boolean(error) || undefined}
          data-pointer-focus={pointerFocus || undefined}
          onPointerDown={() => {
            interaction.current = "pointer";
            setPointerFocus(true);
          }}
          onKeyDown={() => {
            interaction.current = "keyboard";
            setPointerFocus(false);
          }}
          onBlur={() => setPointerFocus(false)}
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
            <Base.Popup
              ref={popup}
              className={clsx("kb-select-popup", popupClassName)}
              onPointerDownCapture={() => {
                interaction.current = "pointer";
              }}
              onKeyDownCapture={() => {
                interaction.current = "keyboard";
              }}
              finalFocus={() => {
                const active = document.activeElement;
                if (
                  active instanceof HTMLElement &&
                  active !== document.body &&
                  active !== trigger.current &&
                  !popup.current?.contains(active) &&
                  !active.hasAttribute("data-base-ui-focus-guard")
                ) {
                  setPointerFocus(false);
                  return false;
                }
                setPointerFocus(interaction.current === "pointer");
                return true;
              }}
            >
              <Base.List className="kb-select-list" aria-label={label}>
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
      {help && (
        <p className="kb-select-description" id={`${id}-description`}>
          {help}
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
