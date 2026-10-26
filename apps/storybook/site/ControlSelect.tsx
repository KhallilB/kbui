import { Select } from "@base-ui/react/select";
import { useRef, useState } from "react";
import { useSiteTheme } from "./SiteFrame";
import "./control-select.css";

export function ControlSelect<Value extends string>({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  id: string;
  label: string;
  value: Value;
  options: readonly { value: Value; label: string }[];
  onChange: (value: Value) => void;
  disabled?: boolean;
}) {
  const theme = useSiteTheme();
  const [pointerFocus, setPointerFocus] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const interaction = useRef<"pointer" | "keyboard">("keyboard");
  return (
    <div className="control-field">
      <label id={`${id}-label`} htmlFor={id}>
        {label}
      </label>
      <Select.Root
        modal={false}
        disabled={disabled}
        value={value}
        items={options}
        onValueChange={(next) => {
          if (next !== null) onChange(next);
        }}
      >
        <Select.Trigger
          id={id}
          className="control-select"
          aria-labelledby={`${id}-label`}
          ref={trigger}
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
          <Select.Value />
          <Select.Icon className="control-select-icon">
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m4 5.5 3 3 3-3" />
            </svg>
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            className="kbui-site control-select-positioner"
            data-theme={theme}
            sideOffset={6}
            align="start"
            alignItemWithTrigger={false}
            collisionPadding={12}
          >
            <Select.Popup
              className="control-select-popup"
              aria-labelledby={`${id}-label`}
              ref={popup}
              onPointerDownCapture={() => {
                interaction.current = "pointer";
              }}
              onKeyDownCapture={() => {
                interaction.current = "keyboard";
              }}
              finalFocus={(type) => {
                const active = document.activeElement;
                // Respect focus already moved to another control.
                if (
                  active instanceof HTMLElement &&
                  active !== document.body &&
                  active !== trigger.current &&
                  !popup.current?.contains(active)
                ) {
                  setPointerFocus(false);
                  return false;
                }
                setPointerFocus(type ? type !== "keyboard" : interaction.current === "pointer");
                return true;
              }}
            >
              <Select.List aria-labelledby={`${id}-label`}>
                {options.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    className="control-select-item"
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator className="control-select-check">
                      <svg
                        aria-hidden="true"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      >
                        <path d="m3 8 3 3 7-7" />
                      </svg>
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
