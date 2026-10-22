# @kbui/react

React 19 components for kbui. The behavior comes from [Base UI](https://base-ui.com) 1.9, and the styling comes from `@kbui/css`. This package doesn't import any CSS itself, so remember to import the stylesheet once in your app.

```tsx
import "@kbui/css/styles.css";
import { Button, Dialog, Input } from "@kbui/react";
```

You'll need `react` and `react-dom` 19 in your project.

## Button

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"primary"` | How much visual weight it carries |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Height and padding |
| `className` | `string` | | Added after `kb-button` |
| `render` | element | | Renders a different element, such as a link |
| `disabled` | `boolean` | | Grays it out and blocks clicks |

Anything a native button or Base UI's `Button` accepts also works. To use it as a link, render an anchor and tell Base UI it isn't a real button:

```tsx
<Button render={<a href="/docs" />} nativeButton={false} role="link">Docs</Button>
```

## Input

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | The visible label, which is also the accessible name |
| `visuallyHidden` | `boolean` | | Hides the label on screen but keeps it for screen readers |
| `description` | `string` | | Help text under the field |
| `error` | `string` | | Shows an error message and marks the field invalid |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Height of the field. This replaces the native `size` attribute |
| `className` | `string` | | Goes on the wrapper, not the input itself |

The other native input props are passed to the input, including `value` and `defaultValue`. Base UI's `onValueChange` works as well.

## Dialog

`Dialog` is made of several parts that you put together. Base UI takes care of trapping focus, closing on Escape and locking the page scroll.

- `Dialog` is the root. It takes `open`, `defaultOpen` and `onOpenChange` if you want to control it.
- `Dialog.Trigger` opens it. Use `render={<Button />}` to make it look like a button.
- `Dialog.Content` is the dialog itself. Its `title` and `description` props give it an accessible name and description, and `container` changes where it's mounted.
- `Dialog.Title` and `Dialog.Description` are for custom layouts. Use either these or the props on a given dialog; using both gives it two titles.
- `Dialog.Actions` lines buttons up along the bottom right.
- `Dialog.Close` closes the dialog.

```tsx
<Dialog>
  <Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>
  <Dialog.Content title="Rename file">
    <Input label="Name" />
    <Dialog.Actions>
      <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
      <Button>Save</Button>
    </Dialog.Actions>
  </Dialog.Content>
</Dialog>
```

## The `kb()` helper

`kb(name, attrs, className)` builds the class and `data-*` props for a component's root element. It drops values that are `false` or `undefined`, and turns `true` into an empty attribute. You'll mostly use it when writing a new component; see [Adding a component](../../docs/guides/adding-a-component.md).

## Building and testing

```bash
bun run --cwd packages/react test
bun run --cwd packages/react build
bun run --cwd packages/react typecheck
```

Tests use Vitest and Testing Library in jsdom.
