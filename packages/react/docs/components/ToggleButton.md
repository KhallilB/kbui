# ToggleButton

Use a pressed button for a view option or an action that stays active until the user presses the same button again.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-togglebutton--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { ToggleButton } from "@kb.ui/react";
import { useState } from "react";

export function Example() {
  const [showGrid, setShowGrid] = useState(true);

  return (
    <ToggleButton pressed={showGrid} onPressedChange={setShowGrid}>
      Show grid
    </ToggleButton>
  );
}
```

## More examples

- [Standalone toggle](https://kbui.kcb.pro/storybook/?path=/story/components-togglebutton--default) demonstrates native keyboard activation.
- [Controlled state](https://kbui.kcb.pro/storybook/?path=/story/components-togglebutton--controlled) keeps the pressed state with the surrounding interface.
- [Disabled and pressed](https://kbui.kcb.pro/storybook/?path=/story/components-togglebutton--disabled) shows a current state while preventing edits.

## Reference

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `ReactNode` | | Visible label or decorative icon content |
| `pressed` | `boolean` | | Controlled pressed state |
| `defaultPressed` | `boolean` | `false` | Initial uncontrolled pressed state |
| `onPressedChange` | `(pressed, eventDetails) => void` | | Receives the proposed state and Base UI change details |
| `disabled` | `boolean` | `false` | Prevents interaction |
| `value` | `string` | | Unique nonempty identifier within a `ToggleGroup` |
| `aria-label` / `aria-labelledby` | `string` | | Accessible name when the button has no visible text |
| `className` | `string` | | Extra class on the button |
| `ref` | `Ref<HTMLButtonElement>` | | Reference to the underlying button |

Use the same name in both states so assistive technology can report the change through `aria-pressed`. The decorative checkmark marks the pressed state without changing the button width. When the toggle is in a `ToggleGroup`, set its `value` and let the group own the pressed state.

Pressed buttons pair a tinted surface with an accent border and checkmark. The checkmark and surface feedback settle quickly and switch instantly under reduced motion.

The component renders a native `<button type="button">`. Style it through `className` or CSS tokens and give it a label through `children` or an accessible naming prop. Pressing it inside a form leaves submission to the form's submit controls. Check the name and pressed state in the accessibility tree, then use Tab, Enter and Space to verify focus and activation.

## Related components

Use [`ToggleGroup`](ToggleGroup.md) for several independent pressed options, [`Button`](Button.md) for a one-time action, or [`Switch`](Switch.md) for an on/off setting.
