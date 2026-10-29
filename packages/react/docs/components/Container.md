# Container

Centered page boundary with responsive inline gutters. Native props and matching ref pass through. See [Layout composition](https://github.com/KhallilB/kbui/blob/main/docs/guides/layout.md) for rules, CSS recipes and token overrides.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/layout-container--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Container } from "@kb.ui/react";

export function Example() {
  return (
    <Container as="main">
      <h1>Projects</h1>
      <p>Your current work.</p>
    </Container>
  );
}
```

## More examples

- [A composed page](https://kbui.kcb.pro/storybook/?path=/story/layout-container--page): Combine a page boundary, content, and actions.
- [Narrow viewports](https://kbui.kcb.pro/storybook/?path=/story/layout-container--responsive): Compare responsive gutters.
- [Width choices](https://kbui.kcb.pro/storybook/?path=/story/layout-container--sizes): Compare available page widths.

## Reference

| Prop     | Values                                                     | Default |
| -------- | ---------------------------------------------------------- | ------- |
| `as`     | `div` `main` `section` `article` `aside` `header` `footer` | `div`   |
| `size`   | `sm` (40rem) `md` (64rem) `lg` (80rem) `full` (unbounded)  | `lg`    |
| `gutter` | Shared 1–2rem inline padding; false removes it             | `true`  |

Non-default generic native elements require an explicit `as`; native props and refs follow that element. Explicit `gutter` owns its data attribute even when caller attributes conflict. Widths include gutters. Use one page boundary; nested containers should disable gutters when the parent owns padding.

## Related components

Use [Inline](Inline.md) for a row, [Grid](Grid.md) for a collection, and [Split](Split.md) for two responsive columns.
