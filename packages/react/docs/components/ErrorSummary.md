# ErrorSummary

Place ErrorSummary at the top of a form when submission fails so people can see what went wrong and jump directly to each invalid field. When `items` is empty, nothing is rendered.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-errorsummary--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { ErrorSummary, Input } from "@kb.ui/react";

export function Example() {
  return (
    <form noValidate>
      <ErrorSummary
        items={[{ href: "#email", label: "Enter an email address." }]}
      />
      <Input id="email" label="Email" error="Enter an email address." />
    </form>
  );
}
```

This example shows a failed-submission state. The Form recovery story below demonstrates validation and moving focus to the summary after submission.

## More examples

- [Recover after submission](https://kbui.kcb.pro/storybook/?path=/story/components-errorsummary--form-recovery): Run validation, focus the summary, and jump to invalid fields.

## Reference

| Prop           | Type                                                                 | Default                | Notes                                                            |
| -------------- | -------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------- |
| `items`        | `readonly ErrorSummaryItem[]`                                        | required               | Ordered `{ id?, href, label }` entries linking to invalid fields |
| `title`        | `ReactNode`                                                          | `"There is a problem"` | Heading text naming the alert region                             |
| `description`  | `ReactNode`                                                          | unset                  | Optional recovery guidance above the error list                  |
| `headingLevel` | `2 \| 3 \| 4`                                                        | `2`                    | Heading rank for the summary title                               |
| `onItemSelect` | `(href: string, event: MouseEvent<HTMLAnchorElement>) => void`       | unset                  | Called when a recovery link is clicked                           |
| `classNames`   | `ClassNames<"title" \| "description" \| "list" \| "item" \| "link">` | unset                  | Classes for inner parts                                          |

ErrorSummary renders an alert region with `tabIndex={-1}` so your submit handler can focus it when validation fails. Clicking an `#id` link focuses the matching control or the first enabled control inside a referenced group. Pair ErrorSummary with inline `error` props on each invalid field.

## Related components

Keep inline errors on [Input](Input.md), [Textarea](Textarea.md), and other fields. Use [FormActions](FormActions.md) for the submit controls.
