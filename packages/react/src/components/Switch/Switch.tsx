import { clsx } from "clsx";
import { type ComponentProps, type CSSProperties, type ReactNode, useId } from "react";
import { kb } from "../../utils/kb";

export type SwitchProps = Omit<
  ComponentProps<"input">,
  "type" | "role" | "checked" | "defaultChecked" | "onChange" | "size" | "children" | "style"
> & {
  /** Visible, associated label. */
  label: string;
  /** Owner controls checked state. */
  checked: boolean;
  /** Requests next checked state. */
  onCheckedChange: (checked: boolean) => void;
  /** Associated helper text. */
  description?: string;
  /** Associated error; marks native control invalid for assistive technology. */
  error?: string;
  /** Hide label visually; keep its accessible name. */
  visuallyHidden?: boolean;
  /** Decorative content in off and on positions. */
  offIcon?: ReactNode;
  onIcon?: ReactNode;
  /** Added to native input; className belongs to root. */
  controlClassName?: string;
  /** Native styles; custom properties also feed visible planes. */
  style?: CSSProperties | (CSSProperties & Record<`--${string}`, string | number | undefined>);
};

export function Switch({
  label,
  checked,
  onCheckedChange,
  description,
  error,
  visuallyHidden,
  offIcon,
  onIcon,
  controlClassName,
  className,
  style,
  id,
  disabled,
  readOnly,
  "aria-describedby": describedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: SwitchProps) {
  const rootStyle = Object.fromEntries(
    Object.entries(style ?? {}).filter(([property]) => property.startsWith("--")),
  ) as CSSProperties;
  const generated = useId();
  const controlId = id ?? `kb-switch-${generated}`;
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;
  const descriptions =
    [describedBy, description && descriptionId, error && errorId].filter(Boolean).join(" ") ||
    undefined;
  return (
    <div
      style={rootStyle}
      {...kb(
        "switch",
        { checked, disabled, readonly: readOnly, invalid: Boolean(error) },
        className,
      )}
    >
      <div className="kb-switch-field">
        <span className="kb-switch-target">
          <input
            {...props}
            style={style}
            id={controlId}
            type="checkbox"
            role="switch"
            aria-checked={checked}
            className={clsx("kb-switch-control", controlClassName)}
            checked={checked}
            disabled={disabled}
            readOnly={readOnly}
            aria-readonly={readOnly || undefined}
            aria-invalid={error ? true : ariaInvalid}
            aria-describedby={descriptions}
            onChange={(event) => {
              if (!readOnly) onCheckedChange(event.currentTarget.checked);
            }}
          />
          <span className="kb-switch-track" aria-hidden="true">
            <span className="kb-switch-thumb" />
            <span className="kb-switch-off">{offIcon}</span>
            <span className="kb-switch-on">{onIcon}</span>
          </span>
        </span>
        <label
          htmlFor={controlId}
          className={clsx("kb-switch-label", visuallyHidden && "kb-sr-only")}
        >
          {label}
        </label>
      </div>
      {description && (
        <p className="kb-switch-description" id={descriptionId}>
          {description}
        </p>
      )}
      {error && (
        <p className="kb-switch-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
