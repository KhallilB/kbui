# Combobox

Use `Combobox` to filter a longer option list before choosing one or multiple values. Each option has a string `value`, a visible `label`, and an optional `disabled` flag. Single selection uses `string | null`; enable `multiple` to use a `readonly string[]` value and a `(value: string[]) => void` callback. Pass `null` or `[]` for the corresponding empty selection.

Multiple mode delegates to [`MultiSelect`](MultiSelect.md), including removable chips, keyboard navigation, clear-all, form submission, and disabled/read-only states. Its popup stays open after selections and deselections, retaining the current filter. Press Escape, click outside, or use the toggle to dismiss it. It uses `.kb-multiselect` CSS anatomy and `ClassNames<MultiSelectSlot>` slots, including `chips`, `chip`, `chipLabel`, and `chipRemove`. Single mode retains `.kb-combobox` anatomy. `ComboboxProps` remains the extensible single-selection interface, so existing wrappers can keep extending it. `ComboboxSingleProps` aliases that interface; use `ComboboxMultipleProps` for a multiple-selection wrapper or React's `ComponentProps<typeof Combobox>` for the complete discriminated union.

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

### Multiple selections

```tsx
import "@kb.ui/react/styles.css";
import { useState } from "react";
import { Combobox } from "@kb.ui/react";

export function DeploymentRegions() {
  const [regions, setRegions] = useState<string[]>([]);
  return (
    <Combobox
      multiple
      label="Deployment regions"
      options={[
        { value: "us-east-1", label: "US East (N. Virginia)" },
        { value: "eu-central-1", label: "EU Central (Frankfurt)" },
      ]}
      value={regions}
      onValueChange={setRegions}
      placeholder="Search regions..."
    />
  );
}
```

## More examples

- [Multiple selections](https://kbui.kcb.pro/storybook/?path=/story/components-combobox--multiple): Filter once, choose several options, then remove chips individually.
- [Retained selection](https://kbui.kcb.pro/storybook/?path=/story/components-combobox--preselected): Start with a known option.
- [No matching options](https://kbui.kcb.pro/storybook/?path=/story/components-combobox--empty): Inspect the empty state when filtering finds nothing.
- [Validation feedback](https://kbui.kcb.pro/storybook/?path=/story/components-combobox--invalid): Associate a correction with the field.

## Reference

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Visible field label and accessible combobox name |
| `options` | `readonly ComboboxOption[]` | required | Selectable options filtered by label |
| `multiple` | `boolean` | `false` | Enable multiple selections; determines value and callback types |
| `value` | `string \| null` or `readonly string[]` | required | Single selection or multiple selected values |
| `onValueChange` | `(value: string \| null) => void` or `(value: string[]) => void` | required | Callback matches selection mode |
| `placeholder` | `string` | unset | Input placeholder shown when empty |
| `emptyMessage` | `ReactNode` | `"No matching options"` | Polite status text when no options match |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height and text scale |
| `description` / `error` | `ReactNode` | unset | Associated help and invalid-state text |
| `disabled` / `readOnly` | `boolean` | `false` | Prevent edits; disabled also blocks form submission |
| `clearLabel` / `toggleLabel` | `string` | derived from `label` | Accessible names for the clear and toggle buttons |
| `container` | `Combobox.Portal.Props["container"]` | field root | Portal host; default retains nested theme |
| `classNames` | `ClassNames<ComboboxSlot>` or `ClassNames<MultiSelectSlot>` | unset | Slots match selection mode |
| `removeLabel` | `(option: ComboboxOption) => string` | `"Remove {option.label}"` | Multiple mode only; accessible chip removal name |

## Related components

Use [`Select`](Select.md) for a dropdown without text filtering, [`RadioGroup`](RadioGroup.md) for visible options, and [`MultiSelect`](MultiSelect.md) for several searchable choices.
