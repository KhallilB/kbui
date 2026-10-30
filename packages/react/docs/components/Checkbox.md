# Checkbox

Use `Checkbox` when people can select options independently. It includes a label, help text, and error message. Pass `checked` and update it in `onCheckedChange`. Activating a mixed checkbox requests the checked state.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-checkbox--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Checkbox } from "@kb.ui/react";
import { useState } from "react";

export function Example() {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      label="Include archived projects"
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}
```

## More examples

- [Partial selection](https://kbui.kcb.pro/storybook/?path=/story/components-checkbox--mixed): Show a partly selected group.
- [Validation feedback](https://kbui.kcb.pro/storybook/?path=/story/components-checkbox--invalid): Show an error for the choice.

## Reference

| Prop                          | Type                         | Default  | Notes                                                   |
| ----------------------------- | ---------------------------- | -------- | ------------------------------------------------------- |
| `label`                       | `string`                     | required | Visible accessible label                                |
| `checked`                     | `boolean`                    | required | Controlled native checked state                         |
| `onCheckedChange`             | `(checked: boolean) => void` | required | Next checked-state request                              |
| `indeterminate`               | `boolean`                    | `false`  | Announces mixed state; activation requests checked      |
| `disabled` / `readOnly`       | `boolean`                    | `false`  | Block changes; disabled also leaves keyboard order      |
| `description` / `error`       | `string`                     |          | Associated helper and invalid-state text                |
| `visuallyHidden`              | `boolean`                    | `false`  | Hide label visually                                     |
| `controlClassName`            | `string`                     |          | Added to the native checkbox                            |
| `ref`                         | `Ref<HTMLInputElement>`      |          | Native checkbox, including form and indeterminate state |
| `name` / `value` / `required` | native `input` props           |          | Form serialization and validation                       |
| `className`                   | `string`                     |          | Root class                                              |

```tsx
<Checkbox
  label="Receive release updates"
  name="updates"
  checked={updates}
  onCheckedChange={setUpdates}
/>
```

Clicking the label or pressing Space calls `onCheckedChange`. The checkbox changes only when your app updates `checked`; otherwise its checked or mixed state stays as it was. Native input props are supported. `style` applies to the input, and CSS custom properties also reach the visible mark. Use `--kb-checkbox-size` to change its size. In forced colors, the native checkbox and its focus outline remain visible.

## Related components

Use [`RadioGroup`](RadioGroup.md) for one visible choice and [`Switch`](Switch.md) for an immediate on/off setting.
