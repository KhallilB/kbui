# __Name__

Describe when to use __Name__ and what caller-owned content or state it expects.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-__name__--docs)

## Usage

```tsx
import "__pkg__/styles.css";
import { __Name__ } from "__pkg__";

export function Example() {
  return <__Name__>Content</__Name__>;
}
```

## More examples

- [Default](https://kbui.kcb.pro/storybook/?path=/story/components-__name__--default): Primary component state.

## Reference

| Prop       | Type        | Default | Notes                    |
| ---------- | ----------- | ------- | ------------------------ |
| `children` | `ReactNode` | unset   | Visible __Name__ content |

Native element props pass through. Document confirmed keyboard, focus, and naming behavior in `apps/storybook/catalog/component-guides.ts` and `apps/storybook/catalog/accessibility-guides.ts` after implementation.

## Related components

Link nearby components and explain when to choose each.
