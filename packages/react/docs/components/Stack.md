# Stack

Vertical flow with shared spacing: the block-axis counterpart to `Inline`. Children keep source and tab order; `Stack` adds no role, focus management or keyboard handling. Native props and matching ref pass through.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/layout-stack--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, Heading, Inline, Stack, Text } from "@kb.ui/react";

export function Example() {
  return (
    <Stack as="section" aria-labelledby="billing-title">
      <Heading level={2} size="md" id="billing-title">
        Billing
      </Heading>
      <Text>Your plan renews on 1 December.</Text>
      <Inline gap="sm">
        <Button>Change plan</Button>
        <Button variant="secondary">Download invoices</Button>
      </Inline>
    </Stack>
  );
}
```

## More examples

- [Section rhythm](https://kbui.kcb.pro/storybook/?path=/story/layout-stack--sections): Nest sections with a wider outer gap.
- [Inline-axis alignment](https://kbui.kcb.pro/storybook/?path=/story/layout-stack--alignment): Compare stretched and content-width children.
- [Block-axis distribution](https://kbui.kcb.pro/storybook/?path=/story/layout-stack--justify): Push actions to the bottom of a fixed-height card.
- [Form fields](https://kbui.kcb.pro/storybook/?path=/story/layout-stack--form): Space fields and actions in a native form.
- [A native list](https://kbui.kcb.pro/storybook/?path=/story/layout-stack--list): Ordered steps without list chrome.

## Reference

| Prop      | Values                                                        | Default   |
| --------- | ------------------------------------------------------------- | --------- |
| `as`      | `div` `section` `article` `aside` `ul` `ol` `nav` `form`      | `div`     |
| `gap`     | `none` `sm` (0.5rem) `md` (1rem) `lg` (1.5rem)                | `md`      |
| `align`   | `start` `center` `end` `stretch`                              | `stretch` |
| `justify` | `start` `center` `end` `between`                              | `start`   |

Non-default native elements require an explicit `as`; native props and refs follow that element. Explicit layout props own their data attributes even when caller attributes conflict.

`gap` owns vertical rhythm: `Stack` removes block margins from its direct children and its own browser margins, padding and list markers. `align="stretch"` fills the stack's width; `start`, `center` and `end` size children to their content. `justify` distributes children only when the stack is taller than its content, for example with `style={{ blockSize: "100%" }}` inside a fixed-height parent.

A named `section` exposes a region landmark; name it with `aria-labelledby`. With `ul` or `ol`, use `li` children. `Stack` removes list markers, so include `role="list"` when Safari must keep announcing the list; see [MDN’s list-style accessibility guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/list-style#accessibility). Override `--kb-layout-gap-sm`, `-md` or `-lg` on a subtree to change the shared scale. See [Layout composition](https://github.com/KhallilB/kbui/blob/main/docs/guides/layout.md).

## Related components

Use [`Inline`](Inline.md) for a wrapping row, [`Grid`](Grid.md) when items may share columns, and [`Split`](Split.md) for two columns that stack below a threshold.
