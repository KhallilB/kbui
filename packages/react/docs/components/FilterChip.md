# FilterChip

Show a filter the user can select, remove, or both. Keep its label short and stable when selection changes.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-filterchip--docs)

## Usage

Pass `selected` and `onSelectedChange` to show a toggle button. Pass `onRemove` to show a remove button. The application owns which filters are selected or rendered. If removing a chip clears the focused control, move focus to a useful remaining control, such as the next filter or the control that adds filters.

```tsx
import "@kb.ui/react/styles.css";
import { Button, FilterChip, Inline } from "@kb.ui/react";
import { useRef, useState } from "react";

export function AvailabilityFilter() {
  const [availableOnly, setAvailableOnly] = useState(false);
  return (
    <FilterChip
      label="Available now"
      selected={availableOnly}
      onSelectedChange={setAvailableOnly}
    />
  );
}

export function AppliedFilters() {
  const [regionalOnly, setRegionalOnly] = useState(true);
  const applyFilter = useRef<HTMLButtonElement>(null);
  return (
    <Inline gap="sm">
      {regionalOnly && (
        <FilterChip
          label="My region"
          onRemove={() => {
            setRegionalOnly(false);
            applyFilter.current?.focus();
          }}
        />
      )}
      <Button ref={applyFilter} onClick={() => setRegionalOnly(true)}>
        Apply region filter
      </Button>
    </Inline>
  );
}
```

## More examples

- [Select a filter](https://kbui.kcb.pro/storybook/?path=/story/components-filterchip--default). Press Space or Enter to toggle the named filter and keep focus on it.
- [Remove a filter](https://kbui.kcb.pro/storybook/?path=/story/components-filterchip--removable). Activate Remove My region and check that focus moves to Apply filter.
- [Select and remove separately](https://kbui.kcb.pro/storybook/?path=/story/components-filterchip--selectable-and-removable). Tab from the selection button to the remove button.
- [Disabled chip](https://kbui.kcb.pro/storybook/?path=/story/components-filterchip--disabled). Check that the disabled buttons stay out of the Tab order.

## Reference

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | required | Visible label and accessible name of the selection button |
| `selected` | `boolean` | unset | Controlled pressed state. Required with `onSelectedChange` |
| `onSelectedChange` | `(selected: boolean) => void` | unset | Receives the next pressed state when selection is activated |
| `onRemove` | `() => void` | unset | Renders the remove button and runs when it is activated |
| `removeLabel` | `string` | `Remove ${label}` | Localize the remove button name or include context when labels repeat |
| `disabled` | `boolean` | `false` | Disables both available buttons |
| `classNames` | `ClassNames<FilterChipSlot>` | unset | Keys are `root`, `label`, `select`, `indicator`, and `remove` |

The `ref`, `id` and `style` apply to the outer `<span>`. Selection and removal use separate native buttons. The selection button exposes `aria-pressed`. The marker and remove icon stay out of the accessible name. Keep surrounding actions outside the chip. See [the accessibility guide](../../../../docs/guides/accessibility.md) for verification steps.

Selected chips use a tint and checkmark. If both actions are present, a divider marks the removal target. On coarse pointers, each action gets a larger target.

## Related components

Use [`Badge`](Badge.md) for static metadata, [`ToggleButton`](ToggleButton.md) for a pressed action such as bold formatting, and [`MultiSelect`](MultiSelect.md) for a field that collects multiple options from a list.
