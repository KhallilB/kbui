# @kbui/css

All kbui styling, as plain CSS. Components are styled through `kb-` classes and `data-*` attributes, so any renderer that produces the right markup gets the kbui look: React, another framework or hand-written HTML.

Current source defaults use monochrome light/dark surfaces with a persimmon accent and shared tactile materials. Locally built packages include this refresh; published v0.7.0 tarballs keep their original appearance.

## Importing

React apps import the same stylesheet from `@kbui/react/styles.css` and do not need this package. Every file wraps its rules in the `kbui` cascade layer (`kbui.tokens`, `kbui.reset`, `kbui.components`), so app CSS outside a layer wins. Other apps import the full stylesheet once at the root. It contains the tokens, a small reset and every component:

```ts
import "@kbui/css/styles.css";
```

Individual files are also available: `@kbui/css/reset.css`, or a single component such as `@kbui/css/components/button.css`. A single component file does not include the tokens, so load those separately.

Plain HTML works as well:

```html
<button class="kb-button" data-variant="secondary" data-size="sm">Cancel</button>
```

## Components

The first line of each stylesheet describes the markup it expects. The table shows common entries; [styles.css](src/styles.css) lists every component import.

| File | Expected markup |
|---|---|
| `heading.css` | Native heading with `.kb-heading` and `data-size` (`sm`, `md`, `lg`, `xl`, `display`); rank follows document outline |
| `text.css` | `p`, `span` or `div` with `.kb-text`, `data-size` (`sm`, `md`, `lg`) and `data-tone` (`default`, `muted`) |
| `link.css` | Native anchor with href and `.kb-link`; underline and visible keyboard focus |
| `code.css` | Native inline `code` with `.kb-code`; literal fragments and wrapping paths |
| `button.css` | `.kb-button` with `data-variant` (`primary`, `secondary`, `ghost`, `danger`), `data-size` (`sm`, `md`, `lg`, `icon`) and `data-disabled` |
| `numberfield.css` | `.kb-numberfield` with size/state attributes, label, grouped input/step controls and full-width help/error |
| `fileinput.css` | `.kb-fileinput` with labeled picker, retained list and named removal controls; also load Button CSS when importing parts |
| `input.css` | `.kb-input` with `data-size`, `data-invalid` and `data-disabled`, wrapping `-label`, `-shell`, `-start`, `-control`, `-end`, `-description` and `-error` parts |
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
