# @kbui/css

All of kbui's visual design, as plain CSS with no framework. Components are styled through `kb-` classes and `data-*` attributes, so any framework that renders the right markup gets the kbui look.

## Use

```ts
import "@kbui/css/styles.css";            // tokens, reset and every component
import "@kbui/css/reset.css";             // reset only
import "@kbui/css/components/button.css"; // one component, without tokens
```

Most apps import `styles.css` once at the root. A single component file needs the tokens loaded separately.

## Components

Each stylesheet's first line is its contract:

| File | Anatomy |
|---|---|
| `button.css` | `.kb-button [data-variant=primary\|secondary\|ghost\|danger] [data-size=sm\|md\|lg] [data-disabled]` |
| `input.css` | `.kb-input [data-size] [data-invalid] [data-disabled]` with parts `-label`, `-control`, `-description`, `-error` |
| `dialog.css` | `.kb-dialog-popup [data-open] [data-starting-style] [data-ending-style]` with parts `-title`, `-description`, `-actions`, and a sibling `.kb-dialog-backdrop` |

Rendering plain HTML with these classes works without React:

```html
<button class="kb-button" data-variant="secondary" data-size="sm">Cancel</button>
```

## Commands

```bash
bun run --cwd packages/tokens build   # css bundles the tokens output
bun run --cwd packages/css build      # writes dist/ with lightningcss
bun run --cwd packages/css test       # anatomy and palette guards
```

## Rules the tests enforce

- Each component file starts with `/* Anatomy: .kb-<name> … */`, and that root class appears as a selector.
- Component CSS and `reset.css` never use palette primitives (`--kb-gray-*`, `--kb-blue-*`, `--kb-red-*`, `--kb-white`, `--kb-black`) or raw color literals.

See [docs/architecture.md](../../docs/architecture.md) for the full contract.
