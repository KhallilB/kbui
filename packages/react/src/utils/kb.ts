import { clsx } from "clsx";

export type KbAttrs = Record<string, string | boolean | undefined>;
// Extra classes per inner part, applied after kbui's own class.
export type ClassNames<Slot extends string> = Partial<Record<Slot, string>>;
export type KbProps = { className: string } & Record<`data-${string}`, string>;
export type AriaInvalid = boolean | "false" | "true" | "grammar" | "spelling" | undefined;

// false/undefined vanish so data-disabled="false" can never leak into the DOM.
export function kb(name: string, attrs: KbAttrs = {}, className?: string): KbProps {
  const out: KbProps = { className: clsx(`kb-${name}`, className) };
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    out[`data-${key}`] = value === true ? "" : value;
  }
  return out;
}

// Preserves caller aria-invalid tokens (e.g. "grammar") while syncing wrapper data-invalid.
export function resolveInvalid(
  hasError: boolean,
  ariaInvalid?: AriaInvalid,
): { invalid: boolean; ariaInvalid: AriaInvalid } {
  const hasAria = ariaInvalid !== undefined && ariaInvalid !== false && ariaInvalid !== "false";
  const invalid = hasError || hasAria;
  return { invalid, ariaInvalid: hasAria ? ariaInvalid : invalid ? true : ariaInvalid };
}
