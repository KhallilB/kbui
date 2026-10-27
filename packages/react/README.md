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
| `size` | `"sm" \| "md" \| "lg" \| "icon"` | `"md"` | Height and padding; icon-only buttons require `aria-label` |
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
| `startContent` / `endContent` | `ReactNode` | | Optional control content; provide accessible names on actions |
| `label` | `string` | required | Visible label and accessible name |
| `visuallyHidden` | `boolean` | | Hides the label visually but keeps it for screen readers |
| `description` | `string` | | Help text below the field |
| `error` | `string` | | Shows an error message and marks the field invalid |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Field height. Replaces the native `size` attribute |
| `className` | `string` | | Applied to the wrapper, not the input element |

Other native input props, including `value` and `defaultValue`, pass through to the input. Base UI's `onValueChange` is also supported.

### Search composition

Use `Input type="search"` with content slots and a `Button` when search needs a visible clear action. Search stays an input recipe; filtering, submission, debounce, reset and result announcements belong to the application.

```tsx
import { useRef, useState } from "react";
import { Button, Input } from "@kbui/react";

function SearchExample() {
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
      endContent={query ? (
        <Button type="button" size="sm" variant="ghost" aria-label="Clear search"
          onClick={() => { setQuery(""); control.current?.focus(); }}>
          <span aria-hidden="true">×</span>
        </Button>
      ) : undefined}
    />
  );
}
```

The labelled field owns its accessible name, description and error. Give actions their own accessible names; hide decorative icons with `aria-hidden`. Clear uses `type="button"` and returns focus to the native input. Hide editing actions for disabled/read-only fields. The stable input shell preserves the native node, value and focus when slot content changes. See Input's canonical **Icons and actions** story for the search icon and working interaction.

## Dialog

`Dialog` is composed from parts. Base UI handles focus trapping, closing on Escape and scroll locking.

| Part | Purpose |
|---|---|
| `Dialog` | Root. Accepts `open`, `defaultOpen` and `onOpenChange` for controlled use. |
| `Dialog.Trigger` | Opens the dialog. Use `render={<Button />}` to style it as a button. |
| `Dialog.Content` | The dialog. `title` and `description` set its accessible name and description; `container` changes where it mounts. |
| `Dialog.Title`, `Dialog.Description` | For custom layouts. Use these or the `Dialog.Content` props in a given dialog, not both, or it gets two titles. |
| `Dialog.Header`, `Dialog.Body`, `Dialog.Footer` | Optional structured sections; accept native `div` props and refs. Padding follows `--kb-dialog-{header,body,footer}-padding`. |
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
| `Tooltip` | A visual hint on hover and focus. The trigger still needs its own accessible name. | `content`, `side`, `delay`, `container`, `className` |
| `Menu` | Overflow actions: `Menu.Trigger`, `Menu.Content`, `Menu.Item`, `Menu.Separator`. | `side`, `align`, `container` on `Menu.Content` |
| `Toolbar` | A row of actions with one tab stop, moved through with the arrow keys. Name it with `aria-label`. | `Toolbar.Group`, `Toolbar.Button` (`variant`, ghost by default), `Toolbar.Separator` |

`Button size="icon"` is a square button for a lone icon. Its type requires `aria-label`.

Pass a themed element as `container` to keep a portaled Menu, Tooltip or Dialog inside a nested theme scope; the default mounts on `document.body`.

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

Restyle with `--kb-card-background`, `--kb-card-color`, `--kb-card-border`, `--kb-card-border-width`, `--kb-card-radius`, `--kb-card-padding`, `--kb-grid-gap` and `--kb-grid-min-item-width`. Defaults use semantic tokens in both themes.

## Checkbox

A controlled native checkbox with a tactile mark, associated label, helper and error text. The caller owns checked state; a mixed checkbox requests checked when activated.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Visible accessible label |
| `checked` | `boolean` | required | Controlled native checked state |
| `onCheckedChange` | `(checked: boolean) => void` | required | Next checked-state request |
| `indeterminate` | `boolean` | `false` | Announces mixed state; activation requests checked |
| `disabled` / `readOnly` | `boolean` | `false` | Block changes; disabled also leaves keyboard order |
| `description` / `error` | `string` | | Associated helper and invalid-state text |
| `visuallyHidden` | `boolean` | `false` | Hide label visually |
| `controlClassName` | `string` | | Added to the native checkbox |
| `ref` | `Ref<HTMLInputElement>` | | Native checkbox, including form and indeterminate state |
| `name` / `value` / `required` | native input props | | Form serialization and validation |
| `className` | `string` | | Root class |

