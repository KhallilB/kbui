# ToggleGroup

Group independently pressed buttons under one accessible name. Each button keeps its own pressed state as users move between choices.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-togglegroup--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { ToggleButton, ToggleGroup } from "@kb.ui/react";
import { useState } from "react";

type Layer = "roads" | "water" | "labels";

export function Example() {
  const [visibleLayers, setVisibleLayers] = useState<Layer[]>(["roads"]);

  return (
    <ToggleGroup aria-label="Map layers" value={visibleLayers} onValueChange={setVisibleLayers}>
      <ToggleButton value="roads">Roads</ToggleButton>
      <ToggleButton value="water">Water</ToggleButton>
      <ToggleButton value="labels">Place labels</ToggleButton>
    </ToggleGroup>
  );
}
```

## More examples

- [Text formatting](https://kbui.kcb.pro/storybook/?path=/story/components-togglegroup--default) lets users toggle formatting options independently.
- [Vertical layers](https://kbui.kcb.pro/storybook/?path=/story/components-togglegroup--vertical) uses Up and Down and stops at the ends.

## Reference

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `ReactNode` | | Place a `ToggleButton` with a unique nonempty `value` for each choice |
| `value` | `readonly string[]` | | Controlled values of all pressed buttons |
| `defaultValue` | `readonly string[]` | `[]` | Initial uncontrolled values |
| `onValueChange` | `(value, eventDetails) => void` | | Receives all proposed pressed values and Base UI change details |
| `aria-label` / `aria-labelledby` | `string` | | Accessible group name |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Horizontal rows wrap as space runs out. Vertical groups stack |
| `loopFocus` | `boolean` | `true` | Wraps arrow-key focus at the first and last choices |
| `disabled` | `boolean` | `false` | Disables every member |
| `className` | `string` | | Extra class on the group |
| `ref` | `Ref<HTMLDivElement>` | | Reference to the underlying group |

The root renders a `<div role="group">`. Tab enters a standalone group once. Left and Right follow the visual order in horizontal groups, including when `dir="rtl"` is inherited. Use Up and Down in vertical groups. Home and End reach the first and last available button in standalone groups. Space and Enter toggle the focused button. Disabled or hidden items are skipped. When the group is inside a `Toolbar`, the toolbar owns the shared Tab stop and arrow navigation.

Give the group and each button a clear name. Check that arrow keys move focus while leaving the pressed values intact.

Set controlled state on `ToggleGroup`. Group values can be empty and can contain multiple options. Supply the application’s form fields separately when pressed values need to submit with a form.

The recessed group frame is shared by both orientations. Pressed options have their own tinted fill and checkmark, so several choices can remain visible at once.

## Related components

Use [`RadioGroup`](RadioGroup.md) for one choice from a set, [`ToggleButton`](ToggleButton.md) for a single pressed option, or [`Toolbar`](Toolbar.md) for a group of actions.
