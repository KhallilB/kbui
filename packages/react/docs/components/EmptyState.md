# EmptyState

Explain why a collection, search result, or section has no content to show, and provide the direct action that populates or recovers it.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-emptystate--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, EmptyState } from "@kb.ui/react";

export function Example() {
  return (
    <EmptyState
      eyebrow="Pipelines"
      title="No release pipelines configured"
      description="Create a pipeline to validate builds and publish signed packages."
      actions={<Button size="sm">Create pipeline</Button>}
    />
  );
}
```

## More examples

- [Filtered zero results](https://kbui.kcb.pro/storybook/?path=/story/components-emptystate--filtered-zero-results): Give people a one-click way to clear active filters or widen their query.
- [Recoverable section failure](https://kbui.kcb.pro/storybook/?path=/story/components-emptystate--recoverable-failure): Explain when a section failed to load and pair the explanation with a retry action.
- [Surface variants](https://kbui.kcb.pro/storybook/?path=/story/components-emptystate--variants-and-sizes): Choose `surface`, `subtle`, or `plain` containers to match surrounding hierarchy.

## Reference

| Prop           | Type                                         | Default   | Notes                                                                                  |
| -------------- | -------------------------------------------- | --------- | -------------------------------------------------------------------------------------- |
| `title`        | `ReactNode`                                  | required  | Heading text naming what is missing or unavailable                                     |
| `description`  | `ReactNode`                                  | unset     | Supporting guidance explaining how to populate or recover the view                     |
| `eyebrow`      | `ReactNode`                                  | unset     | Short uppercase label above the title                                                  |
| `icon`         | `ReactNode`                                  | unset     | Decorative emblem above the header; hidden from assistive technology                   |
| `actions`      | `ReactNode`                                  | unset     | Primary and secondary buttons or links that resolve the empty state                    |
| `footer`       | `ReactNode`                                  | unset     | Quiet footnote, error code, or secondary hint below actions                            |
| `headingLevel` | `2` / `3` / `4`                              | `3`       | Semantic heading tag (`h2`–`h4`) matching the surrounding document outline             |
| `variant`      | `surface` / `subtle` / `plain`               | `surface` | Raised bordered card, dashed recessed well, or borderless inline block                 |
| `size`         | `sm` / `md` / `lg`                           | `md`      | Scales padding, icon badge, and heading typography                                     |
| `tone`         | `neutral` / `info` / `warning` / `danger`    | `neutral` | Accentuates the icon badge and border for informational or failure states              |
| `live`         | `boolean`                                    | `false`   | Adds `role="status"` when revealed dynamically after filtering or an async load error  |
| `classNames`   | keyed classes                                | unset     | Style `icon`, `header`, `eyebrow`, `title`, `description`, `body`, `actions`, `footer` |

## Related components

Use [`Skeleton`](Skeleton.md) while the collection is still loading, [`Callout`](Callout.md) for inline notices beside populated content, and [`Toast`](Toast.md) for transient action feedback.