```tsx
<Checkbox label="Receive release updates" name="updates" checked={updates} onCheckedChange={setUpdates} />
```

Label activation and Space request changes. A declined controlled update preserves checked and mixed DOM state. Native input props remain supported. `style` applies to the native input; custom CSS properties also scope the decorative mark. Override `--kb-checkbox-size` for a different mark size. Forced colors retain the native checkbox and its focus outline.
## RadioGroup

A controlled single choice. The group supplies its label, error and form name; each item supplies its own label and unique string value. Arrow keys move selection and skip disabled items.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Visible accessible group label |
| `value` | `string \| null` | required | Controlled choice; null means no choice |
| `onValueChange` | `(value: string) => void` | required | Next choice request |
| `appearance` | `"standard" \| "segmented"` | `"standard"` | Segmented tray for compact single-choice controls |
| `disabled` | `boolean` | `false` | Disable every item |
| `name` | `string` | | Native form field name |
| `description` / `error` | `string` | | Associated help and invalid-state text |
| `visuallyHidden` | `boolean` | `false` | Hide group label visually |
| `ref` | `Ref<HTMLDivElement>` | | Group root |

```tsx
<RadioGroup label="Density" name="density" value={density} onValueChange={setDensity}>
  <RadioGroup.Item value="compact">Compact</RadioGroup.Item>
  <RadioGroup.Item value="comfortable">Comfortable</RadioGroup.Item>
</RadioGroup>
```

`RadioGroup.Item` forwards Base UI Radio props, including `value`, `disabled` and the native control ref. `className` styles the item label; `controlClassName` styles its radio slot. The group inherits semantic colors and material depth; `--kb-radiogroup-size` and `--kb-radiogroup-gap` adjust geometry.

Set `appearance="segmented"` for compact view, density or filter choices. Native radio semantics, keyboard navigation and form behavior stay shared; this is not tab/panel navigation. Caller controls value and form reset. Item `required` participates in native form validation. Changing appearance preserves control identity and focus.

## Select

A controlled, single-value selector. Options carry string values, visible labels and optional disabled flags. Null displays the placeholder. The caller owns domain validation and selection state.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Visible field label and accessible popup name |
| `value` | `string \| null` | required | Controlled selection; null means unset |
| `onValueChange` | `(value: string \| null) => void` | required | Next valid choice request |
| `options` | `readonly SelectOption[]` | required | Ordered unique values, labels and optional disabled flags |
| `placeholder` | `string` | `"Choose an option"` | Text for unset values |
| `description` / `error` | `string` | | Associated help and invalid-state text |
| `disabled` / `readOnly` | `boolean` | `false` | Prevent edits; disabled also blocks form submission |
| `name` | `string` | | Native hidden form field name |
| `container` | `Select.Portal.Props["container"]` | field root | Portal host; default retains nested theme |
| `controlClassName` / `popupClassName` | `string` | | Trigger and popup slot classes |
| `className` / `ref` | root div props | | Wrapper class and native root ref |

```tsx
<Select label="View" name="view" value={view} onValueChange={setView} options={[{ value: "recent", label: "Recent" }, { value: "all", label: "All records" }]} />
```

Arrow keys and typeahead navigate options. Enter selects; Escape returns focus. Disabled options cannot be selected. An empty collection disables the trigger and shows the visible helper “No options available”. Opening the nonmodal popup preserves page scrolling. Pointer selection returns focus without a keyboard ring; keyboard dismissal retains its visible focus indicator. The default field-root portal inherits local theme tokens; a custom container must provide the desired theme scope. `--kb-select-popup-min-width`, `--kb-select-max-height` and `--kb-select-layer` adjust popup geometry.

## Switch

