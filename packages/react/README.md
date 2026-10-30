# @kb.ui/react

React components for forms, navigation, feedback, layout and typography. This adapter bundles the complete kbui stylesheet and CSS tokens. [Base UI](https://base-ui.com) 1.9 and `clsx` install automatically as runtime dependencies.

Default themes use monochrome light/dark surfaces, a persimmon accent, and shared tactile materials. These references follow the current source; check the [release notes](https://github.com/KhallilB/kbui/releases) for the exports available in an installed version.

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

The React adapter provides the components, styles and CSS variables together. Install the optional `@kb.ui/tokens` package only for typed variable names or token-only assets. Keep all installed kbui packages on one version. [Get Started](https://kbui.kcb.pro/setup/) generates versioned commands for npm, Bun, pnpm and Yarn; the [usage guide](https://github.com/KhallilB/kbui/blob/main/docs/guides/using-kbui.md) covers prerequisites, upgrading, local development and troubleshooting.

## Start here

- [Install and configure kbui](https://github.com/KhallilB/kbui/blob/main/docs/guides/using-kbui.md): package setup, themes, and troubleshooting.
- [Browse live components](https://kbui.kcb.pro/components/): interactive states, code, and API tables.
- [Accessibility implementation and verification](https://github.com/KhallilB/kbui/blob/main/docs/guides/accessibility.md): requirements, caller responsibilities, manual checks, and evidence limits.
- [Component references](#components): usage, props, defaults, and behavior for every component.
- [Restyle components](https://github.com/KhallilB/kbui/blob/main/docs/guides/restyling.md): classes, inner parts, and tokens.

## Choose by task

| Task | Start here |
|---|---|
| Run an action or navigate | [Button](docs/components/Button.md) for actions; [ConfirmAction](docs/components/ConfirmAction.md) for destructive actions; [Link](docs/components/Link.md) for destinations |
| Collect choices | [Checkbox](docs/components/Checkbox.md) for independent choices; [RadioGroup](docs/components/RadioGroup.md) for one visible choice; [Select](docs/components/Select.md) for a dropdown; [Switch](docs/components/Switch.md) for an immediate setting |
| Collect text, quantities, or files | [Input](docs/components/Input.md), [Textarea](docs/components/Textarea.md), [NumberField](docs/components/NumberField.md), or [FileInput](docs/components/FileInput.md) |
| Reveal details or supporting controls | [Disclosure](docs/components/Disclosure.md), [Accordion](docs/components/Accordion.md), or [Popover](docs/components/Popover.md); [drawer and confirmation patterns](https://github.com/KhallilB/kbui/blob/main/docs/guides/forms-and-overlays.md#drawer-pattern) compose Dialog |
| Arrange a responsive page | [Container](docs/components/Container.md) for the page boundary; [Inline](docs/components/Inline.md) for rows; [Grid](docs/components/Grid.md) for collections; [Split](docs/components/Split.md) for two columns |
| Explain state, waiting, or completion | [Spinner](docs/components/Spinner.md) for indeterminate waits; [Skeleton](docs/components/Skeleton.md) for loading placeholders; [Progress](docs/components/Progress.md) for completion; [EmptyState](docs/components/EmptyState.md) for missing content; [Status](docs/components/Status.md) for changing state; [Toast](docs/components/Toast.md) for transient notifications; [Badge](docs/components/Badge.md) for metadata; [Callout](docs/components/Callout.md) for a fuller message |
| Compare records or scan details | [Table](docs/components/Table.md), [DescriptionList](docs/components/DescriptionList.md), [CollectionList](docs/components/CollectionList.md) and [CollectionRow](docs/components/CollectionRow.md) |
| Build readable content | [Heading](docs/components/Heading.md) and [Text](docs/components/Text.md) |

Start with the complete Usage example on a component page. Its More examples section links to focused, working Storybook states; Related components explains nearby alternatives. Use the live Docs page for component-specific keyboard, focus, and labeling guidance. Check those contracts with your app’s actual content and flows.

For searchable choices, compare [Combobox](docs/components/Combobox.md) and [MultiSelect](docs/components/MultiSelect.md). For complete forms, start with [Fieldset](docs/components/Fieldset.md), [FormActions](docs/components/FormActions.md), and [ErrorSummary](docs/components/ErrorSummary.md).

## Components

Choose by task. Each page contains a complete usage example, canonical API details, focused working stories, and related-component guidance.

### Media and identity

| Component | Use for |
|---|---|
| <a id="avatar"></a>[Avatar](docs/components/Avatar.md) | Recognizable people and organizations with photo/initials fallback. |
| <a id="image"></a>[Image](docs/components/Image.md) | Stable image sizing, crops, containment and failure states. |
| <a id="thumbnail"></a>[Thumbnail](docs/components/Thumbnail.md) | Captioned products, attachments and gallery previews. |

See [Media and identity](../../docs/guides/media-and-identity.md) for responsive sources, retry and gallery recipes. These components are implemented locally and unreleased.
### Collections

| Component | Use for |
|---|---|
| [Collection](docs/components/Collection.md) | Sort, filter, select and paginate records; includes useCollection, Collection.Pagination and Collection.BulkActions. |

### Navigation

| Component | Use it to |
| --- | --- |
| <a id="tabs"></a>[Tabs](docs/components/Tabs.md) | Switch between peer panels with keyboard navigation. |

### Actions

| Component | Use for |
|---|---|
| <a id="copyabletext"></a>[CopyableText](docs/components/CopyableText.md) | Copy identifiers and references with feedback and recovery. |
| <a id="button"></a>[Button](docs/components/Button.md) | Trigger an action or link to another page. |
| <a id="popover"></a>[Popover](docs/components/Popover.md) | Reveal supporting controls in an anchored popup. |
| <a id="dialog"></a>[Dialog](docs/components/Dialog.md) | Keep a focused task in a dialog while the page waits behind it. |
| <a id="confirmaction"></a>[ConfirmAction](docs/components/ConfirmAction.md) | Put a destructive action behind one confirmation that closes only after success. |
| <a id="menu"></a>[Menu](docs/components/Menu.md) | Keep related actions in a compact popup menu. |
| <a id="toolbar"></a>[Toolbar](docs/components/Toolbar.md) | Group related actions with arrow-key navigation. |

### Forms

| Component | Use for |
|---|---|
| <a id="checkbox"></a>[Checkbox](docs/components/Checkbox.md) | Let people select options independently, including a mixed selection. |
| <a id="combobox"></a>[Combobox](docs/components/Combobox.md) | Search and choose one or multiple options from a longer list. |
| <a id="errorsummary"></a>[ErrorSummary](docs/components/ErrorSummary.md) | Summarize form validation errors with links that focus each field. |
| <a id="fieldset"></a>[Fieldset](docs/components/Fieldset.md) | Group related fields with a native fieldset, legend, and section help. |
| <a id="fileinput"></a>[FileInput](docs/components/FileInput.md) | Choose files, review the list, and remove individual items. |
| <a id="formactions"></a>[FormActions](docs/components/FormActions.md) | Align submit, reset, and secondary actions at the end of a form. |
| <a id="input"></a>[Input](docs/components/Input.md) | Collect text with a clear label, help text, and error feedback. |
| <a id="multiselect"></a>[MultiSelect](docs/components/MultiSelect.md) | Search a list and keep multiple selections visible as removable chips. |
| <a id="numberfield"></a>[NumberField](docs/components/NumberField.md) | Enter a number by typing or using step buttons. |
| <a id="radiogroup"></a>[RadioGroup](docs/components/RadioGroup.md) | Choose one option from a visible group. |
| <a id="select"></a>[Select](docs/components/Select.md) | Choose one option from a dropdown list. |
| <a id="switch"></a>[Switch](docs/components/Switch.md) | Turn an immediate preference on or off. |
| <a id="textarea"></a>[Textarea](docs/components/Textarea.md) | Collect multiline text with a label, help text, and error feedback. |

### Feedback

| Component | Use for |
|---|---|
| <a id="badge"></a>[Badge](docs/components/Badge.md) | Add a short label, category, or piece of metadata. |
| <a id="toast"></a>[Toast](docs/components/Toast.md) | Queue temporary messages with announcements, actions and timed dismissal. |
| <a id="callout"></a>[Callout](docs/components/Callout.md) | Highlight a message and offer a useful next step. |
| <a id="emptystate"></a>[EmptyState](docs/components/EmptyState.md) | Explain why a collection or section is empty and offer the next action. |
| <a id="progress"></a>[Progress](docs/components/Progress.md) | Show how much of a task is complete. |
| <a id="skeleton"></a>[Skeleton](docs/components/Skeleton.md) | Reserve incoming content geometry while a section loads. |
| <a id="spinner"></a>[Spinner](docs/components/Spinner.md) | Indicate an indeterminate wait or busy control. |
| <a id="stat"></a>[Stat](docs/components/Stat.md) | Show a number alongside the label that explains it. |
| <a id="status"></a>[Status](docs/components/Status.md) | Describe a current state with text and an optional icon. |
| <a id="tooltip"></a>[Tooltip](docs/components/Tooltip.md) | Add brief context on hover or keyboard focus. |

### Layout

| Component | Use for |
|---|---|
| <a id="accordion"></a>[Accordion](docs/components/Accordion.md) | Group related disclosures under headings. |
| <a id="disclosure"></a>[Disclosure](docs/components/Disclosure.md) | Reveal optional details and controls inline. |
| <a id="card"></a>[Card](docs/components/Card.md) | Group related content, with room for links and actions. |
| <a id="container"></a>[Container](docs/components/Container.md) | Shared page widths and responsive gutters. |
| <a id="grid"></a>[Grid](docs/components/Grid.md) | Arrange content in responsive columns or a single stack. |
| <a id="inline"></a>[Inline](docs/components/Inline.md) | Wrapping rows with shared spacing and alignment. |
| <a id="panel"></a>[Panel](docs/components/Panel.md) | Organize a section with a header, content, and actions. |
| <a id="scrollarea"></a>[ScrollArea](docs/components/ScrollArea.md) | Keep longer content in a scrollable, keyboard-accessible region. |
| <a id="separator"></a>[Separator](docs/components/Separator.md) | Semantic or decorative horizontal and vertical rules. |
| <a id="split"></a>[Split](docs/components/Split.md) | Two columns that stack when their parent narrows. |

### Structured data

| Component | Use for |
|---|---|
| <a id="table"></a>[Table](docs/components/Table.md) | Compare fields across records with sorting, selection, actions and sticky layouts. |
| <a id="descriptionlist"></a>[DescriptionList](docs/components/DescriptionList.md) | Scan labeled facts with aligned, responsive key/value presentation. |
| <a id="collectionlist"></a>[CollectionList](docs/components/CollectionList.md) | Group unordered or ordered records with shared alignment and spacing. |
| <a id="collectionrow"></a>[CollectionRow](docs/components/CollectionRow.md) | Summarize a record with details, metadata, selection and independent actions. |

### Typography

| Component | Use for |
|---|---|
| <a id="codeblock"></a>[CodeBlock](docs/components/CodeBlock.md) | Explicit source listings with highlighting, line numbers and copy feedback. |
| <a id="code"></a>[Code](docs/components/Code.md) | Literal inline code and syntax-highlighted multiline code blocks. |
| <a id="heading"></a>[Heading](docs/components/Heading.md) | Native heading hierarchy with independent visual sizing. |
| <a id="link"></a>[Link](docs/components/Link.md) | Recognizable navigation with visible keyboard focus. |
| <a id="text"></a>[Text](docs/components/Text.md) | Readable paragraphs, inline text and supporting content. |

## Composition guides

Use these when a task spans several components:

- [Structured data](https://github.com/KhallilB/kbui/blob/main/docs/guides/structured-data.md): comparison tables, record details and collection rows.
- [Copyable content](https://github.com/KhallilB/kbui/blob/main/docs/guides/copyable-content.md): identifiers, commands, exact source and clipboard recovery.

- [Layout composition](https://github.com/KhallilB/kbui/blob/main/docs/guides/layout.md): page boundaries, wrapping rows, responsive columns, and separators.
- [Typography](https://github.com/KhallilB/kbui/blob/main/docs/guides/typography.md): heading hierarchy, readable copy, links, and inline code.
- [Forms and overlays](https://github.com/KhallilB/kbui/blob/main/docs/guides/forms-and-overlays.md): theme hosts, dialog structure, and focus behavior.
- [Loading and feedback](https://github.com/KhallilB/kbui/blob/main/docs/guides/loading-and-feedback.md): waiting states, missing content, asynchronous submission, and retry recipes.
- [Number fields](https://github.com/KhallilB/kbui/blob/main/docs/guides/number-fields.md): controlled values, validation, and locale-aware editing.
- [File inputs](https://github.com/KhallilB/kbui/blob/main/docs/guides/file-inputs.md): retained items, acceptance policy, and removal feedback.

## Search composition

Use the [Input search recipe](docs/components/Input.md#search-composition) for a labeled search field with a clear action and focus recovery.

## Resizable panels

Use the [Panel.Handle reference](docs/components/Panel.md#resizable-panels) for resizable panel groups and their pointer and keyboard behavior.

## Styling

Every component takes `className` and `style`. Components with inner parts, such as Input, Select and Checkbox, also take `classNames` keyed by part; the props type lists each part. kbui's CSS sits in the `kbui` cascade layer, so your classes win. See [Restyling kbui](https://github.com/KhallilB/kbui/blob/main/docs/guides/restyling.md).

```tsx
<Input label="Email" className="w-full" classNames={{ control: "rounded-none" }} />
```

### Themes and customization

Components follow the current light or dark theme through shared semantic tokens. Use `Button` for actions and its `render` prop for links styled as actions. Custom classes and token overrides are supported; preserve readable color pairs, visible focus and clear disabled states in both themes.

See [Restyling kbui](https://github.com/KhallilB/kbui/blob/main/docs/guides/restyling.md#theme-every-component-with-tokens) for paired color overrides and nested themes. Contributors should follow [Theme and state support](https://github.com/KhallilB/kbui/blob/main/docs/guides/adding-a-component.md#theme-and-state-support).

## `kb()`

`kb(name, attrs, className)` builds the class and `data-*` props for a component's root element. It omits values that are `false` or `undefined` and renders `true` as an empty attribute. It is mainly used when writing a new component; see [Adding a component](https://github.com/KhallilB/kbui/blob/main/docs/guides/adding-a-component.md).

## Build and test

```bash
bun run --cwd packages/react test
bun run --cwd packages/react build
bun run --cwd packages/react typecheck
```

Tests use Vitest and Testing Library in jsdom.
