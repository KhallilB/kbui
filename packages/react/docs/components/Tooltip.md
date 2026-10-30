# Tooltip

Add a brief, optional hint to an already named control. Put essential instructions in visible text or a field description instead.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-tooltip--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, Tooltip } from "@kb.ui/react";

export function Example() {
  return (
    <Tooltip content="Print using your browser’s print dialog.">
      <Button onClick={() => window.print()}>Print page</Button>
    </Tooltip>
  );
}
```

## More examples

- [An optional description](https://kbui.kcb.pro/storybook/?path=/story/components-tooltip--on-hover): Try pointer and keyboard access to a named trigger.
- [A themed hint](https://kbui.kcb.pro/storybook/?path=/story/components-tooltip--nested-theme): Check that the hint uses its parent theme.

## Reference

| Prop        | Type             | Default       | Notes                                                      |
| ----------- | ---------------- | ------------- | ---------------------------------------------------------- |
| `children`  | `ReactElement`   | required      | Focusable trigger that accepts Base UI props and a ref     |
| `content`   | `ReactNode`      | required      | Short, non-interactive hint shown on hover or focus        |
| `side`      | positioner side  | `top`         | Preferred side; placement can adjust near viewport edges   |
| `delay`     | `number`         | `400`         | Hover delay in milliseconds                                |
| `container` | portal container | document body | Use a themed host when the popup belongs to a nested theme |
| `className` | `string`         | unset         | Class on the popup                                         |

Give icon-only triggers their own `aria-label`. The tooltip is a description, not a replacement for the control's name. Do not put links, buttons, or required instructions in the popup.

## Related components

Use [`Input`](Input.md) descriptions for essential field instructions and [`Callout`](Callout.md) for a persistent message.
