# Badge

Add a short label to a person, record, or resource. Keep the text meaningful without its color. Use Status when the information changes over time.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-badge--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Badge } from "@kb.ui/react";

export function Example() {
  return <Badge>New</Badge>;
}
```

## More examples

- [Literal identifiers](https://kbui.kcb.pro/storybook/?path=/story/components-badge--mono): Compare monospace metadata.
- [Semantic tones](https://kbui.kcb.pro/storybook/?path=/story/components-badge--tones): Check text remains meaningful across tones.

## Reference

| Prop           | Type                                                  | Default   | Notes                                                                       |
| -------------- | ----------------------------------------------------- | --------- | --------------------------------------------------------------------------- |
| `children`     | `ReactNode`                                           | unset     | Short metadata such as Reviewer, Draft, or a branch name                    |
| `tone`         | `neutral` / `info` / `success` / `warning` / `danger` | `neutral` | Reinforces the text with ink and tint                                       |
| `appearance`   | `chip` / `plain`                                      | `chip`    | Chip adds a tinted surface; plain stays inline                              |
| `mono`         | `boolean`                                             | `false`   | Small uppercase monospace for short identifiers                             |
| `preserveCase` | `boolean`                                             | `false`   | Preserve case and spacing for branch names, paths, and other literal values |

Native span props pass through. Badge adds no focus stop or live announcement.

## Related components

Use [Status](Status.md) for changing state and [Code](Code.md) for code within prose.
