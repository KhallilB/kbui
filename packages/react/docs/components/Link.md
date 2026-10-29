# Link

Native anchor for navigation, with persistent underline and visible keyboard focus.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-link--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Link } from "@kb.ui/react";

export function Example() {
  return <Link href="/projects">Browse projects</Link>;
}
```

## More examples

- [Navigation within prose](https://kbui.kcb.pro/storybook/?path=/story/components-link--in-text): Inspect link treatment inside surrounding text.

## Reference

| Prop                                        | Type                | Default  | Notes                            |
| ------------------------------------------- | ------------------- | -------- | -------------------------------- |
| `href`                                      | `string`            | required | Navigation destination           |
| `target`, `rel`, `download`, `aria-current` | Native anchor props | unset    | Passed through without rewriting |
| `className`, `ref`                          | Native anchor props | unset    | Ref targets anchor               |

Use descriptive link text. Use Button for an action. Links inherit surrounding type size; Tab focuses, Enter follows, and Space retains native behavior. Callers own new-tab wording and target/rel policy. No disabled link or router adapter is provided; apply `kb-link` to a router component that renders an anchor with href. Color, underline and focus must remain visible.

## Related components

Use [Button](Button.md) for an action and [Card](Card.md) to group content around a destination.
