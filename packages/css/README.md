# @kbui/css

All of kbui's styling lives here, as plain CSS. Components are styled through `kb-` classes and `data-*` attributes, so anything that renders the right markup gets the kbui look, whether that's React, another framework or hand-written HTML.

## Importing

Most apps import the full stylesheet once at their root. It contains the tokens, a small reset and every component:

```ts
import "@kbui/css/styles.css";
```

You can also pull in pieces on their own, with `@kbui/css/reset.css` or a single component such as `@kbui/css/components/button.css`. A single component file doesn't include the tokens, so load those separately.

Plain HTML works too:

```html
<button class="kb-button" data-variant="secondary" data-size="sm">Cancel</button>
```

## The components

The first line of each stylesheet describes the markup it expects. Here's what's there today:

| File | Expects |
|---|---|
| `button.css` | `.kb-button` with `data-variant` (`primary`, `secondary`, `ghost`, `danger`), `data-size` (`sm`, `md`, `lg`) and `data-disabled` |
| `input.css` | `.kb-input` with `data-size`, `data-invalid` and `data-disabled`, wrapping `-label`, `-control`, `-description` and `-error` parts |
| `dialog.css` | `.kb-dialog-popup` with `-title`, `-description` and `-actions` parts, next to a `.kb-dialog-backdrop`. Both use Base UI's open, starting and ending attributes for the animation |

## Building and testing

The CSS bundles the token output, so build the tokens first:

```bash
bun run --cwd packages/tokens build
bun run --cwd packages/css build
bun run --cwd packages/css test
```

The tests make sure each component file starts with its `Anatomy:` line and actually styles the root class it names. They also fail if component or reset CSS uses a palette color like `--kb-gray-500` or a raw color like `#fff`.

[docs/architecture.md](../../docs/architecture.md) covers the contract in full.
