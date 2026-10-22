# @kbui/react

React 19 components for kbui. Behavior comes from [Base UI](https://base-ui.com) 1.9 and styling from `@kbui/css`. This package imports no CSS, so import the stylesheet once in your app.

```tsx
import "@kbui/css/styles.css";
import { Button, Dialog, Input } from "@kbui/react";
```

Requires `react` and `react-dom` 19 in the consuming project.

## Button

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"primary"` | Visual weight |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Height and padding |
| `className` | `string` | | Added after `kb-button` |
| `render` | element | | Renders a different element, such as a link |
| `disabled` | `boolean` | | Dims the button and blocks interaction |

All props accepted by a native button or Base UI's `Button` also work. To render a link, pass an anchor and tell Base UI it is not a native button:

```tsx
<Button render={<a href="/docs" />} nativeButton={false} role="link">Docs</Button>
```

## Input

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Visible label and accessible name |
| `visuallyHidden` | `boolean` | | Hides the label visually but keeps it for screen readers |
| `description` | `string` | | Help text below the field |
| `error` | `string` | | Shows an error message and marks the field invalid |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Field height. Replaces the native `size` attribute |
| `className` | `string` | | Applied to the wrapper, not the input element |

Other native input props, including `value` and `defaultValue`, pass through to the input. Base UI's `onValueChange` is also supported.

## Dialog

`Dialog` is composed from parts. Base UI handles focus trapping, closing on Escape and scroll locking.

| Part | Purpose |
|---|---|
| `Dialog` | Root. Accepts `open`, `defaultOpen` and `onOpenChange` for controlled use. |
| `Dialog.Trigger` | Opens the dialog. Use `render={<Button />}` to style it as a button. |
| `Dialog.Content` | The dialog. `title` and `description` set its accessible name and description; `container` changes where it mounts. |
| `Dialog.Title`, `Dialog.Description` | For custom layouts. Use these or the `Dialog.Content` props in a given dialog, not both, or it gets two titles. |
| `Dialog.Actions` | Aligns buttons along the bottom right. |
| `Dialog.Close` | Closes the dialog. |

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

## Facet

A section plane with an optional clipped corner. Name it with `aria-labelledby` pointing at the heading in `Facet.Header`.

```tsx
<Facet tone="active" cut="both" rail="status" aria-labelledby="queue-title">
  <Facet.Header>
    <h2 id="queue-title">Queue</h2>
    <Facet.Toolbar><Button size="sm">Retry</Button></Facet.Toolbar>
  </Facet.Header>
  <Facet.Body>…</Facet.Body>
  <Facet.Footer>…</Facet.Footer>
</Facet>
```

| Prop | Values | Default |
|---|---|---|
| `tone` | `quiet` `default` `sunken` `active` `critical` | `default` |
| `cut` | `none` `start` `end` `both` | `none` |
| `rail` | `none` `accent` `status` | `none` |
| `density` | `compact` `standard` | `standard` |
| `collapsible`, `open`, `defaultOpen`, `onOpenChange` | Body becomes a panel driven by `Facet.Toggle` | off |

`quiet` draws no plane; `sunken` recesses onto the page color, for output wells inside another facet. Geometry and edges come from tokens: `--kb-facet-cut-start` and `--kb-facet-cut-end` set depth; `--kb-facet-cut-edge`, `--kb-facet-highlight` and `--kb-facet-divider` are transparent until a skin sets them, and light the chamfers, the top edge and the line under the header. The rail starts below the start cut.

## Status

Text plus an optional caller-provided icon; the text is mandatory.

```tsx
<Status tone="running" appearance="chip" icon={<PlayIcon />} live>Running</Status>
```

| Prop | Values | Default |
|---|---|---|
| `tone` | `neutral` `info` `running` `success` `warning` `blocked` | `neutral` |
| `appearance` | `plain` `chip` (tinted from the tone's own color) | `plain` |
| `live` | adds `role="status"` only | `false` |
| `compact` | tighter spacing, smaller text | `false` |

## `kb()`

`kb(name, attrs, className)` builds the class and `data-*` props for a component's root element. It omits values that are `false` or `undefined` and renders `true` as an empty attribute. It is mainly used when writing a new component; see [Adding a component](../../docs/guides/adding-a-component.md).

## Build and test

```bash
bun run --cwd packages/react test
bun run --cwd packages/react build
bun run --cwd packages/react typecheck
```

Tests use Vitest and Testing Library in jsdom.
