# Stat

Show a value with the label that explains it. Include units and a time period in the label or value when they affect the meaning.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-stat--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Stat } from "@kb.ui/react";

export function Example() {
  return <Stat label="Open tasks" value={12} />;
}
```

## More examples

- [A headline figure](https://kbui.kcb.pro/storybook/?path=/story/components-stat--display): Compare emphasis for one primary value.
- [Several measures](https://kbui.kcb.pro/storybook/?path=/story/components-stat--row): Keep labels beside comparable figures.

## Reference

| Prop         | Type             | Default  | Notes                                              |
| ------------ | ---------------- | -------- | -------------------------------------------------- |
| `label`      | `ReactNode`      | required | What the value measures; read before the value     |
| `value`      | `ReactNode`      | required | Number or short text; include units where needed   |
| `size`       | `md` / `display` | `md`     | Use display for one headline number, md for groups |
| `classNames` | keyed classes    | unset    | Style the label and value separately               |

## Related components

Use [Progress](Progress.md) when the number represents completion and [Status](Status.md) for changing state.
