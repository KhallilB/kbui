import { clsx } from "clsx";

export type KbAttrs = Record<string, string | boolean | undefined>;
export type KbProps = { className: string } & Record<`data-${string}`, string>;

// false/undefined vanish so data-disabled="false" can never leak into the DOM.
export function kb(name: string, attrs: KbAttrs = {}, className?: string): KbProps {
  const out: KbProps = { className: clsx(`kb-${name}`, className) };
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    out[`data-${key}`] = value === true ? "" : value;
  }
  return out;
}
