# Button

Use a `Button` for an action such as saving a form or opening a dialog. Choose a variant to match the action’s importance.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-button--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button } from "@kb.ui/react";

export function Example() {
  return <Button type="submit">Save changes</Button>;
}
```

## More examples

- [Styled navigation](https://kbui.kcb.pro/storybook/?path=/story/components-button--as-link): Render a link with the correct semantics.
- [Icon-only actions](https://kbui.kcb.pro/storybook/?path=/story/components-button--icon-only): Give the action an accessible name.
- Show a pending action without moving surrounding controls. [Loading story](https://kbui.kcb.pro/storybook/?path=/story/components-button--loading)
- [Size choices](https://kbui.kcb.pro/storybook/?path=/story/components-button--sizes): Compare button sizes.

## Reference

| Prop        | Type                                              | Default     | Notes                                                                      |
| ----------- | ------------------------------------------------- | ----------- | -------------------------------------------------------------------------- |
| `children`  | `ReactNode`                                       | unset       | Visible action label, or an icon paired with `aria-label`                    |
| `variant`   | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"primary"` | Main, supporting, quiet, or destructive action emphasis                    |
| `size`      | `sm` / `md` / `lg` / `icon`                       | `md`        | Height and padding; `icon` is square and requires `aria-label`                 |
| `type`      | native `button` type                                | `button`    | Set `type="submit"` for form submission; use `type="button"` for other form actions          |
| `loading`   | `boolean` | `false` | Shows a decorative spinner, sets `aria-busy` and `aria-disabled`, and blocks repeat activation while retaining focus and width. |
| `disabled`  | `boolean`                                         | `false`     | Blocks interaction; explain unavailable actions in nearby text when needed |
| `render`    | element                                           | unset       | Use an anchor with `nativeButton={false}` and `role="link"` for navigation         |
| `className` | `string`                                          | unset       | Extra classes on the rendered control; function values are not supported   |

All props accepted by a native `button` or Base UI's `Button` also work. To render a link, pass an anchor and tell Base UI it is not a native `button`:

```tsx
<Button render={<a href="/docs" />} nativeButton={false} role="link">
  Docs
</Button>
```

## Loading an action

Pass `loading={pending}` while the action is running and keep the children stable so the button retains its name and width. The spinner fades in over the label area and appears instantly with reduced motion. The button can keep keyboard focus while loading. An explicitly disabled native button retains its normal disabled behavior. Keep any progress, success or failure message that should be announced in a separate status or alert region.

## Related components

Use [`Link`](Link.md) for navigation. Group coordinated actions with [`Toolbar`](Toolbar.md), or independent wrapping actions with [`Inline`](Inline.md).
