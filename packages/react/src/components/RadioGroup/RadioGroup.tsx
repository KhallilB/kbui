import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseGroup } from "@base-ui/react/radio-group";
import { clsx } from "clsx";
import { type ComponentProps, type ReactNode, useId } from "react";
import { kb } from "../../utils/kb";
export type RadioGroupProps = Omit<ComponentProps<"div">, "onChange" | "defaultValue"> & {
  /** Visible group label. */
  label: string;
  /** Controlled choice; null means none selected. */
  value: string | null;
  /** Receives the selected item's value. */
  onValueChange: (value: string) => void;
  /** Disable all items. */
  disabled?: boolean;
  /** Segmented visual treatment; native single-choice behavior stays shared. */
  appearance?: "standard" | "segmented";
  /** Native form field name. */
  name?: string;
  /** Helper text for group. */
  description?: string;
  /** Group error message. */
  error?: string;
  /** Keep group label accessible but visually hidden. */
  visuallyHidden?: boolean;
};
export type RadioGroupItemProps = Omit<
  Radio.Root.Props<string>,
  "className" | "children" | "render"
> & {
  /** Plain class on item label. */
  className?: string;
  /** Caller content supplies meaningful item label. */
  children: ReactNode;
  /** Class on focusable radio slot. */
  controlClassName?: string;
};
function RadioGroupRoot({
  label,
  value,
  onValueChange,
  disabled = false,
  appearance = "standard",
  name,
  description,
  error,
  visuallyHidden,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const id = useId();
  const described =
    [
      description ? `${id}-description` : null,
      error ? `${id}-error` : null,
      props["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <BaseGroup<string | null>
      {...props}
      value={value}
      onValueChange={(next) => {
        if (next !== null && !disabled) onValueChange(next);
      }}
      disabled={disabled}
      {...(name ? { name } : {})}
      {...kb("radiogroup", { invalid: Boolean(error), disabled, appearance }, className)}
      aria-labelledby={`${id}-label`}
      aria-describedby={described}
      aria-invalid={Boolean(error) || undefined}
    >
      <div
        className={clsx("kb-radiogroup-label", visuallyHidden && "kb-sr-only")}
        id={`${id}-label`}
      >
        {label}
      </div>
      <div className="kb-radiogroup-options">{children}</div>
      {description && (
        <p id={`${id}-description`} className="kb-radiogroup-description">
          {description}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="kb-radiogroup-error">
          {error}
        </p>
      )}
    </BaseGroup>
  );
}
function RadioGroupItem({ className, children, controlClassName, ...props }: RadioGroupItemProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Base UI Radio.Root renders its native input inside this label.
    <label className={clsx("kb-radiogroup-item", className)}>
      <Radio.Root {...props} className={clsx("kb-radiogroup-control", controlClassName)}>
        <Radio.Indicator className="kb-radiogroup-indicator" />
      </Radio.Root>
      <span className="kb-radiogroup-content">{children}</span>
    </label>
  );
}
export const RadioGroup = Object.assign(RadioGroupRoot, { Item: RadioGroupItem });
