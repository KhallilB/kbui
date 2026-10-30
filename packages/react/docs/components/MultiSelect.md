# MultiSelect

Use `MultiSelect` when people need to search a longer list and keep multiple selections visible as removable chips. Selected values render inside a named chip toolbar with keyboard arrow/Backspace/Delete support and per-chip remove buttons. Choosing or deselecting an option keeps the popup open and preserves the filter. Escape, an outside click, or the toggle closes it.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-multiselect--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { useState } from "react";
import { MultiSelect } from "@kb.ui/react";

const scopes = [
  { value: "payments:read", label: "Payments read" },
  { value: "webhooks:manage", label: "Webhooks" },
  { value: "reporting:export", label: "Reporting export" },
];

export function ScopeMultiSelect() {
  const [selected, setSelected] = useState<string[]>(["payments:read"]);
  return (
    <MultiSelect
      label="API scopes"
      options={scopes}
      value={selected}
      onValueChange={setSelected}
      placeholder="Filter scopes..."
    />
  );
}
```

## More examples

- [Several retained choices](https://kbui.kcb.pro/storybook/?path=/story/components-multiselect--many-selections): Inspect removable chips and their keyboard model.
- [No matching options](https://kbui.kcb.pro/storybook/?path=/story/components-multiselect--empty): Inspect the empty filtering state.
- [Validation feedback](https://kbui.kcb.pro/storybook/?path=/story/components-multiselect--invalid): Explain a selection that needs correction.

## Reference

| Prop                    | Type                                    | Default                   | Notes                                                 |
| ----------------------- | --------------------------------------- | ------------------------- | ----------------------------------------------------- |
| `label`                 | `string`                                | required                  | Visible field label and accessible combobox name      |
| `options`               | `readonly MultiSelectOption[]`          | required                  | Selectable options filtered by label                  |
| `value`                 | `readonly string[]`                     | required                  | Controlled array of selected option values            |
| `onValueChange`         | `(value: string[]) => void`             | required                  | Called when selections are added, removed, or cleared |
| `placeholder`           | `string`                                | unset                     | Input placeholder                                     |
| `emptyMessage`          | `ReactNode`                             | `"No matching options"`   | Polite status text when no options match              |
| `size`                  | `"sm" \| "md" \| "lg"`                  | `"md"`                    | Control height and text scale                         |
| `description` / `error` | `ReactNode`                             | unset                     | Associated help and invalid-state text                |
| `disabled` / `readOnly` | `boolean`                               | `false`                   | Prevent edits and chip removal                        |
| `removeLabel`           | `(option: MultiSelectOption) => string` | `"Remove {option.label}"` | Accessible name for each chip remove button           |
| `container`             | `Combobox.Portal.Props["container"]`    | field root                | Portal host; default retains nested theme             |
| `classNames`            | `ClassNames<MultiSelectSlot>`           | unset                     | Extra classes for inner parts                         |

## Related components

Use [`Combobox`](Combobox.md) for one searchable choice and [`Checkbox`](Checkbox.md) for independent choices that should remain visible.
