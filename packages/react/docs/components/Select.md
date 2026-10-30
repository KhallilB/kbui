# Select

Use `Select` to choose one option from a dropdown. Each option has a string value, a visible label, and an optional disabled flag. Pass `null` to show the placeholder. Your app stores the selected value and decides whether it is valid.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-select--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Select } from "@kb.ui/react";
import { useState } from "react";

export function Example() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Select
      label="Frequency"
      value={value}
      onValueChange={setValue}
      options={[
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
      ]}
    />
  );
}
```

## More examples

- [No available options](https://kbui.kcb.pro/storybook/?path=/story/components-select--empty): Inspect the empty helper and field description.
- [Validation feedback](https://kbui.kcb.pro/storybook/?path=/story/components-select--invalid): Explain a selection that needs correction.
- [A retained selection](https://kbui.kcb.pro/storybook/?path=/story/components-select--read-only): Keep the chosen value while preventing changes.

## Reference

| Prop                                  | Type                               | Default              | Notes                                                     |
| ------------------------------------- | ---------------------------------- | -------------------- | --------------------------------------------------------- |
| `label`                               | `string`                           | required             | Visible field label and accessible popup name             |
| `value`                               | `string \| null`                   | required             | Controlled selection; null means unset                    |
| `onValueChange`                       | `(value: string \| null) => void`  | required             | Next valid choice request                                 |
| `options`                             | `readonly SelectOption[]`          | required             | Ordered unique values, labels and optional disabled flags |
| `placeholder`                         | `string`                           | `"Choose an option"` | Text for unset values                                     |
| `description` / `error`               | `string`                           |                      | Associated help and invalid-state text                    |
| `disabled` / `readOnly`               | `boolean`                          | `false`              | Prevent edits; disabled also blocks form submission       |
| `name`                                | `string`                           |                      | Native hidden form field name                             |
| `container`                           | `Select.Portal.Props["container"]` | field root           | Portal host; default retains nested theme                 |
| `controlClassName` / `popupClassName` | `string`                           |                      | Trigger and popup slot classes                            |
| `className` / `ref`                   | root div props                     |                      | Wrapper class and native root ref                         |

```tsx
<Select
  label="View"
  name="view"
  value={view}
  onValueChange={setView}
  options={[
    { value: "recent", label: "Recent" },
    { value: "all", label: "All records" },
  ]}
/>
```

Use the arrow keys or type to find an option, Enter to select it, and Escape to close the popup and return focus. Disabled options cannot be selected. When there are no options, the trigger is disabled and “No options available” appears below it. Opening the popup leaves the page scrollable. Pointer selection returns focus without a keyboard ring; keyboard dismissal keeps a visible focus indicator.

By default, the popup mounts inside the field root and inherits its theme. If you provide a custom `container`, apply the theme there too. Use `--kb-select-popup-min-width`, `--kb-select-max-height`, and `--kb-select-layer` to adjust the popup’s size and stacking order.

## Related components

Use [`RadioGroup`](RadioGroup.md) for a visible set of choices and [`Menu`](Menu.md) for actions.
