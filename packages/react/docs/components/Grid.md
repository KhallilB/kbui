# Grid

Arrange cards or other content in equal columns that fit the available width. Grid uses ordinary CSS layout, without an ARIA grid role or special keyboard navigation.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/layout-grid--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Card, Grid } from "@kb.ui/react";

export function Example() {
  return (
    <Grid as="ul">
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

- [A vertical collection](https://kbui.kcb.pro/storybook/?path=/story/layout-grid--stacked-list): Keep native list structure in a stack.
- [Responsive columns](https://kbui.kcb.pro/storybook/?path=/story/layout-grid--responsive): Resize the available width and compare column fit.

## Reference

| Prop                        | Type                 | Default | Notes                                                             |
| --------------------------- | -------------------- | ------- | ----------------------------------------------------------------- |
| `as`                        | `div` / `ul` / `ol`  | `div`   | Use ul or ol for a collection; children must then be list items   |
| `layout`                    | `auto` / `stack`     | `auto`  | Auto fits equal columns to available width; stack uses one column |
| `children`                  | `ReactNode`          | unset   | Content in document and keyboard order                            |
| `className`, `style`, `ref` | native element props | unset   | Style and reference the chosen container                          |

```tsx
<Grid as="ul" aria-label="Projects">
  <Card as="li">
    <h2>
      <a href="/project">Project</a>
    </h2>
    <p>Summary</p>
  </Card>
</Grid>
```

Use --kb-grid-gap and --kb-grid-min-item-width to adjust spacing and column fit. Keep the visual order the same as the reading order.

## Related components

Use [Split](Split.md) for exactly two weighted columns and [Inline](Inline.md) for a wrapping row of independent items.
