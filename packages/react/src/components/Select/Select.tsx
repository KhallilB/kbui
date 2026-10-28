import { Select as Base } from "@base-ui/react/select";
import { clsx } from "clsx";
import { type ComponentProps, useId, useImperativeHandle, useRef, useState } from "react";
import { type ClassNames, kb, resolveInvalid } from "../../utils/kb";
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
  /** Classes for inner parts, keyed by part. */
  classNames?: ClassNames<
    | "control"
    | "popup"
    | "label"
    | "icon"
    | "portal"
    | "positioner"
    | "list"
    | "item"
    | "indicator"
    | "empty"
    | "description"
    | "error"
  >;
};
export function Select({
  classNames,
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
  "aria-invalid": callerAriaInvalid,
  ...props
}: SelectProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const interaction = useRef<"pointer" | "keyboard">("keyboard");
  const [pointerFocus, setPointerFocus] = useState(false);
  useImperativeHandle(ref, () => root.current as HTMLDivElement);
  const { invalid, ariaInvalid } = resolveInvalid(Boolean(error), callerAriaInvalid);
  const empty = options.length === 0;
  const inactive = disabled || empty;
  const help =
    [description, empty && "No options available"].filter(Boolean).join(" ") || undefined;
  const described =
    [help ? `${id}-description` : null, error ? `${id}-error` : null, callerDescription]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div {...props} ref={root} {...kb("select", { disabled: inactive, invalid }, className)}>
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
        <Base.Label className={clsx("kb-select-label", classNames?.label)}>{label}</Base.Label>
        <Base.Trigger
          ref={trigger}
          className={clsx("kb-select-control", classNames?.control, controlClassName)}
          aria-describedby={described}
          aria-invalid={ariaInvalid}
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
          <Base.Icon className={clsx("kb-select-icon", classNames?.icon)} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </Base.Icon>
        </Base.Trigger>
        <Base.Portal
          container={container ?? root}
          className={clsx("kb-select-portal", classNames?.portal)}
        >
          <Base.Positioner
            className={clsx("kb-select-positioner", classNames?.positioner)}
            sideOffset={6}
            alignItemWithTrigger={false}
          >
            <Base.Popup
              ref={popup}
              className={clsx("kb-select-popup", classNames?.popup, popupClassName)}
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
              <Base.List className={clsx("kb-select-list", classNames?.list)} aria-label={label}>
                {options.length ? (
                  options.map((option) => (
                    <Base.Item
                      key={option.value}
                      value={option.value}
                      disabled={Boolean(option.disabled)}
                      className={clsx("kb-select-item", classNames?.item)}
                    >
                      <Base.ItemText>{option.label}</Base.ItemText>
                      <Base.ItemIndicator
                        className={clsx("kb-select-indicator", classNames?.indicator)}
                        aria-hidden="true"
                      >
                        ✓
                      </Base.ItemIndicator>
                    </Base.Item>
                  ))
                ) : (
                  <Base.Item
                    value=""
                    disabled
                    className={clsx(
                      "kb-select-item kb-select-empty",
                      classNames?.item,
                      classNames?.empty,
                    )}
                  >
                    <Base.ItemText>No options available</Base.ItemText>
                  </Base.Item>
                )}
              </Base.List>
            </Base.Popup>
          </Base.Positioner>
        </Base.Portal>
      </Base.Root>
      {help && (
        <p
          className={clsx("kb-select-description", classNames?.description)}
          id={`${id}-description`}
        >
          {help}
        </p>
      )}
      {error && (
        <p className={clsx("kb-select-error", classNames?.error)} id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
