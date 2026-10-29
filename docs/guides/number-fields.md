# Numeric fields

Use `NumberField` when people need to type a quantity or adjust it with step buttons. For a plain numeric input without those buttons, use `Input type="number"`. Your app decides which units, ranges, and values make sense.

Install the [React adapter](using-kbui.md#installing), import `NumberField` from `@kb.ui/react`, and load its bundled `@kb.ui/react/styles.css` once. Your app needs React and React DOM 19 or later.

```tsx
import { useState } from "react";
import { NumberField } from "@kb.ui/react";

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

These examples show a towel count and a box count. Each app decides whether a quantity must be a whole number and how it affects the rest of the workflow.

## State and interaction

Pass `value: number | null` and update it with `onValueChange`. Use `null` for an empty field; NumberField does not have an uncontrolled mode. People can type a fraction or a value outside the bounds, and it stays visible on blur so your app can explain what needs correcting. Unrecognized text does not produce a number.

The `locale` prop controls number parsing and formatting; otherwise the runtime locale is used. Set the same locale on the server and client when using server rendering. Server-rendered output has a smoke test; hydration remains unverified.

Tab moves to the input. Step buttons stay outside the Tab sequence but are available to pointer and assistive-technology actions. The buttons and ArrowUp/ArrowDown use the same step rules: with `step={1}`, decrementing 1.5 gives 1; with `step={0.25}`, incrementing 0.5 gives 0.75. Typing does not automatically round to a step.

Step buttons stop at `min` and `max` and disable at their respective limits. Stepping an empty field starts at the value nearest zero within the bounds. Shift uses 10 times the step; Alt keeps the configured step. Home and End move to a finite minimum or maximum. Mouse-wheel and scrub gestures are disabled. Values and bounds must be finite, `step` must be positive and finite, and `min` must not exceed `max`.

NumberField uses a native text input with `aria-roledescription="Number field"`. Query it by label or textbox role rather than spinbutton. You can translate the role description through `inputProps`. The component ref points to the outer div; `inputRef` points to the visible input.

`name` and `form` submit the numeric value through Base UI’s native form input. A disabled field is excluded from submission. A read-only field keeps its value and focus but prevents edits. `required` participates in native form validation; your app still needs to validate the value for its own rules.

## API

See the [NumberField API](../../packages/react/docs/components/NumberField.md) for props, defaults, and events.

## Styling and themes

Style the field with `.kb-numberfield` and its parts: `-label`, `-editor`, `-group`, `-decrement`, `-input`, `-increment`, `-description`, and `-error`. The root exposes `data-size`, `data-disabled`, `data-readonly`, and `data-invalid`. Help and error text sit below the editor and span the field’s width. Use these classes and tokens rather than Base UI’s internal markup.

NumberField tokens include `--kb-numberfield-background`, `--kb-numberfield-color`, `--kb-numberfield-border`, `--kb-numberfield-border-width`, `--kb-numberfield-radius`, `--kb-numberfield-step-width`, `--kb-numberfield-font-size`, and `--kb-numberfield-height-sm`, `-md`, and `-lg`. Semantic foreground, muted, danger, and ring colors style labels, help, errors, and focus. Check the label and error contrast when changing the editor’s colors; those elements may sit on a different background. NumberField adds no animation and keeps controls visible in forced colors.

Storybook includes light and dark themes, empty and invalid values, disabled and read-only fields, bounds, fractional steps, and long labels. Check keyboard use, forms, focus, and narrow layouts in your app. Automated browser and accessibility checks do not replace testing with assistive technology.
