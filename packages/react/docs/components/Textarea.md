# Textarea

Use Textarea for multiline notes, summaries, or configuration payloads. It pairs a native textarea with a persistent label, optional help text, and validation feedback.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-textarea--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Textarea } from "@kb.ui/react";

export function Example() {
  return (
    <Textarea
      label="Review notes"
      name="notes"
      rows={5}
      description="Explain what needs attention."
    />
  );
}
```

## More examples

- [Validation feedback](https://kbui.kcb.pro/storybook/?path=/story/components-textarea--with-error): Associate an error with multiline input.
- [User resizing](https://kbui.kcb.pro/storybook/?path=/story/components-textarea--resize-modes): Compare allowed resize directions.

## Reference

| Prop             | Type                                                           | Default      | Notes                                                      |
| ---------------- | -------------------------------------------------------------- | ------------ | ---------------------------------------------------------- |
| `label`          | `string`                                                       | required     | Visible field label and accessible name                    |
| `visuallyHidden` | `boolean`                                                      | `false`      | Hides the label visually while keeping its accessible name |
| `description`    | `string`                                                       | unset        | Supporting help text below the control                     |
| `error`          | `string`                                                       | unset        | Validation message; marks the control invalid              |
| `rows`           | `number`                                                       | `4`          | Initial visible line count on the native textarea          |
| `resize`         | `"vertical" \| "none" \| "both"`                               | `"vertical"` | Controls user drag-resizing axis                           |
| `onValueChange`  | `(value: string) => void`                                      | unset        | Called with the next string value on change                |
| `classNames`     | `ClassNames<"label" \| "control" \| "description" \| "error">` | unset        | Classes for inner parts                                    |

Other native textarea props (`value`, `defaultValue`, `onChange`, `placeholder`, `disabled`, `readOnly`, `required`, `name`, `form`, `ref`) pass through to the `<textarea>` element. Adjust minimum height and padding with `--kb-textarea-min-height`, `--kb-textarea-padding-block`, and `--kb-textarea-padding-inline`.

## Related components

Use [Input](Input.md) for a single-line value and [Fieldset](Fieldset.md) to group related answers.
