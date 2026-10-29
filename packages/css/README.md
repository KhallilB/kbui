# @kb.ui/css

All kbui styling, as plain CSS. Components are styled through `kb-` classes and `data-*` attributes, so any renderer that produces the right markup gets the kbui look: React, another framework or hand-written HTML.

Published defaults use monochrome light/dark surfaces with a persimmon accent and shared tactile materials.

## Installation

For plain HTML or another renderer, add the standalone CSS package:

```sh
npm install @kb.ui/css
```

Keep it on the same version as any other kbui package your app installs. React apps receive this stylesheet through `@kb.ui/react`; see [Get Started](https://kbui.kcb.pro/setup/). The CSS package supplies styling and markup contracts. Your renderer supplies interactive behavior, state and accessibility.

## Importing

React apps import the same stylesheet from `@kb.ui/react/styles.css` and do not need this package. Every file wraps its rules in the `kbui` cascade layer (`kbui.tokens`, `kbui.reset`, `kbui.components`), so app CSS outside a layer wins. Other apps import the full stylesheet once at the root. It contains the tokens, a small reset and every component:

```ts
import "@kb.ui/css/styles.css";
```

Individual files are also available: `@kb.ui/css/reset.css`, or a single component such as `@kb.ui/css/components/button.css`. For a partial stylesheet, install `@kb.ui/tokens` at the same version and load `@kb.ui/tokens/tokens.css`, the reset and every component's required styles. The full stylesheet already contains these assets.

The examples use a bundler that resolves package imports. For a plain HTML page without a bundler, copy the built CSS into your app's served assets and link that file from the document head. A browser cannot resolve a bare npm package name as a stylesheet URL.

Plain HTML works as well:

```html
<button class="kb-button" data-variant="secondary" data-size="sm">Cancel</button>
```

## Components

The first line of each stylesheet describes the markup it expects. The table shows common entries; [styles.css](src/styles.css) lists every component import.

| File | Expected markup |
|---|---|
| `collection.css` | `.kb-collection` with toolbar, filters, native table, page checkboxes, bulk actions and pagination; renderer owns state; partial imports need Button, Checkbox, Input and Select CSS |
| `container.css` | `.kb-container` with `data-size` (`sm`, `md`, `lg`, `full`) and optional `data-gutter="none"` |
| `grid.css` | `.kb-grid` with `data-layout` (`auto`, `stack`), `data-columns` (`auto`, `1`, `2`, `3`, `4`), `data-min-item-width` (`sm`, `md`, `lg`), `data-gap` (`none`, `sm`, `md`, `lg`) and `data-align`; resets native list markers and margins |
| `inline.css` | `.kb-inline` with `data-gap`, `data-align` and `data-justify`; wraps in source order |
| `split.css` | `.kb-split` with `data-ratio`, `data-collapse`, `data-gap` and `data-align`; two `.kb-split-track` children containing the column content |
| `separator.css` | Native hr with `.kb-separator` and `data-orientation`; decorative rules need aria-hidden and role none |
| `heading.css` | Native heading with `.kb-heading` and `data-size` (`sm`, `md`, `lg`, `xl`, `display`); rank follows document outline |
| `text.css` | `p`, `span` or `div` with `.kb-text`, `data-size` (`sm`, `md`, `lg`) and `data-tone` (`default`, `muted`) |
| `link.css` | Native anchor with href and `.kb-link`; underline and visible keyboard focus |
| `code.css` | Inline `code.kb-code` or `.kb-code[data-block]` wrapping `-header`, `-viewport`, `-pre`, `-content`, `-line` (`[data-highlighted]`), `-line-number`, `-line-text` and `[data-syntax]` spans |
| `button.css` | `.kb-button` with `data-variant` (`primary`, `secondary`, `ghost`, `danger`), `data-size` (`sm`, `md`, `lg`, `icon`) and `data-disabled` |
| `numberfield.css` | `.kb-numberfield` with size/state attributes, label, grouped input/step controls and full-width help/error |
| `fileinput.css` | `.kb-fileinput` with labeled picker, retained list and named removal controls; also load Button CSS when importing parts |
| `combobox.css` | `.kb-combobox` with labeled search input, clear/trigger actions, portaled listbox popup and polite empty status |
| `multiselect.css` | `.kb-multiselect` with labeled chip toolbar, removable selection chips, search input, clear/trigger actions and portaled listbox popup |
| `input.css` | `.kb-input` with `data-size`, `data-invalid` and `data-disabled`, wrapping `-label`, `-shell`, `-start`, `-control`, `-end`, `-description` and `-error` parts |
| `textarea.css` | `.kb-textarea` with `data-resize`, `data-invalid`, `data-disabled` and `data-readonly`, wrapping `-label`, `-control`, `-description` and `-error` parts |
| `switch.css` | `.kb-switch` with `data-size`, `data-off-tone`, `data-on-tone`, `data-checked`, `data-disabled`, `data-readonly` and `data-invalid`, wrapping `-field`, `-target`, `-control`, `-track`, `-thumb`, `-off`, `-on`, `-label`, `-description` and `-error` parts |
| `fieldset.css` | Native `fieldset` with `.kb-fieldset`, `data-disabled` and `data-invalid`, wrapping `-legend`, `-description`, `-fields` and `-error` parts |
| `formactions.css` | `.kb-formactions` with `data-align` (`end`, `start`, `between`) and optional `data-divider` |
| `errorsummary.css` | `.kb-errorsummary` alert container with `-title`, `-description`, `-list`, `-item` and `-link` parts |
| `toast.css` | Named `.kb-toast-viewport` with logical `data-placement`, `.kb-toast` tone/state attributes and content/title/description/action/close parts; renderer owns queue, announcements, timing and focus |
| `descriptionlist.css` | Native dl/dt/dd groups with responsive label/value columns, density and dividers |
| `collectionlist.css` | Native unordered/ordered record lists with immediate-row density and separators |
| `collectionrow.css` | Native li with aligned leading/content/aside slots, selected state, wrapping actions and responsive stacking |
| `table.css` | Native table parts with density, sorting, selected rows, sticky headers/edges, a keyboard-scrollable container and independent row actions; see [Table API](../react/docs/components/Table.md) |
| `dialog.css` | `.kb-dialog-popup` with `-title`, `-description` and `-actions` parts, beside a `.kb-dialog-backdrop`. Both use Base UI's open, starting and ending attributes for animation |

## Build and test

The CSS bundles the token output, so build the tokens first:

```bash
bun run --cwd packages/tokens build
bun run --cwd packages/css build
bun run --cwd packages/css test
```

The tests check that each component file starts with its `Anatomy:` line and styles the root class it names. They fail if component or reset CSS uses a palette color such as `--kb-gray-500` or a raw color such as `#fff`.

[Adding a component](../../docs/guides/adding-a-component.md) describes the anatomy contract and its checks.

[Typography](../../docs/guides/typography.md) covers hierarchy, composition, plain HTML recipes and theme tokens.

See [Layout composition](../../docs/guides/layout.md) for widths, gutters, collapse thresholds and plain HTML recipes.
