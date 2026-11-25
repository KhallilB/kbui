import { Toggle as Base } from "@base-ui/react/toggle";
import type { Ref } from "react";
import { kb } from "../../utils/kb";

type ManagedProp = "aria-pressed" | "form" | "nativeButton" | "render" | "role" | "type";

export type ToggleButtonProps<Value extends string = string> = Omit<
  Base.Props<Value>,
  "className" | ManagedProp
> &
  Partial<Record<ManagedProp, never>> & {
    /** Extra class on the button. */
    className?: string | undefined;
    /** Ref to the underlying button. */
    ref?: Ref<HTMLButtonElement> | undefined;
  };

/** A button with a persistent pressed state and a stable name. */
export function ToggleButton<Value extends string = string>({
  children,
  className,
  disabled,
  hidden,
  "aria-pressed": _ariaPressed,
  form: _form,
  nativeButton: _nativeButton,
  render: _render,
  role: _role,
  type: _type,
  ...props
}: ToggleButtonProps<Value>) {
  return (
    <Base
      {...props}
      hidden={hidden}
      disabled={disabled || hidden}
      {...kb("togglebutton", {}, className)}
    >
      <span className="kb-togglebutton-indicator">
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m3 8 3 3 7-7" />
        </svg>
      </span>
      <span className="kb-togglebutton-label">{children}</span>
    </Base>
  );
}
