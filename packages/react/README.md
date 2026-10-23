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

## Panel

A rounded section plane with a lit rim, a lift and optional emitted light. Name it with `aria-labelledby` pointing at the heading in `Panel.Header`.

```tsx
<Panel tone="active" rail="status" aria-labelledby="queue-title">
  <Panel.Header>
    <h2 id="queue-title">Queue</h2>
    <Panel.Toolbar><Button size="sm">Retry</Button></Panel.Toolbar>
  </Panel.Header>
  <Panel.Body>
    <Panel.Well>…</Panel.Well>
  </Panel.Body>
  <Panel.Footer>…</Panel.Footer>
</Panel>
```

| Prop | Values | Default |
|---|---|---|
| `tone` | `quiet` `default` `sunken` `active` `critical` | `default` |
| `rail` | `none` `accent` `status` | `none` |
| `density` | `compact` `standard` | `standard` |
| `collapsible`, `open`, `defaultOpen`, `onOpenChange` | Body collapses and expands from `Panel.Toggle` | off |

`quiet` draws no plane; `sunken` recesses onto the page color. `Panel.Well` is a recessed area for logs and output. Shape and light come from tokens: `--kb-panel-radius`, a rim from `--kb-panel-rim-top` through `--kb-panel-border` to `--kb-panel-rim-bottom`, `--kb-panel-shadow` and `--kb-panel-shadow-active` for the lift. `--kb-panel-sheen`, `--kb-panel-backdrop` and `--kb-panel-glow`, `-glow-active` and `-glow-critical` stay off until a skin turns them up. Active and critical recolor the top of the rim and the glow. The rail is clipped by the rounded plate.

## Status

Text plus an optional caller-provided icon; the text is mandatory.

```tsx
<Status tone="running" appearance="chip" icon={<PlayIcon />} live>Running</Status>
```

| Prop | Values | Default |
|---|---|---|
| `tone` | `neutral` `info` `running` `success` `warning` `blocked` | `neutral` |
| `appearance` | `plain` `chip` (tinted from the tone's own color; `--kb-status-radius` rounds it, `--kb-status-glow` makes the icon glow) | `plain` |
| `live` | adds `role="status"` only | `false` |
| `compact` | tighter spacing, smaller text | `false` |

## Display and layout helpers

| Component | Use | Key props |
|---|---|---|
| `Badge` | Static metadata such as a role or provider. Use `Status` for a state that changes. | `tone` (`neutral` `info` `success` `warning` `danger`), `appearance` (`chip` `plain`), `mono` (small uppercase monospace), `preserveCase` (keeps the case of branches and paths) |
| `Stat` | A labelled number. The label is read first, and figures are tabular. | `label`, `value`, `size` (`md` `display`) |
| `Progress` | Determinate progress with a visible label. | `label`, `value`, `max`, `valueText` (for example `"3 of 5"`, shown and announced) |
| `Callout` | An inline message that may need an answer. | `tone`, `title`, `icon`, `actions`, `live` |
| `ScrollArea` | Long content in a named region that keyboard users can focus. | `label`, `maxHeight` |

## Overlays and actions

| Component | Use | Key props |
|---|---|---|
| `Tooltip` | A visual hint on hover and focus. The trigger still needs its own accessible name. | `content`, `side`, `delay` |
| `Menu` | Overflow actions: `Menu.Trigger`, `Menu.Content`, `Menu.Item`, `Menu.Separator`. | `side`, `align` on `Menu.Content` |
| `Toolbar` | A row of actions with one tab stop, moved through with the arrow keys. Name it with `aria-label`. | `Toolbar.Group`, `Toolbar.Button` (`variant`, ghost by default), `Toolbar.Separator` |

`Button size="icon"` is a square button for a lone icon. Its type requires `aria-label`.

## `kb()`

`kb(name, attrs, className)` builds the class and `data-*` props for a component's root element. It omits values that are `false` or `undefined` and renders `true` as an empty attribute. It is mainly used when writing a new component; see [Adding a component](../../docs/guides/adding-a-component.md).

## Build and test

```bash
bun run --cwd packages/react test
bun run --cwd packages/react build
bun run --cwd packages/react typecheck
```

Tests use Vitest and Testing Library in jsdom.

## Card and Grid

`Card` is a neutral article surface with caller-owned content and navigation. It adds no link, button, keyboard handler or tab stop. Use `as="li"` inside lists and `appearance="plain"` for ruled rows. Keep a stretched link and its focus styling in the consumer; do not nest other controls inside a whole-card link.

`Grid` is CSS layout, with no ARIA grid role or keyboard model. It fits equal columns to available width; `layout="stack"` keeps one column. `as="ul"` or `as="ol"` preserves native list semantics.

```tsx
<Grid>
  <Card><h2><a href="/project">Project</a></h2><p>Summary</p></Card>
</Grid>
```

Skin with `--kb-card-background`, `--kb-card-color`, `--kb-card-border`, `--kb-card-border-width`, `--kb-card-radius`, `--kb-card-padding`, `--kb-grid-gap` and `--kb-grid-min-item-width`. Defaults use semantic tokens in both themes.
