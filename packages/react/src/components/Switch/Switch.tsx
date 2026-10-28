import { clsx } from "clsx";
import { type ComponentProps, type CSSProperties, type ReactNode, useId } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type SwitchSize = "sm" | "md" | "lg";
export type SwitchTone = "neutral" | "accent" | "info" | "success" | "warning" | "danger";

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
  /** Track size; defaults to sm inside Fieldset and md elsewhere. */
  size?: SwitchSize | undefined;
  /** Shorthand tone for the on side when onTone is omitted. */
  tone?: SwitchTone | undefined;
  /** Semantic tone for the off side. */
  offTone?: SwitchTone | undefined;
  /** Semantic tone for the on side; defaults to accent. */
  onTone?: SwitchTone | undefined;
  /** Custom CSS color or token for the off side. */
  offColor?: string | undefined;
  /** Custom CSS color or token for the on side. */
  onColor?: string | undefined;
  /** Associated helper text. */
  description?: string | undefined;
  /** Associated error; marks native control invalid for assistive technology. */
  error?: string | undefined;
  /** Hide label visually; keep its accessible name. */
  visuallyHidden?: boolean | undefined;
  /** Decorative content in off and on positions. */
  offIcon?: ReactNode;
  onIcon?: ReactNode;
  /** Added to native input; className belongs to root. */
  controlClassName?: string | undefined;
  /** Native styles; custom properties also feed visible planes. */
  style?: CSSProperties | (CSSProperties & Record<`--${string}`, string | number | undefined>);
  /** Classes for inner parts, keyed by part. */
  classNames?:
    | ClassNames<
        | "control"
        | "label"
        | "field"
        | "target"
        | "track"
        | "thumb"
        | "off"
        | "on"
        | "description"
        | "error"
      >
    | undefined;
};

export function Switch({
  classNames,
  label,
  checked,
  onCheckedChange,
  size,
  tone,
  offTone,
  onTone,
  offColor,
  onColor,
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
  const customVars = Object.fromEntries(
    Object.entries(style ?? {}).filter(([property]) => property.startsWith("--")),
  );
  const rootStyle = {
    ...customVars,
    ...(offColor ? { "--kb-switch-off-color": offColor } : {}),
    ...(onColor ? { "--kb-switch-on-color": onColor } : {}),
  } as CSSProperties;
  const resolvedOffTone = offColor ? "custom" : offTone;
  const resolvedOnTone = onColor ? "custom" : (onTone ?? tone ?? "accent");
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
        {
          size,
          "off-tone": resolvedOffTone,
          "on-tone": resolvedOnTone,
          checked,
          disabled,
          readonly: readOnly,
          invalid: Boolean(error),
        },
        className,
      )}
    >
      <div className={clsx("kb-switch-field", classNames?.field)}>
        <span className={clsx("kb-switch-target", classNames?.target)}>
          <input
            {...props}
            style={style}
            id={controlId}
            type="checkbox"
            role="switch"
            aria-checked={checked}
            className={clsx("kb-switch-control", classNames?.control, controlClassName)}
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
          <span className={clsx("kb-switch-track", classNames?.track)} aria-hidden="true">
            <span className={clsx("kb-switch-thumb", classNames?.thumb)} />
            <span className={clsx("kb-switch-off", classNames?.off)}>{offIcon}</span>
            <span className={clsx("kb-switch-on", classNames?.on)}>{onIcon}</span>
          </span>
        </span>
        <label
          htmlFor={controlId}
          className={clsx("kb-switch-label", classNames?.label, visuallyHidden && "kb-sr-only")}
        >
          {label}
        </label>
      </div>
      {description && (
        <p className={clsx("kb-switch-description", classNames?.description)} id={descriptionId}>
          {description}
        </p>
      )}
      {error && (
        <p className={clsx("kb-switch-error", classNames?.error)} id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
