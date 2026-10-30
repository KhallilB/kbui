# Switch

Use Switch for a preference that takes effect as soon as it changes. Pass `checked` and update it in `onCheckedChange`; your app handles saving and form reset. Switch uses a labelled native checkbox with `role="switch"`. Use `Checkbox` when people are selecting items instead.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-switch--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Switch } from "@kb.ui/react";
import { useState } from "react";

export function Example() {
  const [checked, setChecked] = useState(false);
  return (
    <Switch
      label="Email notifications"
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}
```

## More examples

- [Form integration](https://kbui.kcb.pro/storybook/?path=/story/components-switch--native-form): Include an on/off value in a native form.
- [A retained setting](https://kbui.kcb.pro/storybook/?path=/story/components-switch--read-only): Show a setting while blocking edits.
- [Validation feedback](https://kbui.kcb.pro/storybook/?path=/story/components-switch--with-error): Associate a correction with the setting.

## Reference

| Prop                                   | Type                                                                    | Default              | Notes                                                                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `label`                                | `string`                                                                | required             | Associated visible label and accessible name                                                                                         |
| `checked`                              | `boolean`                                                               | required             | Current controlled state                                                                                                             |
| `onCheckedChange`                      | `(checked: boolean) => void`                                            | required             | Requests next state; owner updates checked                                                                                           |
| `size`                                 | `"sm" \| "md" \| "lg"`                                                  | `"md"`               | Visual track size (`36×20px`, `44×24px`, `56×32px`); `Fieldset` defaults nested switches to `"sm"` while keeping a 44px touch target |
| `tone`                                 | `"accent" \| "neutral" \| "info" \| "success" \| "warning" \| "danger"` | `"accent"`           | Checked-state track tone when `onTone` is unset                                                                                      |
| `offTone` / `onTone`                   | `SwitchTone`                                                            | `"neutral"` / `tone` | Independent track tone for unchecked and checked sides                                                                               |
| `offColor` / `onColor`                 | `string`                                                                |                      | Custom CSS color for the unchecked or checked track                                                                                  |
| `description` / `error`                | `string`                                                                |                      | Associated helper/error text; error sets `aria-invalid`                                                                                |
| `disabled` / `readOnly`                | `boolean`                                                               | `false`              | Disabled blocks focus/changes; read-only keeps focus and form value while blocking edits                                             |
| `visuallyHidden`                       | `boolean`                                                               | `false`              | Hide label visually, keep its accessible name                                                                                        |
| `offIcon` / `onIcon`                   | `ReactNode`                                                             |                      | Decorative slots; do not place interactive content inside                                                                            |
| `name` / `value` / `form` / `required` | native input props                                                      |                      | Native form ownership, successful value and validation                                                                               |
| `ref`                                  | `Ref<HTMLInputElement>`                                                 |                      | Native checkbox, never an extra hidden control                                                                                       |
| `className` / `controlClassName`       | `string`                                                                |                      | Root/native input class                                                                                                              |
| `style`                                | `CSSProperties`                                                         |                      | Native input styles; CSS custom properties also reach visible track and thumb                                                        |

```tsx
import { useState } from "react";
import { Switch } from "@kb.ui/react";

export function Preference() {
  const [checked, setChecked] = useState(false);
  return (
    <Switch
      label="Email updates"
      checked={checked}
      onCheckedChange={setChecked}
      name="updates"
    />
  );
}
```

Import `useState` from React and `Switch` from `@kb.ui/react`. Clicking or pressing Space calls `onCheckedChange`. Unchecked or disabled controls submit no value; a checked control submits its native value (`"on"` unless you supply one). Reset `checked` in the form’s `onReset` handler when needed. Use `offTone`/`onTone` or `offColor`/`onColor` when both sides of a toggle carry distinct state colors. The `switch` token group controls its appearance in both themes, and reduced motion removes the thumb’s travel animation.

## Related components

Use [`Checkbox`](Checkbox.md) for a choice submitted with other answers and [`RadioGroup`](RadioGroup.md) for one of several settings.
