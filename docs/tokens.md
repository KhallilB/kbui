# Tokens

Every value in kbui comes from one file, `packages/tokens/tokens.json`. It uses the [W3C Design Tokens](https://www.designtokens.org/tr/drafts/format/) format, and the build turns each entry into a CSS custom property starting with `--kb-`.

## The four kinds of token

Palette colors are the raw ingredients: `--kb-gray-500`, `--kb-blue-600`, `--kb-red-500`, `--kb-white` and `--kb-black`. Only other tokens should use them. If a component stylesheet references one directly, `bun run check` fails.

Scale tokens cover spacing, radii, type sizes and font families, for example `--kb-space-4`, `--kb-radius-md`, `--kb-size-sm` and `--kb-font-sans`. Components use these directly.

Semantic colors describe a role rather than a hue: `--kb-color-bg`, `--kb-color-fg`, `--kb-color-accent`, `--kb-color-danger` and so on. These are what components and your own app styles should reach for, because they're the ones that change in dark mode.

Component tokens hold values that belong to a single component, such as `--kb-button-radius`, `--kb-input-height-md` or `--kb-dialog-width`. They're the easiest way to adjust one component without touching the others.

A token's CSS name is its path in the file joined with dashes, so `color.accent-hover` becomes `--kb-color-accent-hover`. Keys can contain letters, digits, `_` and `-`.

## Aliases

Wrapping a path in braces makes one token point at another:

```json
"accent": { "$type": "color", "$value": "{blue.600}" }
```

That builds to `--kb-color-accent: var(--kb-blue-600);`. Since it's a live reference, changing `--kb-blue-600` changes everything that points at it. If an alias points at a token that doesn't exist, the build stops with an error.

## Dark mode

The W3C format doesn't have themes, so we store each semantic color's dark value in an extension next to its light one:

```json
"bg": { "$type": "color", "$value": "{white}", "$extensions": { "kb.dark": "{gray.950}" } }
```

From that, the build writes three blocks of CSS:

```css
:root { /* every token, light values */ }
[data-theme="dark"] { /* dark values only */ }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { /* the same dark values */ } }
```

To force a theme, set `data-theme="light"` or `data-theme="dark"` on `<html>`. Leave it off and the visitor's system setting decides.

## Using tokens

In CSS, reference the variable:

```css
.my-panel { padding: var(--kb-space-4); background: var(--kb-color-surface); }
```

In TypeScript, add the tokens package (`bun add ../kbui/packages/tokens`) and import the `tokens` object. It holds variable names rather than values, which means it stays correct whichever theme is active:

```ts
import { tokens } from "@kbui/tokens";

const style = { color: `var(${tokens.color.muted})` };
```

## Adding or changing a token

Edit `packages/tokens/tokens.json`. If it's a semantic color, give it a `kb.dark` value as well. Then run `bun run build` and `bun run check`.

When a component needs the new value, have it use a semantic or component token rather than a palette color. A new component can have its own group, like `badge.radius`, without any extra setup.

Finally, look at it in Storybook under **Foundations / Tokens**. The swatches there follow your system's light or dark setting. To compare both themes, open a component story and use the theme switch in the toolbar.
