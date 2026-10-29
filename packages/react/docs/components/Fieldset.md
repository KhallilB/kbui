# Fieldset

Use Fieldset to group related controls into a named form section using native `fieldset` and `legend` semantics. Setting `disabled` disables descendant form controls natively.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-fieldset--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Fieldset, Input } from "@kb.ui/react";

export function Example() {
  return (
    <Fieldset legend="Contact details" description="How we can reach you.">
      <Input label="Email" type="email" name="email" />
    </Fieldset>
  );
}
```

## More examples

- [A group-level error](https://kbui.kcb.pro/storybook/?path=/story/components-fieldset--with-error): Explain a correction for a named group.
- [An unavailable group](https://kbui.kcb.pro/storybook/?path=/story/components-fieldset--disabled): Inspect disabled descendant controls.

## Reference

| Prop             | Type                                                           | Default  | Notes                                                  |
| ---------------- | -------------------------------------------------------------- | -------- | ------------------------------------------------------ |
| `legend`         | `ReactNode`                                                    | required | Section heading rendered inside the native legend      |
| `visuallyHidden` | `boolean`                                                      | `false`  | Hides the legend visually while keeping the group name |
| `description`    | `ReactNode`                                                    | unset    | Section help text linked through aria-describedby      |
| `error`          | `ReactNode`                                                    | unset    | Group-level error linked through aria-describedby      |
| `disabled`       | `boolean`                                                      | `false`  | Disables all descendant controls in the fieldset       |
| `classNames`     | `ClassNames<"legend" \| "description" \| "fields" \| "error">` | unset    | Classes for inner parts                                |

Other native fieldset props and `ref` pass through to the `<fieldset>` element. Use `--kb-fieldset-gap`, `--kb-fieldset-fields-gap`, and `--kb-fieldset-legend-size` to tune spacing and legend typography.

## Related components

Use [Textarea](Textarea.md) and [Input](Input.md) for answers, [ErrorSummary](ErrorSummary.md) for submission recovery, and [FormActions](FormActions.md) for the action row.
