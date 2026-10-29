# Heading

Native `h1`–`h6` headings with visual size independent of rank.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-heading--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Heading } from "@kb.ui/react";

export function Example() {
  return (
    <Heading level={1} size="lg">
      Project overview
    </Heading>
  );
}
```

## More examples

- [Document hierarchy](https://kbui.kcb.pro/storybook/?path=/story/components-heading--hierarchy): Compare semantic heading ranks.
- [Visual hierarchy](https://kbui.kcb.pro/storybook/?path=/story/components-heading--sizes): Compare sizes separately from heading rank.
- [A complete article](https://kbui.kcb.pro/storybook/?path=/story/components-heading--article): Combine Heading, Text, Link, and Code.

## Reference

| Prop               | Type                                      | Default    | Notes                                                                      |
| ------------------ | ----------------------------------------- | ---------- | -------------------------------------------------------------------------- |
| `level`            | `1` \| `2` \| `3` \| `4` \| `5` \| `6`    | `2`        | Document rank; choose from page structure                                  |
| `size`             | `sm` \| `md` \| `lg` \| `xl` \| `display` | From level | Levels 1–6 map to xl, lg, md, sm, sm, sm; display is an explicit hero size |
| `className`, `ref` | Native heading props                      | unset      | Classes merge; ref targets native heading                                  |

Use one page title and nest section ranks without skipping levels. Adjust `size` for context without changing the outline. Headings have no margin; use Grid or parent layout for spacing. See [Typography](https://github.com/KhallilB/kbui/blob/main/docs/guides/typography.md) for composition, CSS recipes and accessibility guidance.

## Related components

Pair with [Text](Text.md), [Link](Link.md), and [Code](Code.md) for readable document content.
