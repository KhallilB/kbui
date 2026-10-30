# Input

Use `Input` for text entry. It keeps the label, help text, and error message together, and has space for icons or actions at either end.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-input--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Input } from "@kb.ui/react";

export function Example() {
  return <Input label="Email" type="email" name="email" autoComplete="email" />;
}
```

## More examples

- [Search and clear](https://kbui.kcb.pro/storybook/?path=/story/components-input--with-icons-and-actions): Keep the input stable while editing actions change.
- [Validation feedback](https://kbui.kcb.pro/storybook/?path=/story/components-input--with-error): Associate an error with the field.
- [A visually hidden label](https://kbui.kcb.pro/storybook/?path=/story/components-input--hidden-label): Retain the accessible name when hiding the visual label.

## Reference

| Prop                          | Type                   | Default  | Notes                                                         |
| ----------------------------- | ---------------------- | -------- | ------------------------------------------------------------- |
| `startContent` / `endContent` | `ReactNode`            |          | Icons or actions at either end; give actions accessible names |
| `label`                       | `string`               | required | Visible label and accessible name                             |
| `visuallyHidden`              | `boolean`              |          | Hides the label visually but keeps it for screen readers      |
| `description`                 | `string`               |          | Help text below the field                                     |
| `error`                       | `string`               |          | Shows an error message and marks the field invalid            |
| `size`                        | `"sm" \| "md" \| "lg"` | `"md"`   | Field height. Replaces the native `size` attribute            |
| `className`                   | `string`               |          | Applied to the wrapper, not the input element                 |

Other native `input` props, including `value` and `defaultValue`, pass through to the input. Base UI's `onValueChange` is also supported.

## Search composition

Use `Input type="search"` with content slots and a `Button` when search needs a visible clear action. Your app handles filtering, submission, debounce, reset, and result announcements.

```tsx
import { useRef, useState } from "react";
import { Button, Input } from "@kb.ui/react";

export function SearchExample() {
  const [query, setQuery] = useState("");
  const control = useRef<HTMLInputElement>(null);
  return (
    <Input
      ref={control}
      label="Search components"
      type="search"
      name="q"
      value={query}
      onValueChange={setQuery}
      endContent={
        query ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              control.current?.focus();
            }}
          >
            <span aria-hidden="true">×</span>
          </Button>
        ) : undefined
      }
    />
  );
}
```

The field label names the input. Give each action its own accessible name, and hide decorative icons with `aria-hidden`. Use `type="button"` on the clear action so it does not submit the form, then return focus to the input. Hide editing actions when the field is disabled or read-only. Adding or removing content at either end keeps the same input node, value, and focus. See the **Icons and actions** story for a working search example.

## Related components

Use [`Textarea`](Textarea.md) for multiline answers, [`NumberField`](NumberField.md) for numeric stepping, and [`Combobox`](Combobox.md) for a searchable choice from existing values.
