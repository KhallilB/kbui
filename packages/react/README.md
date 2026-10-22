# @kbui/react

React 19 components for kbui. Behavior comes from [Base UI](https://base-ui.com) 1.9; styling comes from `@kbui/css`, which this package does not import.

```tsx
import "@kbui/css/styles.css";
import { Button, Dialog, Input } from "@kbui/react";
```

Peer dependencies: `react` and `react-dom` 19.

## Button

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"primary"` | Visual weight |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Height and padding |
| `className` | `string` | | Added after `kb-button` |
| `render` | element | | Render another element, such as a link |
| `disabled` | `boolean` | | Sets `data-disabled` and blocks clicks |

All native button props and Base UI `Button` props pass through. For navigation:

```tsx
<Button render={<a href="/docs" />} nativeButton={false} role="link">Docs</Button>
```

## Input

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Accessible name |
| `visuallyHidden` | `boolean` | | Hides the label visually, keeps it for screen readers |
| `description` | `string` | | Help text, linked by `aria-describedby` |
| `error` | `string` | | Marks the field invalid and shows the message |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height; replaces the native `size` |
| `className` | `string` | | Added to the root, not the control |

All native input props pass through to the control, including `value`, `defaultValue` and Base UI's `onValueChange`.

## Dialog

A compound component built on Base UI's dialog. Focus trapping, Escape and scroll lock come from Base UI.

| Part | Purpose |
|---|---|
| `Dialog` | Root. Accepts `open`, `defaultOpen`, `onOpenChange` |
| `Dialog.Trigger` | Opens the dialog; use `render={<Button />}` to style it |
| `Dialog.Content` | Portal, backdrop and popup. `title` and `description` props set its accessible name and description; `container` sets the portal target |
| `Dialog.Title`, `Dialog.Description` | Use instead of the props for custom layouts, never both |
| `Dialog.Actions` | Right-aligned row of buttons |
| `Dialog.Close` | Closes the dialog |

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

## `kb()`

`kb(name, attrs, className)` returns the class and `data-*` props for a component root. `false` and `undefined` values are dropped and `true` becomes an empty attribute. Use it when building a new component; see [Adding a component](../../docs/guides/adding-a-component.md).

## Commands

```bash
bun run --cwd packages/react test        # Vitest + Testing Library, jsdom
bun run --cwd packages/react build       # dist/index.js and type declarations
bun run --cwd packages/react typecheck
```
