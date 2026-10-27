# @kbui/react

React components for forms, navigation, feedback, and layout. kbui uses [Base UI](https://base-ui.com) 1.9 for interaction and `@kbui/css` for styling, which this package includes as `@kbui/react/styles.css`. Import the stylesheet once, then use components throughout your app.

```tsx
import "@kbui/react/styles.css";
import { Button, Dialog, Input } from "@kbui/react";
```

Requires `react` and `react-dom` 19 in the consuming project.

## Styling

Every component takes `className` and `style`. Components with inner parts, such as Input, Select and Checkbox, also take `classNames` keyed by part; the props type lists each part. kbui's CSS sits in the `kbui` cascade layer, so your classes win. See [Restyling kbui](../../docs/guides/restyling.md).

```tsx
<Input label="Email" className="w-full" classNames={{ control: "rounded-none" }} />
```

## Button

Use a Button for an action such as saving a form or opening a dialog. Choose a variant to match the action’s importance.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"primary"` | How much emphasis the action receives |
| `size` | `"sm" \| "md" \| "lg" \| "icon"` | `"md"` | Height and padding; icon-only buttons require `aria-label` |
| `className` | `string` | | Added after `kb-button` |
| `render` | element | | Renders a different element, such as a link |
| `disabled` | `boolean` | | Dims the button and blocks interaction |

All props accepted by a native button or Base UI's `Button` also work. To render a link, pass an anchor and tell Base UI it is not a native button:

```tsx
<Button render={<a href="/docs" />} nativeButton={false} role="link">Docs</Button>
```

## Input

Use Input for text entry. It keeps the label, help text, and error message together, and has space for icons or actions at either end.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `startContent` / `endContent` | `ReactNode` | | Icons or actions at either end; give actions accessible names |
| `label` | `string` | required | Visible label and accessible name |
| `visuallyHidden` | `boolean` | | Hides the label visually but keeps it for screen readers |
| `description` | `string` | | Help text below the field |
| `error` | `string` | | Shows an error message and marks the field invalid |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Field height. Replaces the native `size` attribute |
| `className` | `string` | | Applied to the wrapper, not the input element |

Other native input props, including `value` and `defaultValue`, pass through to the input. Base UI's `onValueChange` is also supported.

### Search composition

Use `Input type="search"` with content slots and a `Button` when search needs a visible clear action. Your app handles filtering, submission, debounce, reset, and result announcements.

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

The field label names the input. Give each action its own accessible name, and hide decorative icons with `aria-hidden`. Use `type="button"` on the clear action so it does not submit the form, then return focus to the input. Hide editing actions when the field is disabled or read-only. Adding or removing content at either end keeps the same input node, value, and focus. See the **Icons and actions** story for a working search example.

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

Use Panel for a section that needs a header, body, and actions. Its parts help keep those areas aligned. Give the section an accessible name with `aria-labelledby`, pointing to the heading in `Panel.Header`.

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

`quiet` removes the panel background; `sunken` gives it a recessed surface. Use `Panel.Well` for logs or other output that should sit inside the panel. Customize the shape with `--kb-panel-radius`, the rim with `--kb-panel-rim-top`, `--kb-panel-border`, and `--kb-panel-rim-bottom`, and the depth with `--kb-panel-shadow` or `--kb-panel-shadow-active`.

For additional lighting, use `--kb-panel-sheen`, `--kb-panel-backdrop`, `--kb-panel-glow`, `--kb-panel-glow-active`, and `--kb-panel-glow-critical`. These effects stay off by default. Active and critical tones change the upper rim and glow colors. The rail follows the panel’s rounded corners.

## Status

Use Status for a state such as running, blocked, or complete. Always include text so the meaning is clear without relying on color or an icon.

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
| `Callout` | Highlight information and, when useful, offer a next step. | `tone`, `title`, `icon`, `actions`, `live` |
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

Use `Card` to group related content. It renders an article by default and adds no link, button, keyboard handler, or tab stop. Add links and actions where your content needs them. Use `as="li"` inside a list and `appearance="plain"` for a simpler row with a dividing line. If a link covers the whole card, style its focus state and keep other controls outside that link.

`Grid` arranges content into equal columns that fit the available width. Use `layout="stack"` for a single column, or `as="ul"` and `as="ol"` for lists. It uses ordinary CSS layout, without an ARIA grid role or special keyboard navigation.

```tsx
<Grid>
  <Card><h2><a href="/project">Project</a></h2><p>Summary</p></Card>
</Grid>
```

Restyle with `--kb-card-background`, `--kb-card-color`, `--kb-card-border`, `--kb-card-border-width`, `--kb-card-radius`, `--kb-card-padding`, `--kb-grid-gap` and `--kb-grid-min-item-width`. Defaults use semantic tokens in both themes.

## Checkbox

Use Checkbox when people can select options independently. It includes a label, help text, and error message. Pass `checked` and update it in `onCheckedChange`. Activating a mixed checkbox requests the checked state.

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

Clicking the label or pressing Space calls `onCheckedChange`. The checkbox changes only when your app updates `checked`; otherwise its checked or mixed state stays as it was. Native input props are supported. `style` applies to the input, and CSS custom properties also reach the visible mark. Use `--kb-checkbox-size` to change its size. In forced colors, the native checkbox and its focus outline remain visible.
## RadioGroup

Use RadioGroup when people need to choose one option and see all the choices at once. Give the group a label and each item a unique string value. Arrow keys change the selection and skip disabled options.

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

`RadioGroup.Item` forwards Base UI Radio props, including `value`, `disabled` and the native control ref. `className` styles the item label; `controlClassName` styles its radio slot. The group uses the shared theme colors and shadows. Adjust the control size with `--kb-radiogroup-size` and the spacing with `--kb-radiogroup-gap`.

Set `appearance="segmented"` for compact choices such as view, density, or a filter. The control still behaves as a radio group, rather than tabs with associated panels. Your app manages the value and resets it when the form resets. An item’s `required` prop participates in native form validation. Changing the appearance keeps the same controls and focus.

## Select

Use Select to choose one option from a dropdown. Each option has a string value, a visible label, and an optional disabled flag. Pass `null` to show the placeholder. Your app stores the selected value and decides whether it is valid.

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

Use the arrow keys or type to find an option, Enter to select it, and Escape to close the popup and return focus. Disabled options cannot be selected. When there are no options, the trigger is disabled and “No options available” appears below it. Opening the popup leaves the page scrollable. Pointer selection returns focus without a keyboard ring; keyboard dismissal keeps a visible focus indicator.

By default, the popup mounts inside the field root and inherits its theme. If you provide a custom `container`, apply the theme there too. Use `--kb-select-popup-min-width`, `--kb-select-max-height`, and `--kb-select-layer` to adjust the popup’s size and stacking order.

## Switch

Use Switch for a preference that takes effect as soon as it changes. Pass `checked` and update it in `onCheckedChange`; your app handles saving and form reset. Switch uses a labelled native checkbox with `role="switch"`. Use Checkbox when people are selecting items instead.

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

Import `useState` from React and `Switch` from `@kbui/react`. Clicking or pressing Space calls `onCheckedChange`. Unchecked or disabled controls submit no value; a checked control submits its native value (`"on"` unless you supply one). Reset `checked` in the form’s `onReset` handler when needed. The `switch` token group controls its appearance in both themes, and reduced motion removes the thumb’s travel animation.

## NumberField

Use NumberField for quantities people can type or adjust with step buttons. Your app sets the range and validates the value. See [Numeric fields](../../docs/guides/number-fields.md) for examples, keyboard behavior, and styling. Available since v0.6.0.

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
| className, groupClassName, inputClassName |unset | Classes for styling the root, group, and input |
| inputRef, inputProps |unset | Visible input ref and native event/ARIA extensions |

Native div props and the root ref pass through to the wrapper. Any `aria-describedby` values from the root and `inputProps` are added after the help and error IDs. Use the explicit NumberField props for the input’s value, type, disabled/read-only state, name, required state, and ref; `inputProps` cannot override those. Custom event handlers can prevent defaults, so take care to preserve keyboard behavior.

## FileInput

Use FileInput to choose files, review the selected list, and remove items. Your app decides which files to accept, keeps the File objects, and handles uploads. See [Retained file selection](../../docs/guides/file-inputs.md) for examples, keyboard behavior, and styling. Available since v0.6.0.

| Prop | Default | Responsibility |
|---|---|---|
| label, items, onFiles, onRemove | required | Field label, selected files, and callbacks for choosing and removing files |
| accept |unset | Native file-type hint |
| multiple | true | Permit native multiple selection |
| disabled, readOnly | false | Prevent changes while keeping the list visible |
| description, error |unset | Associated help/rejection text |
| visuallyHidden | false | Accessible field label without visible label |
| chooseLabel |Choose files | Localized picker action; use singular text for single mode |
| emptyMessage |No files added. | Localized empty state |
| removeLabel(item) |Remove + name | Localized accessible remove action |
| removedMessage(item) |name + removed. | Localized confirmed-removal announcement |
| selectionMessage(count) |count + files selected. | Localized native-selection announcement |
| renderItem(item) |name + description | Caller content; preserve visible file identity |
| triggerClassName, listClassName, itemClassName |unset | Classes for styling the picker, list, and items |
| inputRef, triggerRef |unset | Native hidden input and visible picker refs |

Root native div props/ref and className pass through. Root aria-describedby merges after helper/error. Item button refs remain internal to preserve focus; use public item/content classes and renderItem for presentation. Use these props and classes rather than reaching into individual item buttons. The `×` mark is decorative; removal has a full accessible filename label.
