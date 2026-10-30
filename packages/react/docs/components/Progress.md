# Progress

Show how much of a known task is complete. Use a task label rather than a percentage as the accessible name.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-progress--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Progress } from "@kb.ui/react";

export function Example() {
  return <Progress label="Upload progress" value={60} />;
}
```

## More examples

- [Counted work](https://kbui.kcb.pro/storybook/?path=/story/components-progress--steps): Present a readable completed/total value.
- [Completed work](https://kbui.kcb.pro/storybook/?path=/story/components-progress--complete): Inspect the final state.

## Reference

| Prop         | Type          | Default              | Notes                                                       |
| ------------ | ------------- | -------------------- | ----------------------------------------------------------- |
| `label`      | `ReactNode`   | required             | Visible task name and accessible progressbar label          |
| `value`      | `number`      | required             | Completed amount, from zero to max                          |
| `max`        | `number`      | `100`                | Total amount; set it for counts such as three of five steps |
| `valueText`  | `string`      | formatted percentage | Visible and announced value, such as 3 of 5 files           |
| `classNames` | keyed classes | unset                | Style head, label, value, track, or indicator               |

The current value stays available to assistive technology. Your app owns task completion and any separate completion announcement.

## Related components

Use [`Status`](Status.md) for a textual state and [`Stat`](Stat.md) for a headline measure without completion semantics.
