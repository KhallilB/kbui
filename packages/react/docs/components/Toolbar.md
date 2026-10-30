# Toolbar

Group related actions, such as editing or filtering controls. Give the row an accessible name so people know what its controls affect.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-toolbar--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Toolbar } from "@kb.ui/react";

export function Example() {
  return (
    <Toolbar aria-label="Document actions">
      <Toolbar.Button onClick={() => window.print()}>Print</Toolbar.Button>
    </Toolbar>
  );
}
```

## More examples

- [Coordinated actions](https://kbui.kcb.pro/storybook/?path=/story/components-toolbar--default): Try the toolbar’s single Tab entry and arrow-key navigation.

## Reference

| Part                | Props and responsibility                                                        |
| ------------------- | ------------------------------------------------------------------------------- |
| `Toolbar`           | Root; name with `aria-label`; Base UI orientation controls the keyboard direction |
| `Toolbar.Group`     | Groups related controls inside the toolbar                                      |
| `Toolbar.Button`    | Action; variant accepts `Button` variants and defaults to ghost                   |
| `Toolbar.Separator` | Visual division between groups                                                  |

Tab enters the toolbar once; arrow keys move between its controls. Give icon-only actions their own accessible names. Use `Checkbox` or `RadioGroup` when a control represents a persistent choice rather than an action.

## Related components

Use [`Inline`](Inline.md) for independent controls that should each retain their normal Tab stop, and [`Menu`](Menu.md) for a compact action list.
