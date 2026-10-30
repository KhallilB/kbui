# Grid

Arrange cards or other content in responsive columns, fixed column counts, or a single vertical stack. Grid uses ordinary CSS layout, without an ARIA grid role or special keyboard navigation, and resets native list markers and margins when rendered as `ul` or `ol`.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/layout-grid--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Card, Grid } from "@kb.ui/react";

export function Example() {
  return (
    <Grid as="ul" role="list" columns={2} gap="md" aria-label="Projects">
      <Card as="li">
        <h2>First project</h2>
        <p>Ready for review.</p>
      </Card>
      <Card as="li">
        <h2>Second project</h2>
        <p>In progress.</p>
      </Card>
    </Grid>
  );
}
```

## More examples

- [Fixed column counts](https://kbui.kcb.pro/storybook/?path=/story/layout-grid--columns): Compare one through four equal columns.
- [Responsive minimum widths](https://kbui.kcb.pro/storybook/?path=/story/layout-grid--column-widths): Compare automatic wrapping at different minimum item widths.
- [Gaps and alignment](https://kbui.kcb.pro/storybook/?path=/story/layout-grid--gaps-and-alignment): Compare spacing presets and cross-axis alignment.
- [A vertical collection](https://kbui.kcb.pro/storybook/?path=/story/layout-grid--stacked-list): Keep list structure while stacking items.

## Reference

| Prop                        | Type                                                | Default                | Notes                                                                                          |
| --------------------------- | --------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------- |
| `as`                        | `div` / `ul` / `ol`                                 | `div`                  | Use ul or ol for a collection; children must then be list items                                |
| `layout`                    | `auto` / `stack`                                    | `auto`                 | Auto fits equal columns to available width; stack uses one column                              |
| `columns`                   | `auto` / `1` / `2` / `3` / `4`                      | `auto`                 | Explicit equal column count (collapsing to 1 on narrow mobile viewports) or automatic wrapping |
| `minItemWidth`              | `sm` / `md` / `lg`                                  | `md`                   | Minimum width (`14rem`, `18.75rem`, `24rem`) before automatic columns wrap                     |
| `gap`                       | `none` / `sm` / `md` / `lg`                         | `lg` (`--kb-grid-gap`) | Space between columns and stacked rows                                                         |
| `align`                     | `start` / `center` / `end` / `baseline` / `stretch` | `stretch`              | Cross-axis alignment within each grid row                                                      |
| `children`                  | `ReactNode`                                         | unset                  | Content in document and keyboard order                                                         |
| `className`, `style`, `ref` | native element props                                | unset                  | Style and reference the chosen container                                                       |

```tsx
<Grid as="ul" role="list" layout="stack" gap="md" aria-label="Projects">
  <Card as="li">
    <h2>
      <a href="/project">Project</a>
    </h2>
    <p>Summary</p>
  </Card>
</Grid>
```

Use `minItemWidth`, `columns`, `gap`, and `align` for common layouts, or override `--kb-grid-gap` and `--kb-grid-min-item-width` (`-sm`, `-md`, `-lg`) on a subtree. Keep the visual order the same as the reading order.

Grid removes list markers. Include `role="list"` on list renderings to retain list exposure in Safari when `list-style: none` is applied; see [MDN’s list-style accessibility guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/list-style#accessibility). Confirm list/item announcement with your supported browser and screen reader.

## Related components

Use [Split](Split.md) for exactly two weighted columns, [Inline](Inline.md) for a wrapping row of independent items, and [Stack](Stack.md) for vertical flow that never forms columns.
