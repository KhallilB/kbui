# RadioGroup

Use `RadioGroup` when people need to choose one option and see all the choices at once. Give the group a label and each item a unique string value. Arrow keys change the selection and skip disabled options.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-radiogroup--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { RadioGroup } from "@kb.ui/react";
import { useState } from "react";

export function Example() {
  const [value, setValue] = useState<string | null>("weekly");
  return (
    <RadioGroup label="Frequency" value={value} onValueChange={setValue}>
      <RadioGroup.Item value="daily">Daily</RadioGroup.Item>
      <RadioGroup.Item value="weekly">Weekly</RadioGroup.Item>
    </RadioGroup>
  );
}
```

## More examples

- [An unanswered choice](https://kbui.kcb.pro/storybook/?path=/story/components-radiogroup--empty-selection): Start without a selected option.
- [Segmented choices](https://kbui.kcb.pro/storybook/?path=/story/components-radiogroup--segmented): Show a compact layout with the same single-choice behavior.
- [Validation feedback](https://kbui.kcb.pro/storybook/?path=/story/components-radiogroup--invalid): Explain why a choice is required.

## Reference

| Prop                    | Type                        | Default      | Notes                                                    |
| ----------------------- | --------------------------- | ------------ | -------------------------------------------------------- |
| `label`                 | `string`                    | required     | Visible accessible group label                           |
| `value`                 | `string \| null`            | required     | Controlled choice; null means no choice                  |
| `onValueChange`         | `(value: string) => void`   | required     | Next choice request                                      |
| `appearance`            | `"standard" \| "segmented"` | `"standard"` | Segmented tray for compact single-choice controls        |
| `selectionMotion`       | `"slide" \| "none"`         | `"slide"`    | Segmented selection background glides or moves instantly |
| `selectionTone`         | `"primary" \| "neutral"`    | `"primary"`  | Accent pill by default; neutral uses the raised surface  |
| `disabled`              | `boolean`                   | `false`      | Disable every item                                       |
| `name`                  | `string`                    |              | Native form field name                                   |
| `description` / `error` | `string`                    |              | Associated help and invalid-state text                   |
| `visuallyHidden`        | `boolean`                   | `false`      | Hide group label visually                                |
| `ref`                   | `Ref<HTMLDivElement>`       |              | Group root                                               |

```tsx
<RadioGroup
  label="Density"
  name="density"
  value={density}
  onValueChange={setDensity}
>
  <RadioGroup.Item value="compact">Compact</RadioGroup.Item>
  <RadioGroup.Item value="comfortable">Comfortable</RadioGroup.Item>
</RadioGroup>
```

`RadioGroup.Item` forwards Base UI Radio props, including `value`, `disabled` and the native control ref. `className` styles the item label; `controlClassName` styles its radio slot. The group uses the shared theme colors and shadows. Adjust the control size with `--kb-radiogroup-size` and the spacing with `--kb-radiogroup-gap`.

Set `appearance="segmented"` for compact choices such as view, density, or a filter. The control still behaves as a radio group, rather than tabs with associated panels. Your app manages the value and resets it when the form resets. An item’s `required` prop participates in native form validation. Changing the appearance keeps the same controls and focus.

The segmented selection uses a pill shape with the primary accent color by default. Set `selectionTone="neutral"` for a raised surface with neutral text and borders. Both tones follow the current light or dark theme. The background slides along the padded track and follows option widths, wrapped rows and layout changes. Set `selectionMotion="none"` for instant changes. Reduced-motion preferences disable movement regardless of this setting; forced-colors mode uses the selected option’s system highlight.

In dark mode, the primary pill uses a darker orange with white text for contrast. Override `--kb-radiogroup-primary-background` and `--kb-radiogroup-primary-color` together to customize this pair without changing other primary controls.

## Related components

Use [`Checkbox`](Checkbox.md) for independent choices and [`Select`](Select.md) when the options belong in a dropdown.
