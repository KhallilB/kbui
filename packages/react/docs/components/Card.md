# Card

Group related content with an optional title, summary, links, and actions. `Card` renders an article by default and adds no interaction of its own.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-card--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Card } from "@kb.ui/react";

export function Example() {
  return (
    <Card>
      <h2>Project summary</h2>
      <p>Three tasks remain.</p>
    </Card>
  );
}
```

## More examples

- [A navigable card](https://kbui.kcb.pro/storybook/?path=/story/components-card--single-link): Use a real link for the primary destination.
- [Quiet content rows](https://kbui.kcb.pro/storybook/?path=/story/components-card--plain): Show a flat card without a raised surface.

## Reference

| Prop                        | Type                     | Default    | Notes                                                                 |
| --------------------------- | ------------------------ | ---------- | --------------------------------------------------------------------- |
| `as`                        | `article` / `div` / `li` | `article`  | Choose the container for the document structure; use li inside a list |
| `appearance`                | `outlined` / `plain`     | `outlined` | Outlined adds a raised surface; plain stays flat with a dividing line |
| `children`                  | `ReactNode`              | unset      | Related content; your app provides headings, links, and actions       |
| `className`, `style`, `ref` | native element props     | unset      | Style and reference the chosen container                              |

`Card` adds no link, button, keyboard handler, or tab stop. If a link covers the whole card, keep other controls outside that link and style its focus state. Restyle with the card background, face, shadow, color, border, radius, and padding tokens; they share the theme's tactile materials.

## Related components

Arrange a collection with [`Grid`](Grid.md). Use [`Panel`](Panel.md) when a section needs structured header, body, and footer parts.
