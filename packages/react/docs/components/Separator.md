# Separator

Native hr thematic break; decorative dividers are hidden from assistive technology. Native hr props and ref pass through; orientation and decorative own role, aria-hidden and aria-orientation.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/layout-separator--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Separator } from "@kb.ui/react";

export function Example() {
  return (
    <div>
      <p>Project summary</p>
      <Separator />
      <p>Review history</p>
    </div>
  );
}
```

## More examples

- [A divider in a row](https://kbui.kcb.pro/storybook/?path=/story/layout-separator--vertical): Inspect orientation and stretching.
- [Visual grouping](https://kbui.kcb.pro/storybook/?path=/story/layout-separator--decorative): Hide a decorative rule from assistive technology.

## Reference

| Prop          | Values                                               | Default      |
| ------------- | ---------------------------------------------------- | ------------ |
| `orientation` | `horizontal` `vertical`                              | `horizontal` |
| `decorative`  | Hide a visual-only divider from assistive technology | `false`      |

Vertical rules stretch inside Inline and have a 1rem minimum height. No tab stop or resizing interaction is added. See [Layout composition](https://github.com/KhallilB/kbui/blob/main/docs/guides/layout.md).

## Related components

Use [Inline](Inline.md) to arrange a row and [Panel](Panel.md) to group a complete section.
