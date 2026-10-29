# Split

Two children form equal or weighted columns through layout-owned `.kb-split-track` wrappers. Below the available-width threshold, columns stack in source order. Layout uses CSS alone, including inside nested panels. Native props and matching ref pass through.

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
| `gap`        | `none` `sm` `md` `lg`, same scale as Inline        | `md`      |
| `align`      | `start` `center` `end` `baseline` `stretch`        | `stretch` |
| `classNames` | `{ track?: string }`, applied to each column track | unset     |

Provide two children; empty conditional children add no track. Each track owns column sizing, so Text keeps its reading measure and nested token overrides stay local. Non-default generic native elements require an explicit `as`. Use Grid for variable child counts. See [Layout composition](https://github.com/KhallilB/kbui/blob/main/docs/guides/layout.md).

## Related components

Use [Grid](Grid.md) for a variable number of children and [Container](Container.md) for the page boundary.
