import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseGroup } from "@base-ui/react/radio-group";
import { clsx } from "clsx";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { type ClassNames, kb } from "../../utils/kb";
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
  /** Classes for inner parts, keyed by part. */
  classNames?: ClassNames<"label" | "options" | "description" | "error">;
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
  /** Classes for inner parts, keyed by part. */
  classNames?: ClassNames<"item" | "control" | "indicator" | "content">;
};
type EntryData = { checked: boolean; eligible: boolean; tabIndex: number | undefined };
type EntryState = {
  target: string | null;
  update: (id: string, data: EntryData) => void;
  remove: (id: string) => void;
  markFocused: (id: string) => void;
  inside: boolean;
};
const EntryContext = createContext<EntryState | null>(null);

function RadioControl({
  checked,
  disabled,
  customTabIndex,
  ...props
}: ComponentProps<"span"> & {
  checked: boolean;
  disabled: boolean;
  customTabIndex: number | undefined;
}) {
  const entry = useContext(EntryContext);
  const update = entry?.update;
  const remove = entry?.remove;
  const id = useId();
  const eligible = !disabled && (customTabIndex === undefined || customTabIndex >= 0);
  useLayoutEffect(
    () => () => {
      remove?.(id);
    },
    [remove, id],
  );
  useLayoutEffect(() => {
    update?.(id, { checked, eligible, tabIndex: props.tabIndex });
  }, [update, id, checked, eligible, props.tabIndex]);
  // Entry follows selection; vendor retains arrow focus while user stays inside.
  const tabIndex = disabled
    ? -1
    : (customTabIndex ??
      (entry && !entry.inside && entry.target !== null
        ? entry.target === id
          ? 0
          : -1
        : props.tabIndex));
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Base UI render props supply radio role.
    <span
      {...props}
      tabIndex={tabIndex}
      onFocus={(event) => {
        // Mark before handlers; caller may remove this control during focus.
        entry?.markFocused(id);
        props.onFocus?.(event);
      }}
    />
  );
}

function RadioGroupRoot({
  classNames,
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
  onFocusCapture,
  onBlurCapture,
  ...props
}: RadioGroupProps) {
  const id = useId();
  const focused = useRef<string | null>(null);
  const [inside, setInside] = useState(false);
  const markFocused = useCallback((id: string) => {
    focused.current = id;
  }, []);
  const [entries, setEntries] = useState<Map<string, EntryData>>(() => new Map());
  const update = useCallback((id: string, data: EntryData) => {
    setEntries((current) => {
      const previous = current.get(id);
      if (
        previous &&
        previous.checked === data.checked &&
        previous.eligible === data.eligible &&
        previous.tabIndex === data.tabIndex
      )
        return current;
      return new Map(current).set(id, data);
    });
  }, []);
  const remove = useCallback((id: string) => {
    if (focused.current === id) {
      focused.current = null;
      setInside(false);
    }
    setEntries((current) => {
      if (!current.has(id)) return current;
      const next = new Map(current);
      next.delete(id);
      return next;
    });
  }, []);
  const eligible = [...entries].filter(([, item]) => item.eligible);
  const target =
    (eligible.find(([, item]) => item.checked) ??
      eligible.find(([, item]) => item.tabIndex === 0) ??
      eligible[0])?.[0] ?? null;
  const described =
    [
      description ? `${id}-description` : null,
      error ? `${id}-error` : null,
      props["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <EntryContext.Provider value={{ target, update, remove, markFocused, inside }}>
      <BaseGroup<string | null>
        {...props}
        value={value}
        onFocusCapture={(event) => {
          setInside(true);
          onFocusCapture?.(event);
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            focused.current = null;
            setInside(false);
          }
          onBlurCapture?.(event);
        }}
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
          className={clsx("kb-radiogroup-label", classNames?.label, visuallyHidden && "kb-sr-only")}
          id={`${id}-label`}
        >
          {label}
        </div>
        <div className={clsx("kb-radiogroup-options", classNames?.options)}>{children}</div>
        {description && (
          <p
            id={`${id}-description`}
            className={clsx("kb-radiogroup-description", classNames?.description)}
          >
            {description}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} className={clsx("kb-radiogroup-error", classNames?.error)}>
            {error}
          </p>
        )}
      </BaseGroup>
    </EntryContext.Provider>
  );
}
function RadioGroupItem({
  classNames,
  className,
  children,
  controlClassName,
  ...props
}: RadioGroupItemProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Base UI Radio.Root renders its native input inside this label.
    <label className={clsx("kb-radiogroup-item", classNames?.item, className)}>
      <Radio.Root
        {...props}
        className={clsx("kb-radiogroup-control", classNames?.control, controlClassName)}
        render={(controlProps, state) => (
          <RadioControl
            {...controlProps}
            checked={state.checked}
            disabled={state.disabled}
            customTabIndex={props.tabIndex}
          />
        )}
      >
        <Radio.Indicator className={clsx("kb-radiogroup-indicator", classNames?.indicator)} />
      </Radio.Root>
      <span className={clsx("kb-radiogroup-content", classNames?.content)}>{children}</span>
    </label>
  );
}
export const RadioGroup = Object.assign(RadioGroupRoot, { Item: RadioGroupItem });
