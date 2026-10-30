# Menu

Offer a short list of actions without leaving the current context. Use a `Select` when people are choosing a saved field value.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-menu--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, Menu } from "@kb.ui/react";

export function Example() {
  return (
    <Menu>
      <Menu.Trigger render={<Button />}>Page actions</Menu.Trigger>
      <Menu.Content>
        <Menu.Item onClick={() => window.print()}>Print page</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
```

## More examples

- [Keyboard interaction](https://kbui.kcb.pro/storybook/?path=/story/components-menu--default): Try the trigger, arrow keys, and dismissal.
- [A themed popup](https://kbui.kcb.pro/storybook/?path=/story/components-menu--nested-theme): Check that the popup uses its parent theme.

## Reference

| Part             | Props and responsibility                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------- |
| `Menu`           | Root; use open/defaultOpen and `onOpenChange` when your app controls visibility            |
| `Menu.Trigger`   | Named trigger; render a `Button` for shared styling                                        |
| `Menu.Content`   | Popup; side defaults to bottom, align to start; container chooses the themed portal host |
| `Menu.Item`      | Action text and click handler; disabled prevents selection                               |
| `Menu.Separator` | Divides related groups without adding a focus stop                                       |

Name the trigger, keep action labels specific, and retain the default arrow-key and Escape behavior. A menu item should perform an action rather than contain another button.

## Related components

Use [`Select`](Select.md) for a saved field value and [`Dialog`](Dialog.md) for a focused task with content or fields.
