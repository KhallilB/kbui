# Inline

Wrapping row for independent content or controls. Adds no toolbar role or keyboard handling; controls retain native tab order. Native props and matching ref pass through.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/layout-inline--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, Inline } from "@kb.ui/react";

export function Example() {
  return (
    <Inline>
      <Button>Save changes</Button>
      <Button variant="secondary">Cancel</Button>
    </Inline>
  );
}
```

## More examples

- [Wrapping actions](https://kbui.kcb.pro/storybook/?path=/story/layout-inline--wrapping): Inspect source order as controls wrap.
- [A native list](https://kbui.kcb.pro/storybook/?path=/story/layout-inline--list): Retain list semantics inside a row.
- [Mixed content](https://kbui.kcb.pro/storybook/?path=/story/layout-inline--alignment): Compare alignment with different content sizes.

## Reference

| Prop      | Values                                         | Default  |
| --------- | ---------------------------------------------- | -------- |
| `as`      | `div` `ul` `ol` `nav`                          | `div`    |
| `gap`     | `none` `sm` (0.5rem) `md` (1rem) `lg` (1.5rem) | `md`     |
| `align`   | `start` `center` `end` `baseline` `stretch`    | `center` |
| `justify` | `start` `center` `end` `between`               | `start`  |

Non-default generic native elements require an explicit `as`. Lists retain markers and native list spacing. Use li children. Choose Toolbar when actions require its coordinated arrow-key model. See [Layout composition](https://github.com/KhallilB/kbui/blob/main/docs/guides/layout.md).

## Related components

Use [Toolbar](Toolbar.md) when actions need coordinated arrow-key navigation. Use [Stack](Stack.md) for vertical flow and [Grid](Grid.md) when items need shared columns.
