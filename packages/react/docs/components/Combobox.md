# Combobox

Use Combobox when people need to filter a longer option list by typing before choosing one value. Each option has a string `value`, a visible `label`, and an optional `disabled` flag. Pass `null` when nothing is selected.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-combobox--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { useState } from "react";
import { Combobox } from "@kb.ui/react";

const regions = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "eu-central-1", label: "EU Central (Frankfurt)" },
];

export function RegionCombobox() {
  const [region, setRegion] = useState<string | null>("us-east-1");
  return (
    <Combobox
      label="Deployment region"
      options={regions}
      value={region}
      onValueChange={setRegion}
      placeholder="Search regions..."
    />
  );
}
```

## More examples

- [Retained selection](https://kbui.kcb.pro/storybook/?path=/story/components-combobox--preselected): Start with a known option.
- [No matching options](https://kbui.kcb.pro/storybook/?path=/story/components-combobox--empty): Inspect the empty state when filtering finds nothing.
- [Validation feedback](https://kbui.kcb.pro/storybook/?path=/story/components-combobox--invalid): Associate a correction with the field.

## Reference

| Prop                         | Type                                 | Default                 | Notes                                               |
| ---------------------------- | ------------------------------------ | ----------------------- | --------------------------------------------------- |
| `label`                      | `string`                             | required                | Visible field label and accessible combobox name    |
| `options`                    | `readonly ComboboxOption[]`          | required                | Selectable options filtered by label                |
| `value`                      | `string \| null`                     | required                | Controlled selection; `null` means unset            |
| `onValueChange`              | `(value: string \| null) => void`    | required                | Called when an option is selected or cleared        |
| `placeholder`                | `string`                             | unset                   | Input placeholder shown when empty                  |
| `emptyMessage`               | `ReactNode`                          | `"No matching options"` | Polite status text when no options match            |
| `size`                       | `"sm" \| "md" \| "lg"`               | `"md"`                  | Control height and text scale                       |
| `description` / `error`      | `ReactNode`                          | unset                   | Associated help and invalid-state text              |
| `disabled` / `readOnly`      | `boolean`                            | `false`                 | Prevent edits; disabled also blocks form submission |
| `clearLabel` / `toggleLabel` | `string`                             | derived from `label`    | Accessible names for the clear and toggle buttons   |
| `container`                  | `Combobox.Portal.Props["container"]` | field root              | Portal host; default retains nested theme           |
| `classNames`                 | `ClassNames<ComboboxSlot>`           | unset                   | Extra classes for inner parts                       |

## Related components

Use [Select](Select.md) for a dropdown without text filtering, [RadioGroup](RadioGroup.md) for visible options, and [MultiSelect](MultiSelect.md) for several searchable choices.