A controlled on/off preference with one labelled native checkbox using `role="switch"`. The application owns checked state, saving and form reset. Use Checkbox for selecting items; use Switch for an immediate preference.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Associated visible label and accessible name |
| `checked` | `boolean` | required | Current controlled state |
| `onCheckedChange` | `(checked: boolean) => void` | required | Requests next state; owner updates checked |
| `description` / `error` | `string` | | Associated helper/error text; error sets aria-invalid |
| `disabled` / `readOnly` | `boolean` | `false` | Disabled blocks focus/changes; read-only keeps focus and form value while blocking edits |
| `visuallyHidden` | `boolean` | `false` | Hide label visually, keep its accessible name |
| `offIcon` / `onIcon` | `ReactNode` | | Decorative slots; do not place interactive content inside |
| `name` / `value` / `form` / `required` | native input props | | Native form ownership, successful value and validation |
| `ref` | `Ref<HTMLInputElement>` | | Native checkbox, never an extra hidden control |
| `className` / `controlClassName` | `string` | | Root/native input class |
| `style` | `CSSProperties` | | Native input styles; CSS custom properties also reach visible track and thumb |

```tsx
function Preference() {
  const [checked, setChecked] = useState(false);
  return <Switch label="Email updates" checked={checked} onCheckedChange={setChecked} name="updates" />;
}
```

Import `useState` from React and `Switch` from `@kbui/react`. Space and pointer actions request the same boolean change. Unchecked/disabled controls submit no value; a checked control submits its native value (`"on"` unless supplied). For controlled reset, set checked state in the form's `onReset` handler. Dark/light surfaces use shared recessed and raised materials through the `switch` token group; reduced motion removes thumb travel animation.

## NumberField

Controlled numeric editing and stepping; callers own ranges and validation. See [Numeric fields](../../docs/guides/number-fields.md) for examples, keyboard behavior, styling and limits. Prepared locally after 0.5.0; unreleased.

| Prop | Default | Responsibility |
|---|---|---|
| label, value, onValueChange | required | Accessible name and controlled number/null |
| min, max | unbounded | Clamp stepping; permit direct drafts outside bounds |
| step | 1 | Positive numeric step and alignment |
| locale | runtime | Intl numeric editing/display locale |
| name, form, required | unset/false | Native form behavior |
| disabled, readOnly | false | Prevent changes; disabled also prevents submission |
| size | md | sm 32px, md 40px, lg 48px; prefer lg for touch |
| description, error |unset | Associated help/error; error sets invalid state |
| visuallyHidden | false | Keep label accessible without visible label |
| decrementLabel, incrementLabel |Decrease/Increase + label | Localized step action names |
| className, groupClassName, inputClassName |unset | Stable root/group/input styling seams |
| inputRef, inputProps |unset | Visible input ref and native event/ARIA extensions |

Root native div props/ref pass through. `aria-describedby` from root and inputProps is merged after helper/error IDs. Native input value/type/disabled/readOnly/name/required/ref are controlled by explicit props and cannot be replaced through inputProps. Native events can prevent defaults deliberately; preserve keyboard semantics when extending them.

## FileInput

Controlled retained-file selection; callers own acceptance, metadata and uploads. See [Retained file selection](../../docs/guides/file-inputs.md) for examples, keyboard behavior, styling and limits. Prepared locally after 0.5.0; unreleased.

| Prop | Default | Responsibility |
|---|---|---|
| label, items, onFiles, onRemove | required | Accessible field name and controlled lifecycle |
| accept |unset | Native file-type hint |
| multiple | true | Permit native multiple selection |
| disabled, readOnly | false | Block mutations; keep list visible |
| description, error |unset | Associated help/rejection text |
| visuallyHidden | false | Accessible field label without visible label |
| chooseLabel |Choose files | Localized picker action; use singular text for single mode |
| emptyMessage |No files added. | Localized empty state |
| removeLabel(item) |Remove + name | Localized accessible remove action |
| removedMessage(item) |name + removed. | Localized confirmed-removal announcement |
| selectionMessage(count) |count + files selected. | Localized native-selection announcement |
| renderItem(item) |name + description | Caller content; preserve visible file identity |
| triggerClassName, listClassName, itemClassName |unset | Stable styling seams |
| inputRef, triggerRef |unset | Native hidden input and visible picker refs |

Root native div props/ref and className pass through. Root aria-describedby merges after helper/error. Item button refs remain internal to preserve focus; use public item/content classes and renderItem for presentation. No imperative item API is promised. The `×` mark is decorative; removal has a full accessible filename label.
