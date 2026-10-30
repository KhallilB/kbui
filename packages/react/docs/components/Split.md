# Split

Use `Split` for two columns with equal or different widths. Each child sits in a `.kb-split-track` wrapper. When space is tight, the columns stack in source order. This uses CSS alone and also works inside nested panels. Native HTML props and the matching `ref` pass through.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/layout-split--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Split } from "@kb.ui/react";

export function Example() {
  return (
    <Split>
      <section aria-labelledby="main-title">
        <h2 id="main-title">Project</h2>
        <p>Current work.</p>
      </section>
      <aside aria-label="Project details">Last updated today.</aside>
    </Split>
  );
}
```

## More examples

- [Stacked columns](https://kbui.kcb.pro/storybook/?path=/story/layout-split--responsive): Resize the available width and inspect reading order.
- [Readable column content](https://kbui.kcb.pro/storybook/?path=/story/layout-split--content-measures): Retain text measure within layout tracks.
- [Nested columns](https://kbui.kcb.pro/storybook/?path=/story/layout-split--nested): Inspect collapse behavior inside another layout.

## Reference

| Prop         | Values                                             | Default   |
| ------------ | -------------------------------------------------- | --------- |
| `as`         | `div` `section` `article`                          | `div`     |
| `ratio`      | `equal` (1:1) `wide-start` (2:1) `wide-end` (1:2)  | `equal`   |
| `collapse`   | `sm` (32rem) `md` (48rem) `lg` (64rem)             | `md`      |
| `gap`        | `none` `sm` `md` `lg`, same scale as `Inline`        | `md`      |
| `align`      | `start` `center` `end` `baseline` `stretch`        | `stretch` |
| `classNames` | `{ track?: string }`, applied to each column track | unset     |

Provide two children, one per column. Empty conditional children add no track. The track controls column width, so `Text` keeps its line-length limit and nested token overrides affect only that nested layout. Set `as` explicitly when using an element other than the default. Use `Grid` when the number of children varies. See [Layout composition](https://github.com/KhallilB/kbui/blob/main/docs/guides/layout.md).

## Related components

Use [`Grid`](Grid.md) for a variable number of children and [`Container`](Container.md) for the page boundary.
