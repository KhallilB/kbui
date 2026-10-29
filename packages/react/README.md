# @kb.ui/react

React components for forms, navigation, feedback, layout and typography. This adapter bundles the complete kbui stylesheet and CSS tokens. [Base UI](https://base-ui.com) 1.9 and `clsx` install automatically as runtime dependencies.

Default themes use monochrome light/dark surfaces, a persimmon accent, and shared tactile materials. This reference follows the source on `main`; check the [release notes](https://github.com/KhallilB/kbui/releases) for the exports available in an installed version.

## Installation

In your React app's folder:

```sh
npm install @kb.ui/react
```

Your app supplies `react` and `react-dom` 19 or later. TypeScript apps need compatible React type packages. Import the bundled stylesheet once at your app entry or framework's global-style entry:

```tsx
import "@kb.ui/react/styles.css";
import { Button } from "@kb.ui/react";

export function Save() {
  return <Button>Save changes</Button>;
}
```

The React adapter provides the components, styles and CSS variables together. Install the optional `@kb.ui/tokens` package only for typed variable names or token-only assets. Keep all installed kbui packages on one version. [Get Started](https://kbui.kcb.pro/setup/) generates versioned commands for npm, Bun, pnpm and Yarn; the [usage guide](../../docs/guides/using-kbui.md) covers prerequisites, upgrading, local development and troubleshooting.

## Styling

Every component takes `className` and `style`. Components with inner parts, such as Input, Select and Checkbox, also take `classNames` keyed by part; the props type lists each part. kbui's CSS sits in the `kbui` cascade layer, so your classes win. See [Restyling kbui](../../docs/guides/restyling.md).

```tsx
<Input label="Email" className="w-full" classNames={{ control: "rounded-none" }} />
```

### Themes and customization

Components follow the current light or dark theme through shared semantic tokens. Use `Button` for actions and its `render` prop for links styled as actions. Custom classes and token overrides are supported; preserve readable color pairs, visible focus and clear disabled states in both themes.

See [Restyling kbui](../../docs/guides/restyling.md#theme-every-component-with-tokens) for paired color overrides and nested themes. Contributors should follow [Theme and state support](../../docs/guides/adding-a-component.md#theme-and-state-support).

## Button

Use a Button for an action such as saving a form or opening a dialog. Choose a variant to match the action’s importance.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `children` | `ReactNode` | unset | Visible action label, or an icon paired with aria-label |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"primary"` | Main, supporting, quiet, or destructive action emphasis |
| `size` | `sm` / `md` / `lg` / `icon` | `md` | Height and padding; icon is square and requires aria-label |
| `type` | native button type | `button` | Set submit for form submission; use button for other form actions |
| `disabled` | `boolean` | `false` | Blocks interaction; explain unavailable actions in nearby text when needed |
| `render` | element | unset | Use an anchor with nativeButton=false and role=link for navigation |
| `className` | `string` | unset | Extra classes on the rendered control; function values are not supported |

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
import { Button, Input } from "@kb.ui/react";

export function SearchExample() {
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

| Prop on root or Content | Type | Default | Notes |
|---|---|---|---|
| `open` on Dialog | `boolean` | uncontrolled | Current visibility when your app controls the dialog |
| `defaultOpen` on Dialog | `boolean` | `false` | Initial visibility; avoid starting open in a reading surface |
| `onOpenChange` on Dialog | Base UI callback | unset | Receives the next visibility and change details |
| `title` on Content | `ReactNode` | unset | Visible title and accessible name; use Dialog.Title for custom markup instead |
| `description` on Content | `ReactNode` | unset | Supporting description; use Dialog.Description for custom markup instead |
| `container` on Content | portal container | document body | Themed host for a nested dialog |

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

| Prop | Values | Default | Notes |
|---|---|---|---|
| `tone` | `quiet` / `default` / `sunken` / `active` / `critical` | `default` | Changes the surface emphasis; pair state colors with explanatory text |
| `rail` | `none` / `accent` / `status` | `none` | Accent stays the accent color; status follows the current tone |
| `density` | `compact` / `standard` | `standard` | Changes padding without changing semantics |
| `collapsible` | `boolean` | `false` | Enables Panel.Toggle and collapsible body behavior |
| `open` | `boolean` | uncontrolled | Current body visibility when collapsible is enabled |
| `defaultOpen` | `boolean` | `false` | Initial visibility for an uncontrolled collapsible panel |
| `onOpenChange` | `(open: boolean) => void` | unset | Update open here when your app controls visibility |

`quiet` removes the panel background; `sunken` gives it a recessed surface. Use `Panel.Well` for logs or other output that should sit inside the panel. Customize the shape with `--kb-panel-radius`, the rim with `--kb-panel-rim-top`, `--kb-panel-border`, and `--kb-panel-rim-bottom`, and the depth with `--kb-panel-shadow` or `--kb-panel-shadow-active`.

For additional lighting, use `--kb-panel-sheen`, `--kb-panel-backdrop`, `--kb-panel-glow`, `--kb-panel-glow-active`, and `--kb-panel-glow-critical`. These effects stay off by default. Active and critical tones change the upper rim and glow colors. The rail follows the panel’s rounded corners.

### Resizable panels

Put `Panel.Handle` between two panels in a `Panel.Group` to let people resize them. The handle sizes the panel before it, as a percentage of the group; the panel after it takes the remaining space. Name each handle with `aria-label` or `aria-labelledby`. A column group needs a height.

```tsx
<Panel.Group direction="row">
  <Panel aria-labelledby="code-title">…</Panel>
  <Panel.Handle aria-label="Resize code" defaultSize={50} min={25} max={75} />
  <Panel aria-labelledby="view-title">…</Panel>
</Panel.Group>
```

`size` (controlled) or `defaultSize` (default `50`) sets the size of the panel before the handle in percent. `min` and `max` limit it (defaults `10` and `90`), `step` sets the arrow-key change (default `5`), and `onSizeChange` receives the next size after a key press or drag.

The handle follows the window splitter pattern. Arrow keys along the group's direction resize the panel, `Home` and `End` jump to the limits, and `Enter` collapses the panel to `min` and restores the previous size. Pointer drags work in both directions. Arrow keys do not flip in right-to-left layouts. Style the handle with `--kb-panel-handle-size`, `--kb-panel-handle-hit`, `--kb-panel-handle-grip`, `--kb-panel-handle-line` and `--kb-panel-handle-line-active`.

## Status

Use Status for a state such as running, blocked, or complete. Always include text so the meaning is clear without relying on color or an icon.

```tsx
<Status tone="running" appearance="chip" icon={<PlayIcon />} live>Running</Status>
```

| Prop | Values | Default | Notes |
|---|---|---|---|
| `children` | `ReactNode` | unset | State text such as Running or Blocked; keep it meaningful without color |
| `tone` | `neutral` / `info` / `running` / `success` / `warning` / `blocked` | `neutral` | Reinforces the written state |
| `appearance` | `plain` / `chip` | `plain` | Plain stays inline; chip adds separation with a tinted surface |
| `icon` | `ReactNode` | unset | Optional decorative icon; the text still names the state |
| `live` | `boolean` | `false` | Adds role=status for changing text; does not move focus |
| `compact` | `boolean` | `false` | Tighter spacing and smaller text for dense layouts |

## Display and layout helpers

Use [Badge](#badge) for metadata, [Status](#status) for changing states, [Stat](#stat) for a headline value, [Progress](#progress) for completion, and [Callout](#callout) for a message. [ScrollArea](#scrollarea) keeps long content in a named region.

## Badge

Add a short label to a person, record, or resource. Keep the text meaningful without its color. Use Status when the information changes over time.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `children` | `ReactNode` | unset | Short metadata such as Reviewer, Draft, or a branch name |
| `tone` | `neutral` / `info` / `success` / `warning` / `danger` | `neutral` | Reinforces the text with ink and tint |
| `appearance` | `chip` / `plain` | `chip` | Chip adds a tinted surface; plain stays inline |
| `mono` | `boolean` | `false` | Small uppercase monospace for short identifiers |
| `preserveCase` | `boolean` | `false` | Preserve case and spacing for branch names, paths, and other literal values |

Native span props pass through. Badge adds no focus stop or live announcement.

## Stat

Show a value with the label that explains it. Include units and a time period in the label or value when they affect the meaning.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `ReactNode` | required | What the value measures; read before the value |
| `value` | `ReactNode` | required | Number or short text; include units where needed |
| `size` | `md` / `display` | `md` | Use display for one headline number, md for groups |
| `classNames` | keyed classes | unset | Style the label and value separately |

## Progress

Show how much of a known task is complete. Use a task label rather than a percentage as the accessible name.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `ReactNode` | required | Visible task name and accessible progressbar label |
| `value` | `number` | required | Completed amount, from zero to max |
| `max` | `number` | `100` | Total amount; set it for counts such as three of five steps |
| `valueText` | `string` | formatted percentage | Visible and announced value, such as 3 of 5 files |
| `classNames` | keyed classes | unset | Style head, label, value, track, or indicator |

The current value stays available to assistive technology. Your app owns task completion and any separate completion announcement.

## Callout

Keep a useful message close to the content it explains. Give people a concrete next step when they can resolve the issue.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `children` | `ReactNode` | unset | Message body; explain what happened and what to do next |
| `title` | `ReactNode` | unset | Short summary above the message |
| `tone` | `neutral` / `info` / `success` / `warning` / `danger` | `neutral` | Reinforces the message without replacing its wording |
| `icon` | `ReactNode` | unset | Decorative icon; hidden from assistive technology |
| `actions` | `ReactNode` | unset | Named buttons or links that help resolve the message |
| `live` | `boolean` | `false` | Adds role=status for changing message text; does not move focus |
| `classNames` | keyed classes | unset | Style icon, content, title, body, or actions |

## ScrollArea

Keep logs, activity, or other long content inside a height cap. Let ordinary page content scroll with the page when a separate region is unnecessary.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Accessible name of the focusable scrolling region |
| `children` | `ReactNode` | required | Content inside the viewport |
| `maxHeight` | CSS length string | unset | Height cap, such as 12rem; longer content scrolls |
| `classNames` | keyed classes | unset | Style viewport, scrollbar, or thumb |

Tab reaches the viewport so keyboard users can scroll it. Keep the focus indicator visible and give the region a specific name such as Build output.

## Overlays and actions

Use [Menu](#menu) for a short list of actions, [Tooltip](#tooltip) for optional hints, and [Toolbar](#toolbar) for related actions that belong in a row. Use Dialog for a focused task with fields or a confirmation.

## Tooltip

Add a brief, optional hint to an already named control. Put essential instructions in visible text or a field description instead.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `children` | `ReactElement` | required | Focusable trigger that accepts Base UI props and a ref |
| `content` | `ReactNode` | required | Short, non-interactive hint shown on hover or focus |
| `side` | positioner side | `top` | Preferred side; placement can adjust near viewport edges |
| `delay` | `number` | `400` | Hover delay in milliseconds |
| `container` | portal container | document body | Use a themed host when the popup belongs to a nested theme |
| `className` | `string` | unset | Class on the popup |

Give icon-only triggers their own aria-label. The tooltip is a description, not a replacement for the control's name. Do not put links, buttons, or required instructions in the popup.

## Menu

Offer a short list of actions without leaving the current context. Use a Select when people are choosing a saved field value.

| Part | Props and responsibility |
|---|---|
| `Menu` | Root; use open/defaultOpen and onOpenChange when your app controls visibility |
| `Menu.Trigger` | Named trigger; render a Button for shared styling |
| `Menu.Content` | Popup; side defaults to bottom, align to start; container chooses the themed portal host |
| `Menu.Item` | Action text and click handler; disabled prevents selection |
| `Menu.Separator` | Divides related groups without adding a focus stop |

Name the trigger, keep action labels specific, and retain the default arrow-key and Escape behavior. A menu item should perform an action rather than contain another button.

## Toolbar

Group related actions, such as editing or filtering controls. Give the row an accessible name so people know what its controls affect.

| Part | Props and responsibility |
|---|---|
| `Toolbar` | Root; name with aria-label; Base UI orientation controls the keyboard direction |
| `Toolbar.Group` | Groups related controls inside the toolbar |
| `Toolbar.Button` | Action; variant accepts Button variants and defaults to ghost |
| `Toolbar.Separator` | Visual division between groups |

Tab enters the toolbar once; arrow keys move between its controls. Give icon-only actions their own accessible names. Use Checkbox or RadioGroup when a control represents a persistent choice rather than an action.

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

Combine [Card](#card) for related content and [Grid](#grid) for responsive arrangements.

## Card

Group related content with an optional title, summary, links, and actions. Card renders an article by default and adds no interaction of its own.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `as` | `article` / `div` / `li` | `article` | Choose the container for the document structure; use li inside a list |
| `appearance` | `outlined` / `plain` | `outlined` | Outlined adds a raised surface; plain stays flat with a dividing line |
| `children` | `ReactNode` | unset | Related content; your app provides headings, links, and actions |
| `className`, `style`, `ref` | native element props | unset | Style and reference the chosen container |

Card adds no link, button, keyboard handler, or tab stop. If a link covers the whole card, keep other controls outside that link and style its focus state. Restyle with the card background, face, shadow, color, border, radius, and padding tokens; they share the theme's tactile materials.

## Grid

Arrange cards or other content in equal columns that fit the available width. Grid uses ordinary CSS layout, without an ARIA grid role or special keyboard navigation.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `as` | `div` / `ul` / `ol` | `div` | Use ul or ol for a collection; children must then be list items |
| `layout` | `auto` / `stack` | `auto` | Auto fits equal columns to available width; stack uses one column |
| `children` | `ReactNode` | unset | Content in document and keyboard order |
| `className`, `style`, `ref` | native element props | unset | Style and reference the chosen container |

```tsx
<Grid as="ul" aria-label="Projects">
  <Card as="li"><h2><a href="/project">Project</a></h2><p>Summary</p></Card>
</Grid>
```

Use --kb-grid-gap and --kb-grid-min-item-width to adjust spacing and column fit. Keep the visual order the same as the reading order.

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
| `selectionMotion` | `"slide" \| "none"` | `"slide"` | Segmented selection background glides or moves instantly |
| `selectionTone` | `"primary" \| "neutral"` | `"primary"` | Accent pill by default; neutral uses the raised surface |
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

The segmented selection uses a pill shape with the primary accent color by default. Set `selectionTone="neutral"` for a raised surface with neutral text and borders. Both tones follow the current light or dark theme. The background slides along the padded track and follows option widths, wrapped rows and layout changes. Set `selectionMotion="none"` for instant changes. Reduced-motion preferences disable movement regardless of this setting; forced-colors mode uses the selected option’s system highlight.

In dark mode, the primary pill uses a darker orange with white text for contrast. Override `--kb-radiogroup-primary-background` and `--kb-radiogroup-primary-color` together to customize this pair without changing other primary controls.

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

## Combobox

Use Combobox to filter a longer option list before choosing one or multiple values. Each option has a string `value`, a visible `label`, and an optional `disabled` flag. Single selection uses `string | null`; enable `multiple` to use a `readonly string[]` value and a `(value: string[]) => void` callback. Pass `null` or `[]` for the corresponding empty selection.

Multiple mode delegates to [MultiSelect](#multiselect), including removable chips, keyboard navigation, clear-all, form submission, and disabled/read-only states. Its popup stays open after selections and deselections, retaining the current filter. Press Escape, click outside, or use the toggle to dismiss it. It uses `.kb-multiselect` CSS anatomy and `ClassNames<MultiSelectSlot>` slots, including `chips`, `chip`, `chipLabel`, and `chipRemove`. Single mode retains `.kb-combobox` anatomy. `ComboboxProps` remains the extensible single-selection interface, so existing wrappers can keep extending it. `ComboboxSingleProps` aliases that interface; use `ComboboxMultipleProps` for a multiple-selection wrapper or React's `ComponentProps<typeof Combobox>` for the complete discriminated union.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Visible field label and accessible combobox name |
| `options` | `readonly ComboboxOption[]` | required | Selectable options filtered by label |
| `multiple` | `boolean` | `false` | Enable multiple selections; determines value and callback types |
| `value` | `string \| null` or `readonly string[]` | required | Single selection or multiple selected values |
| `onValueChange` | `(value: string \| null) => void` or `(value: string[]) => void` | required | Callback matches selection mode |
| `placeholder` | `string` | unset | Input placeholder shown when empty |
| `emptyMessage` | `ReactNode` | `"No matching options"` | Polite status text when no options match |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height and text scale |
| `description` / `error` | `ReactNode` | unset | Associated help and invalid-state text |
| `disabled` / `readOnly` | `boolean` | `false` | Prevent edits; disabled also blocks form submission |
| `clearLabel` / `toggleLabel` | `string` | derived from `label` | Accessible names for the clear and toggle buttons |
| `container` | `Combobox.Portal.Props["container"]` | field root | Portal host; default retains nested theme |
| `classNames` | `ClassNames<ComboboxSlot>` or `ClassNames<MultiSelectSlot>` | unset | Slots match selection mode |
| `removeLabel` | `(option: ComboboxOption) => string` | `"Remove {option.label}"` | Multiple mode only; accessible chip removal name |

```tsx
import { useState } from "react";
import { Combobox } from "@kb.ui/react";

const regions = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "eu-central-1", label: "EU Central (Frankfurt)" },
];

export function RegionCombobox() {
  const [region, setRegion] = useState<string | null>("us-east-1");
  return (
    <Combobox
      label="Deployment region"
      options={regions}
      value={region}
      onValueChange={setRegion}
      placeholder="Search regions..."
    />
  );
}
```

```tsx
import { useState } from "react";
import { Combobox } from "@kb.ui/react";

export function DeploymentRegions() {
  const [regions, setRegions] = useState<string[]>([]);
  return (
    <Combobox
      multiple
      label="Deployment regions"
      options={[
        { value: "us-east-1", label: "US East (N. Virginia)" },
        { value: "eu-central-1", label: "EU Central (Frankfurt)" },
      ]}
      value={regions}
      onValueChange={setRegions}
      placeholder="Search regions..."
    />
  );
}
```

## MultiSelect

Use MultiSelect when people need to search a longer list and keep multiple selections visible as removable chips. Selected values render inside a named chip toolbar with keyboard arrow/Backspace/Delete support and per-chip remove buttons. Choosing or deselecting an option keeps the popup open and preserves the filter. Escape, an outside click, or the toggle closes it.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Visible field label and accessible combobox name |
| `options` | `readonly MultiSelectOption[]` | required | Selectable options filtered by label |
| `value` | `readonly string[]` | required | Controlled array of selected option values |
| `onValueChange` | `(value: string[]) => void` | required | Called when selections are added, removed, or cleared |
| `placeholder` | `string` | unset | Input placeholder |
| `emptyMessage` | `ReactNode` | `"No matching options"` | Polite status text when no options match |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Control height and text scale |
| `description` / `error` | `ReactNode` | unset | Associated help and invalid-state text |
| `disabled` / `readOnly` | `boolean` | `false` | Prevent edits and chip removal |
| `removeLabel` | `(option: MultiSelectOption) => string` | `"Remove {option.label}"` | Accessible name for each chip remove button |
| `container` | `Combobox.Portal.Props["container"]` | field root | Portal host; default retains nested theme |
| `classNames` | `ClassNames<MultiSelectSlot>` | unset | Extra classes for inner parts |

```tsx
import { useState } from "react";
import { MultiSelect } from "@kb.ui/react";

const scopes = [
  { value: "payments:read", label: "Payments read" },
  { value: "webhooks:manage", label: "Webhooks" },
  { value: "reporting:export", label: "Reporting export" },
];

export function ScopeMultiSelect() {
  const [selected, setSelected] = useState<string[]>(["payments:read"]);
  return (
    <MultiSelect
      label="API scopes"
      options={scopes}
      value={selected}
      onValueChange={setSelected}
      placeholder="Filter scopes..."
    />
  );
}
```

## Switch

Use Switch for a preference that takes effect as soon as it changes. Pass `checked` and update it in `onCheckedChange`; your app handles saving and form reset. Switch uses a labelled native checkbox with `role="switch"`. Use Checkbox when people are selecting items instead.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Associated visible label and accessible name |
| `checked` | `boolean` | required | Current controlled state |
| `onCheckedChange` | `(checked: boolean) => void` | required | Requests next state; owner updates checked |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Visual track size (`36×20px`, `44×24px`, `56×32px`); `Fieldset` defaults nested switches to `"sm"` while keeping a 44px touch target |
| `tone` | `"accent" \| "neutral" \| "info" \| "success" \| "warning" \| "danger"` | `"accent"` | Checked-state track tone when `onTone` is unset |
| `offTone` / `onTone` | `SwitchTone` | `"neutral"` / `tone` | Independent track tone for unchecked and checked sides |
| `offColor` / `onColor` | `string` | | Custom CSS color for the unchecked or checked track |
| `description` / `error` | `string` | | Associated helper/error text; error sets aria-invalid |
| `disabled` / `readOnly` | `boolean` | `false` | Disabled blocks focus/changes; read-only keeps focus and form value while blocking edits |
| `visuallyHidden` | `boolean` | `false` | Hide label visually, keep its accessible name |
| `offIcon` / `onIcon` | `ReactNode` | | Decorative slots; do not place interactive content inside |
| `name` / `value` / `form` / `required` | native input props | | Native form ownership, successful value and validation |
| `ref` | `Ref<HTMLInputElement>` | | Native checkbox, never an extra hidden control |
| `className` / `controlClassName` | `string` | | Root/native input class |
| `style` | `CSSProperties` | | Native input styles; CSS custom properties also reach visible track and thumb |

```tsx
import { useState } from "react";
import { Switch } from "@kb.ui/react";

export function Preference() {
  const [checked, setChecked] = useState(false);
  return <Switch label="Email updates" checked={checked} onCheckedChange={setChecked} name="updates" />;
}
```

Import `useState` from React and `Switch` from `@kb.ui/react`. Clicking or pressing Space calls `onCheckedChange`. Unchecked or disabled controls submit no value; a checked control submits its native value (`"on"` unless you supply one). Reset `checked` in the form’s `onReset` handler when needed. Use `offTone`/`onTone` or `offColor`/`onColor` when both sides of a toggle carry distinct state colors. The `switch` token group controls its appearance in both themes, and reduced motion removes the thumb’s travel animation.

## NumberField

Use NumberField for quantities people can type or adjust with step buttons. Your app sets the range and validates the value. See [Numeric fields](../../docs/guides/number-fields.md) for examples, keyboard behavior, and styling. Available since v0.6.0.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Visible field name; include the quantity or unit |
| `value` | `number` or `null` | required | Controlled number; null means no answer |
| `onValueChange` | `(value: number \| null) => void` | required | Update your stored value after an edit |
| `min`, `max` | `number` | unbounded | Bounds for stepping; your app validates direct drafts |
| `step` | `number` | `1` | Positive increment and alignment |
| `locale` | `Intl.LocalesArgument` | runtime locale | Number formatting and editing locale |
| `size` | `sm` / `md` / `lg` | `md` | Control size; lg suits touch-heavy tasks |
| `description`, `error` | `string` | unset | Associated help or a specific correction; error marks the field invalid |
| `disabled`, `readOnly` | `boolean` | `false` | Prevent changes; disabled also prevents submission |
| `name`, `form`, `required` | native form props | unset / false | Form ownership and validation |
| `visuallyHidden` | `boolean` | `false` | Hide the visual label while keeping its accessible name |
| `decrementLabel`, `incrementLabel` | `string` | Decrease/Increase + label | Localized names for the step actions |
| `inputRef`, `inputProps` | input ref / native props | unset | Visible input access and supported native event or ARIA extensions |
| `className`, `groupClassName`, `inputClassName` | `string` | unset | Classes for root, step group, and input |

Native div props and the root ref pass through to the wrapper. Any `aria-describedby` values from the root and `inputProps` are added after the help and error IDs. Use the explicit NumberField props for the input’s value, type, disabled/read-only state, name, required state, and ref; `inputProps` cannot override those. Custom event handlers can prevent defaults, so take care to preserve keyboard behavior.

## FileInput

Use FileInput to choose files, review the selected list, and remove items. Your app decides which files to accept, keeps the File objects, and handles uploads. See [Retained file selection](../../docs/guides/file-inputs.md) for examples, keyboard behavior, and styling. Available since v0.6.0.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Visible field name and accessible picker context |
| `items` | `readonly FileInputItem[]` | required | Retained files with stable ids, names, and optional descriptions |
| `onFiles` | `(files: File[]) => void` | required | Check the selection and update retained files in your app |
| `onRemove` | `(id: string) => void` | required | Request removal; update items to confirm it |
| `accept` | `string` | unset | Native picker hint, such as image/*; does not validate files |
| `multiple` | `boolean` | `true` | Allow multiple selection; use a singular chooseLabel for single mode |
| `disabled`, `readOnly` | `boolean` | `false` | Prevent edits while keeping the retained list visible |
| `description`, `error` | `string` | unset | Help or actionable rejection text associated with the field |
| `visuallyHidden` | `boolean` | `false` | Hide the visual label while preserving its accessible name |
| `chooseLabel` | `string` | Choose files | Localized visible picker action |
| `emptyMessage` | `string` | No files added. | Localized empty-state text |
| `removeLabel` | `(item: FileInputItem) => string` | Remove + filename | Accessible remove action; keep the filename in the name |
| `removedMessage` | `(item: FileInputItem) => string` | filename + removed. | Announcement after removal is confirmed |
| `selectionMessage` | `(count: number) => string` | count + files selected. | Announcement after native selection |
| `renderItem` | `(item: FileInputItem) => ReactNode` | name + description | Custom item content; keep visible file identity |
| `inputRef`, `triggerRef` | element refs | unset | Hidden native input and visible picker access |
| `triggerClassName`, `listClassName`, `itemClassName` | `string` | unset | Classes for picker, retained list, and items |

Root native div props/ref and className pass through. Root aria-describedby merges after helper/error. Item button refs remain internal to preserve focus; use public item/content classes and renderItem for presentation. Use these props and classes rather than reaching into individual item buttons. The `×` mark is decorative; removal has a full accessible filename label.

## Heading

Native `h1`–`h6` headings with visual size independent of rank.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `level` | `1` \| `2` \| `3` \| `4` \| `5` \| `6` | `2` | Document rank; choose from page structure |
| `size` | `sm` \| `md` \| `lg` \| `xl` \| `display` | From level | Levels 1–6 map to xl, lg, md, sm, sm, sm; display is an explicit hero size |
| `className`, `ref` | Native heading props | unset | Classes merge; ref targets native heading |

Use one page title and nest section ranks without skipping levels. Adjust `size` for context without changing the outline. Headings have no margin; use Grid or parent layout for spacing. See [Typography](../../docs/guides/typography.md) for composition, CSS recipes and accessibility guidance.

## Text

Body paragraphs, inline text and block grouping.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `as` | `p` \| `span` \| `div` | `p` | Use span inside paragraphs; div for block children |
| `size` | `sm` \| `md` \| `lg` | `md` | Existing small/body roles (13px, 15px), then 1.125rem |
| `tone` | `default` \| `muted` | `default` | Primary ink or readable secondary ink |
| `className`, `ref` | Native element props | unset | Ref type follows chosen element |

Body line height is 1.6; block content is bounded to 65ch by `--kb-text-measure`. Text has no margin. Inline spans keep natural flow. Use native `strong` and `em` for meaningful emphasis. Do not nest paragraphs or place block children inside the default paragraph.

## Link

Native anchor for navigation, with persistent underline and visible keyboard focus.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `href` | `string` | required | Navigation destination |
| `target`, `rel`, `download`, `aria-current` | Native anchor props | unset | Passed through without rewriting |
| `className`, `ref` | Native anchor props | unset | Ref targets anchor |

Use descriptive link text. Use Button for an action. Links inherit surrounding type size; Tab focuses, Enter follows, and Space retains native behavior. Callers own new-tab wording and target/rel policy. No disabled link or router adapter is provided; apply `kb-link` to a router component that renders an anchor with href. Color, underline and focus must remain visible.

## Code

Literal inline code in native `code`, or syntax-highlighted multiline code blocks with a header, copy action, line numbers, line emphasis, and collapsible viewport.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `children` | `ReactNode` | unset | Pass source code as a string; multiline strings auto-switch to block mode |
| `block` | `boolean` | auto | Force block (`true`) or inline (`false`) rendering |
| `language` | `CodeLanguage` | `"tsx"` in block mode | Grammar (`tsx`, `ts`, `jsx`, `js`, `css`, `html`, `json`, `bash`, `sh`, `shell`, `plain`, `text`) and badge label |
| `title` | `string` | unset | Filename or caption in the block header, or native `title` when `block={false}` |
| `copyable` | `boolean` | `true` in block mode | Show the copy-to-clipboard button in the block header |
| `onCopy` | `(code: string) => void` | unset | Called with the raw code string after a successful clipboard copy |
| `lineNumbers` | `boolean` | `false` | Render a non-selectable line-number gutter in block mode |
| `startLine` | `number` | `1` | Starting line number for `lineNumbers` and `highlightLines` |
| `highlightLines` | `readonly number[]` | unset | Line numbers (relative to `startLine`) to emphasize |
| `minLines` | `number` | unset | Minimum visible line count for the block (and default collapsed line count when `collapsible` is enabled without `collapsedLines`) |
| `collapsible` | `boolean` | `false` | Add an expand/collapse toggle for longer listings |
| `collapsedLines` | `number` | `minLines` | Visible line count when a `collapsible` block is collapsed |
| `defaultCollapsed` / `collapsed` | `boolean` | `false` / uncontrolled | Initial or controlled collapsed state when `collapsible` is enabled |
| `onCollapsedChange` | `(collapsed: boolean) => void` | unset | Called when the user toggles the collapsed state |
| `maxHeight` | `string \| number` | unset | Maximum viewport height in block mode |
| `tokens` | `readonly CodeToken[]` | `tokenizeCode()` | Custom `[start, end, kind]` syntax ranges overriding the built-in tokenizer |
| `classNames` | `ClassNames<CodePart>` | unset | Extra classes for `header`, `meta`, `title`, `language`, `actions`, `toggle`, `copy`, `viewport`, `pre`, `content`, `line`, `lineNumber`, and `lineText` |
| `className`, `ref` | Native element props | unset | Targets `code` in inline mode or root `div` in block mode |

```tsx
import { Code } from "@kb.ui/react";

export function SnippetExample() {
  return (
    <Code title="src/theme.ts" language="ts" lineNumbers highlightLines={[2]} minLines={4}>
      {`export const defaultTheme = "light";\nexport const accent = "persimmon";`}
    </Code>
  );
}
```

Single-line strings without block props render as an inline `code` element that inherits surrounding line height and wraps long paths. Strings containing `\n` or any block prop (`language`, `title`, `copyable`, `lineNumbers`, `highlightLines`, `minLines`, `collapsible`, `collapsedLines`, `maxHeight`, `tokens`) switch automatically to a framed block listing unless `block={false}` is set. Line numbers use CSS `attr(data-line-number)` so selecting or reading `code.textContent` returns only the raw code. Customize block surfaces and syntax colors with `--kb-code-block-*` and `--kb-code-syntax-*`.

## Container

Centered page boundary with responsive inline gutters. Native props and matching ref pass through. See [Layout composition](../../docs/guides/layout.md) for rules, CSS recipes and token overrides.

| Prop | Values | Default |
|---|---|---|
| `as` | `div` `main` `section` `article` `aside` `header` `footer` | `div` |
| `size` | `sm` (40rem) `md` (64rem) `lg` (80rem) `full` (unbounded) | `lg` |
| `gutter` | Shared 1–2rem inline padding; false removes it | `true` |

Non-default generic native elements require an explicit `as`; native props and refs follow that element. Explicit `gutter` owns its data attribute even when caller attributes conflict. Widths include gutters. Use one page boundary; nested containers should disable gutters when the parent owns padding.

## Inline

Wrapping row for independent content or controls. Adds no toolbar role or keyboard handling; controls retain native tab order. Native props and matching ref pass through.

| Prop | Values | Default |
|---|---|---|
| `as` | `div` `ul` `ol` `nav` | `div` |
| `gap` | `none` `sm` (0.5rem) `md` (1rem) `lg` (1.5rem) | `md` |
| `align` | `start` `center` `end` `baseline` `stretch` | `center` |
| `justify` | `start` `center` `end` `between` | `start` |

Non-default generic native elements require an explicit `as`. Lists retain markers and native list spacing. Use li children. Choose Toolbar when actions require its coordinated arrow-key model. See [Layout composition](../../docs/guides/layout.md).

## Split

Two children form equal or weighted columns through layout-owned `.kb-split-track` wrappers. Below the available-width threshold, columns stack in source order. Layout uses CSS alone, including inside nested panels. Native props and matching ref pass through.

| Prop | Values | Default |
|---|---|---|
| `as` | `div` `section` `article` | `div` |
| `ratio` | `equal` (1:1) `wide-start` (2:1) `wide-end` (1:2) | `equal` |
| `collapse` | `sm` (32rem) `md` (48rem) `lg` (64rem) | `md` |
| `gap` | `none` `sm` `md` `lg`, same scale as Inline | `md` |
| `align` | `start` `center` `end` `baseline` `stretch` | `stretch` |
| `classNames` | `{ track?: string }`, applied to each column track | unset |

Provide two children; empty conditional children add no track. Each track owns column sizing, so Text keeps its reading measure and nested token overrides stay local. Non-default generic native elements require an explicit `as`. Use Grid for variable child counts. See [Layout composition](../../docs/guides/layout.md).

## Separator

Native hr thematic break; decorative dividers are hidden from assistive technology. Native hr props and ref pass through; orientation and decorative own role, aria-hidden and aria-orientation.

| Prop | Values | Default |
|---|---|---|
| `orientation` | `horizontal` `vertical` | `horizontal` |
| `decorative` | Hide a visual-only divider from assistive technology | `false` |

Vertical rules stretch inside Inline and have a 1rem minimum height. No tab stop or resizing interaction is added. See [Layout composition](../../docs/guides/layout.md).

## Textarea

Use Textarea for multiline notes, summaries, or configuration payloads. It pairs a native textarea with a persistent label, optional help text, and validation feedback.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Visible field label and accessible name |
| `visuallyHidden` | `boolean` | `false` | Hides the label visually while keeping its accessible name |
| `description` | `string` | unset | Supporting help text below the control |
| `error` | `string` | unset | Validation message; marks the control invalid |
| `rows` | `number` | `4` | Initial visible line count on the native textarea |
| `resize` | `"vertical" \| "none" \| "both"` | `"vertical"` | Controls user drag-resizing axis |
| `onValueChange` | `(value: string) => void` | unset | Called with the next string value on change |
| `classNames` | `ClassNames<"label" \| "control" \| "description" \| "error">` | unset | Classes for inner parts |

Other native textarea props (`value`, `defaultValue`, `onChange`, `placeholder`, `disabled`, `readOnly`, `required`, `name`, `form`, `ref`) pass through to the `<textarea>` element. Adjust minimum height and padding with `--kb-textarea-min-height`, `--kb-textarea-padding-block`, and `--kb-textarea-padding-inline`.

## Fieldset

Use Fieldset to group related controls into a named form section using native `fieldset` and `legend` semantics. Setting `disabled` disables descendant form controls natively.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `legend` | `ReactNode` | required | Section heading rendered inside the native legend |
| `visuallyHidden` | `boolean` | `false` | Hides the legend visually while keeping the group name |
| `description` | `ReactNode` | unset | Section help text linked through aria-describedby |
| `error` | `ReactNode` | unset | Group-level error linked through aria-describedby |
| `disabled` | `boolean` | `false` | Disables all descendant controls in the fieldset |
| `classNames` | `ClassNames<"legend" \| "description" \| "fields" \| "error">` | unset | Classes for inner parts |

Other native fieldset props and `ref` pass through to the `<fieldset>` element. Use `--kb-fieldset-gap`, `--kb-fieldset-fields-gap`, and `--kb-fieldset-legend-size` to tune spacing and legend typography.

## FormActions

Use FormActions at the bottom of a form or section to align submit, reset, and secondary buttons with consistent wrapping and spacing. Buttons stay in natural Tab order without toolbar arrow-key navigation.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `align` | `"end" \| "start" \| "between"` | `"end"` | Horizontal button alignment |
| `divider` | `boolean` | `false` | Adds a top border and spacing above the action row |
| `children` | `ReactNode` | unset | Form buttons in reading and Tab order |

Other native div props and `ref` pass through. Use `--kb-formactions-gap` and `--kb-formactions-padding-top` to adjust spacing.

## ErrorSummary

Place ErrorSummary at the top of a form when submission fails so people can see what went wrong and jump directly to each invalid field. When `items` is empty, nothing is rendered.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `readonly ErrorSummaryItem[]` | required | Ordered `{ id?, href, label }` entries linking to invalid fields |
| `title` | `ReactNode` | `"There is a problem"` | Heading text naming the alert region |
| `description` | `ReactNode` | unset | Optional recovery guidance above the error list |
| `headingLevel` | `2 \| 3 \| 4` | `2` | Heading rank for the summary title |
| `onItemSelect` | `(href: string, event: MouseEvent<HTMLAnchorElement>) => void` | unset | Called when a recovery link is clicked |
| `classNames` | `ClassNames<"title" \| "description" \| "list" \| "item" \| "link">` | unset | Classes for inner parts |

ErrorSummary renders an alert region with `tabIndex={-1}` so your submit handler can focus it when validation fails. Clicking an `#id` link focuses the matching control or the first enabled control inside a referenced group. Pair ErrorSummary with inline `error` props on each invalid field.
