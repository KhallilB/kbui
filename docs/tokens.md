# Tokens

Every value in kbui comes from one file, `packages/tokens/tokens.json`, written in the [W3C Design Tokens](https://www.designtokens.org/tr/drafts/format/) format. The build turns it into CSS custom properties prefixed `--kb-`.

## Tiers

| Tier | Examples | Who may reference it |
|---|---|---|
| Palette primitives | `--kb-gray-500`, `--kb-blue-600`, `--kb-red-500`, `--kb-white`, `--kb-black` | Only other tokens. Component CSS that uses one fails the check. |
| Scale primitives | `--kb-space-4`, `--kb-radius-md`, `--kb-size-sm`, `--kb-font-sans` | Tokens and component CSS |
| Semantic colors | `--kb-color-bg`, `--kb-color-fg`, `--kb-color-accent`, `--kb-color-danger` | Component CSS, consumer CSS |
| Component tokens | `--kb-button-radius`, `--kb-input-height-md`, `--kb-dialog-width` | Their component's CSS, consumer overrides |

A token's CSS name is its path joined by `-`: `color.accent-hover` becomes `--kb-color-accent-hover`. Keys may use letters, digits, `_` and `-`.

## Aliases

A value in braces points at another token. The build writes it as a `var()` reference, so overriding the primitive updates everything that points at it.

```json
"accent": { "$type": "color", "$value": "{blue.600}" }
```

becomes `--kb-color-accent: var(--kb-blue-600);`. An alias to a missing token fails the build.

## Dark mode

The W3C format has no notion of themes, so a semantic token carries its dark value in an extension:

```json
"bg": { "$type": "color", "$value": "{white}", "$extensions": { "kb.dark": "{gray.950}" } }
```

The build emits three blocks:

```css
:root { /* every token, light values */ }
[data-theme="dark"] { /* dark values only */ }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { /* same dark values */ } }
```

Set `data-theme="light"` or `"dark"` on `<html>` to force a theme. Without it, the visitor's system setting decides.

## Using tokens

In CSS, reference the variable:

```css
.my-panel { padding: var(--kb-space-4); background: var(--kb-color-surface); }
```

In TypeScript, add the package (`bun add ../kbui/packages/tokens`) and use the typed `tokens` object. It holds variable names, not values, so it stays correct across themes:

```ts
import { tokens } from "@kbui/tokens";

const style = { color: `var(${tokens.color.muted})` };
```

## Adding or changing a token

1. Edit `packages/tokens/tokens.json`. Give semantic colors a `kb.dark` value; primitives and component tokens have none.
2. Run `bun run build`, then `bun run check`.
3. If a component should use it, reference the semantic or component token, never a palette primitive.
4. Look at it in Storybook under **Foundations / Tokens**. Swatches follow the system setting there; use a component story's theme toolbar to compare light and dark.

A new component's own token group, such as `badge.radius`, needs no extra setup: only palette names are restricted.
