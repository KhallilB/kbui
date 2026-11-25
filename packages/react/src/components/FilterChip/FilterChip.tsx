import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type FilterChipSlot = "root" | "label" | "select" | "indicator" | "remove";

type FilterChipSelection = {
  /** Whether the filter is currently applied. */
  selected: boolean;
  /** Receives the next selection when the label button is activated. */
  onSelectedChange: (selected: boolean) => void;
};

type FilterChipRemoval = {
  /** Called when the remove button is activated. */
  onRemove: () => void;
  /** Accessible name for the remove button. Defaults to `Remove ${label}`. */
  removeLabel?: string | undefined;
};

export type FilterChipProps = Omit<
  ComponentProps<"span">,
  "aria-pressed" | "children" | "dangerouslySetInnerHTML" | "role" | "tabIndex"
> & {
  "aria-pressed"?: never;
  /** Visible label and accessible name for the selection button. */
  label: string;
  /** Disables the available buttons. */
  disabled?: boolean | undefined;
  /** Classes for inner parts, keyed by part. */
  classNames?: ClassNames<FilterChipSlot> | undefined;
} & (
    | (FilterChipSelection & Partial<FilterChipRemoval>)
    | (FilterChipRemoval & { selected?: undefined; onSelectedChange?: undefined })
  );

export function FilterChip({
  label,
  selected,
  onSelectedChange,
  onRemove,
  removeLabel = `Remove ${label}`,
  disabled = false,
  className,
  classNames,
  "aria-pressed": _ariaPressed,
  ...props
}: FilterChipProps) {
  const text = <span className={clsx("kb-filterchip-label", classNames?.label)}>{label}</span>;

  return (
    <span {...props} {...kb("filterchip", { selected, disabled }, classNames?.root ?? className)}>
      {onSelectedChange ? (
        <button
          className={clsx("kb-filterchip-select", classNames?.select)}
          type="button"
          aria-pressed={selected}
          disabled={disabled}
          onClick={() => onSelectedChange(!selected)}
        >
          <svg
            aria-hidden="true"
            className={clsx("kb-filterchip-indicator", classNames?.indicator)}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m3 8 3 3 7-7" />
          </svg>
          {text}
        </button>
      ) : (
        text
      )}
      {onRemove ? (
        <button
          className={clsx("kb-filterchip-remove", classNames?.remove)}
          type="button"
          aria-label={removeLabel}
          disabled={disabled}
          onClick={() => onRemove()}
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
            <path d="m4 4 8 8m0-8-8 8" />
          </svg>
        </button>
      ) : null}
    </span>
  );
}
