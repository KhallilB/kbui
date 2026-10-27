# Numeric fields

Use `NumberField` when people type quantities and also need visible step controls. Use `Input type="number"` for a plain native numeric field without coordinated buttons. Counts, prices, units and business validation remain consumer rules.

Import from `@kbui/react` and load `@kbui/react/styles.css`. NumberField is prepared after 0.5.0 and remains unreleased as of 2026-10-26. Existing release 0.5.0 does not contain it. React 19 and Base UI 1.9 are the tested source contract; no other framework adapter is provided.

```tsx
import { useState } from "react";
import { NumberField } from "@kbui/react";

export function ReturnedTowels() {
  const [count, setCount] = useState<number | null>(76);
  const error = count === null || !Number.isInteger(count) || count < 0 || count > 9999
    ? "Enter a whole number from 0 to 9999." : "";
  return <NumberField label="Bath towel counted" value={count} onValueChange={setCount}
    min={0} max={9999} step={1} size="lg" error={error} />;
}

export function PackingBoxes() {
  const [boxes, setBoxes] = useState<number | null>(12);
  return <NumberField label="Standard boxes" value={boxes} onValueChange={setBoxes}
    min={0} max={99} step={1} size="lg" />;
}
```

These are the same synthetic linen/packing scenarios used in the working study. NumberField does not decide shortage estimates, storage fit or integer-only policy.

## State and interaction

Controlled `value: number | null` and `onValueChange` are required. Null means empty. There is no uncontrolled mode. Direct numeric drafts may exceed bounds or be fractional and remain visible on blur; validate in the consumer. Unsupported text does not fabricate a numeric value. Formatting/parsing follows the supplied `locale` or runtime locale. Supply the same locale on server/client when using SSR; A fresh local tarball server-render smoke passes; hydration is not validated by this study.

Tab reaches the visible input; steppers stay out of the Tab sequence while remaining available to pointer and assistive-technology actions. Buttons and ArrowUp/ArrowDown share step alignment. At step 1, decrementing 1.5 produces1 through either route. At step 0.25, 0.5 increments to0.75. Typed drafts are not silently aligned. Step controls clamp to min/max and disable at their respective bound. Stepping an empty field seeds the value nearest 0 inside bounds. Shift steps by 10×step; Alt keeps the configured step. Home/End use finite min/max. Wheel/scrub gestures are disabled. Numeric values, bounds and positive step must be finite; min must not exceed max.

Base UI uses a native text input with `aria-roledescription="Number field"`, not a spinbutton role. Find it by accessible label or textbox role. Localize that role description through `inputProps`. Ref on NumberField targets the outer div; `inputRef` targets the visible input. `name`/`form` serialize the numeric value through Base UI's native form input. Disabled excludes it from submission; readOnly preserves submission and focus while preventing mutations. Required participates in native form validation. Native validation is additional feedback, not a replacement for domain validation.

## API

See the canonical [NumberField API](../../packages/react/README.md#numberfield) for props, defaults and events.

## Anatomy and theme

Public classes: `.kb-numberfield`, `-label`, `-editor`, `-group`, `-decrement`, `-input`, `-increment`, `-description`, `-error`. Root states: `data-size`, `data-disabled`, `data-readonly`, `data-invalid`. Help/error are siblings of editor and span the whole field width. Use part classes/variables instead of private Base UI markup.

Variables: `--kb-numberfield-background`, `color`, `border`, `border-width`, `radius`, `step-width`, `font-size`, `height-sm/md/lg`. Semantic foreground/muted/danger/ring values control labels, help, errors and focus. For compact linen, set dark group colors, 2px radius and larger tabular numerals; for packing, use rounded radius and ordinary text size. Do not set the whole field foreground to white when the error sits on a light surface. No motion is added by NumberField; forced-color styles keep controls visible.

Runnable stories cover both contexts, light/dark, empty, invalid, disabled/readOnly, bounds, fractional step and long labels. Test native forms, keyboard/button parity, focus, error relationships, long content and reflow in each host. Chromium and automated accessibility checks do not establish assistive-technology conformance.
