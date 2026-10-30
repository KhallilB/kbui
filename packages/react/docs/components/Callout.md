# Callout

Keep a useful message close to the content it explains. Give people a concrete next step when they can resolve the issue.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-callout--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Callout } from "@kb.ui/react";

export function Example() {
  return (
    <Callout title="Changes saved" tone="success">
      You can close this page.
    </Callout>
  );
}
```

## More examples

- [Resolvable messages](https://kbui.kcb.pro/storybook/?path=/story/components-callout--with-actions): Place a next step beside its explanation.
- [Message tones](https://kbui.kcb.pro/storybook/?path=/story/components-callout--tones): Compare how tone reinforces written meaning.

## Reference

| Prop         | Type                                                  | Default   | Notes                                                           |
| ------------ | ----------------------------------------------------- | --------- | --------------------------------------------------------------- |
| `children`   | `ReactNode`                                           | unset     | Message body; explain what happened and what to do next         |
| `title`      | `ReactNode`                                           | unset     | Short summary above the message                                 |
| `tone`       | `neutral` / `info` / `success` / `warning` / `danger` | `neutral` | Reinforces the message without replacing its wording            |
| `icon`       | `ReactNode`                                           | unset     | Decorative icon; hidden from assistive technology               |
| `actions`    | `ReactNode`                                           | unset     | Named buttons or links that help resolve the message; end-aligned, primary last |
| `live`       | `boolean`                                             | `false`   | Adds `role=status` for changing message text; does not move focus |
| `classNames` | keyed classes                                         | unset     | Style icon, content, title, body, or actions                    |

## Related components

Use [`Status`](Status.md) for a short changing state and [`Dialog`](Dialog.md) for a focused modal task.
