# NumberField

Use NumberField for quantities people can type or adjust with step buttons. Your app sets the range and validates the value. See [Numeric fields](https://github.com/KhallilB/kbui/blob/main/docs/guides/number-fields.md) for examples, keyboard behavior, and styling. Available since v0.6.0.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-numberfield--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { NumberField } from "@kb.ui/react";
import { useState } from "react";

export function Example() {
  const [value, setValue] = useState<number | null>(1);
  const error =
    value === null || !Number.isInteger(value) || value < 0 || value > 99
      ? "Enter a whole number from 0 to 99."
      : "";
  return (
    <NumberField
      label="Quantity"
      value={value}
      onValueChange={setValue}
      min={0}
      max={99}
      step={1}
      error={error}
    />
  );
}
```

The field can be empty (`null`), and directly typed values remain available for your app to validate. The example validates a whole-number quantity; `min`, `max`, and `step` govern stepping. See [numeric-field state and interaction](https://github.com/KhallilB/kbui/blob/main/docs/guides/number-fields.md#state-and-interaction) for locale and draft behavior.

## More examples

- [An unanswered quantity](https://kbui.kcb.pro/storybook/?path=/story/components-numberfield--empty): Represent an empty field with null.
- [Validation feedback](https://kbui.kcb.pro/storybook/?path=/story/components-numberfield--invalid): Explain a value that needs correction.
- [Fractional steps](https://kbui.kcb.pro/storybook/?path=/story/components-numberfield--fractional): Compare non-integer increments.

## Reference

| Prop                                            | Type                              | Default                   | Notes                                                                   |
| ----------------------------------------------- | --------------------------------- | ------------------------- | ----------------------------------------------------------------------- |
| `label`                                         | `string`                          | required                  | Visible field name; include the quantity or unit                        |
| `value`                                         | `number` or `null`                | required                  | Controlled number; null means no answer                                 |
| `onValueChange`                                 | `(value: number \| null) => void` | required                  | Update your stored value after an edit                                  |
| `min`, `max`                                    | `number`                          | unbounded                 | Bounds for stepping; your app validates direct drafts                   |
| `step`                                          | `number`                          | `1`                       | Positive increment and alignment                                        |
| `locale`                                        | `Intl.LocalesArgument`            | runtime locale            | Number formatting and editing locale                                    |
| `size`                                          | `sm` / `md` / `lg`                | `md`                      | Control size; lg suits touch-heavy tasks                                |
| `description`, `error`                          | `string`                          | unset                     | Associated help or a specific correction; error marks the field invalid |
| `disabled`, `readOnly`                          | `boolean`                         | `false`                   | Prevent changes; disabled also prevents submission                      |
| `name`, `form`, `required`                      | native form props                 | unset / false             | Form ownership and validation                                           |
| `visuallyHidden`                                | `boolean`                         | `false`                   | Hide the visual label while keeping its accessible name                 |
| `decrementLabel`, `incrementLabel`              | `string`                          | Decrease/Increase + label | Localized names for the step actions                                    |
| `inputRef`, `inputProps`                        | input ref / native props          | unset                     | Visible input access and supported native event or ARIA extensions      |
| `className`, `groupClassName`, `inputClassName` | `string`                          | unset                     | Classes for root, step group, and input                                 |

Native div props and the root ref pass through to the wrapper. Any `aria-describedby` values from the root and `inputProps` are added after the help and error IDs. Use the explicit NumberField props for the input’s value, type, disabled/read-only state, name, required state, and ref; `inputProps` cannot override those. Custom event handlers can prevent defaults, so take care to preserve keyboard behavior.

## Related components

Use [Input](Input.md) for text or identifiers whose leading zeroes and exact characters must be preserved.
