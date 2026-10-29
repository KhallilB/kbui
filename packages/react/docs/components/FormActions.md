# FormActions

Use FormActions at the bottom of a form or section to align submit, reset, and secondary buttons with consistent wrapping and spacing. Buttons stay in natural Tab order without toolbar arrow-key navigation.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-formactions--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, FormActions, Input } from "@kb.ui/react";

export function Example() {
  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <Input label="Project name" name="project" />
      <FormActions divider>
        <Button type="submit">Save changes</Button>
        <Button type="reset" variant="ghost">
          Reset
        </Button>
      </FormActions>
    </form>
  );
}
```

## More examples

- [Separate the action row](https://kbui.kcb.pro/storybook/?path=/story/components-formactions--with-divider): Keep a boundary above the actions.
- [Primary and secondary groups](https://kbui.kcb.pro/storybook/?path=/story/components-formactions--split-alignment): Compare actions at opposite ends of the row.

## Reference

| Prop       | Type                            | Default | Notes                                              |
| ---------- | ------------------------------- | ------- | -------------------------------------------------- |
| `align`    | `"end" \| "start" \| "between"` | `"end"` | Horizontal button alignment                        |
| `divider`  | `boolean`                       | `false` | Adds a top border and spacing above the action row |
| `children` | `ReactNode`                     | unset   | Form buttons in reading and Tab order              |

Other native div props and `ref` pass through. Use `--kb-formactions-gap` and `--kb-formactions-padding-top` to adjust spacing.

## Related components

Use [Fieldset](Fieldset.md) for named groups and [ErrorSummary](ErrorSummary.md) for failed submission recovery. Use [Toolbar](Toolbar.md) when controls need arrow-key navigation.
