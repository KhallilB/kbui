# Text

Body paragraphs, inline text and block grouping.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-text--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Text } from "@kb.ui/react";

export function Example() {
  return <Text>Review the project details before saving changes.</Text>;
}
```

## More examples

- [Body and supporting copy](https://kbui.kcb.pro/storybook/?path=/story/components-text--sizes-and-tones): Compare text emphasis and measure.
- [Inline text](https://kbui.kcb.pro/storybook/?path=/story/components-text--inline): Preserve surrounding document structure.

## Reference

| Prop               | Type                   | Default   | Notes                                                 |
| ------------------ | ---------------------- | --------- | ----------------------------------------------------- |
| `as`               | `p` \| `span` \| `div` | `p`       | Use span inside paragraphs; div for block children    |
| `size`             | `sm` \| `md` \| `lg`   | `md`      | Existing small/body roles (13px, 15px), then 1.125rem |
| `tone`             | `default` \| `muted`   | `default` | Primary ink or readable secondary ink                 |
| `className`, `ref` | Native element props   | unset     | Ref type follows chosen element                       |

Body text has a line height of 1.6 and a 65ch line-length limit set by `--kb-text-measure`. `Text` adds no margin. Inline spans stay in the flow of the sentence. Use native `<strong>` and `<em>` for emphasis. Keep paragraphs and other block elements outside the default paragraph.

## Related components

Use [`Heading`](Heading.md) for hierarchy, [`Link`](Link.md) for navigation, and [`Code`](Code.md) for literal code.
