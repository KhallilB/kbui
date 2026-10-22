# Tokens

Every kbui value is defined in one file, `packages/tokens/tokens.json`. The file follows the [W3C Design Tokens](https://www.designtokens.org/tr/drafts/format/) format, and the build turns each entry into a CSS custom property prefixed with `--kb-`.

## Token kinds

| Kind | Examples | Who uses it |
|---|---|---|
| Palette | `--kb-gray-500`, `--kb-blue-600`, `--kb-red-500`, `--kb-amber-700`, `--kb-green-700`, `--kb-teal-700`, `--kb-white`, `--kb-black` | Other tokens only. A component stylesheet that references one fails `bun run check`; the family list lives in `packages/css/src/build.ts`. |
| Scale | `--kb-space-4`, `--kb-radius-md`, `--kb-size-sm`, `--kb-font-sans` | Components and apps, directly |
| Semantic color | `--kb-color-bg`, `--kb-color-fg`, `--kb-color-accent`, `--kb-color-danger`, `--kb-color-info`, `--kb-color-success`, `--kb-color-warning` | Components and apps. These are the values that change in dark mode. Each status color has a matching `-fg` for text placed on it. |
| Motion | `--kb-motion-duration-fast`, `--kb-motion-duration-base`, `--kb-motion-duration-slow`, `--kb-motion-easing-standard`, `--kb-motion-easing-enter`, `--kb-motion-easing-exit` | Transitions that respond to a user action. Nothing in kbui animates on its own, and every transition is disabled under `prefers-reduced-motion`. |
| Component | `--kb-button-radius`, `--kb-input-height-md`, `--kb-dialog-width`, `--kb-facet-radius`, `--kb-status-running` | One component each. Override one to adjust that component without affecting others. The `facet.*` and `status.*` groups are the surface a product skin may set; see [decision 0010](decisions/0010-dark-product-skin-light-validated.md). |

## Naming

A token's CSS name is its path in the file joined with dashes: `color.accent-hover` becomes `--kb-color-accent-hover`. Keys may contain letters, digits, `_` and `-`.

## Aliases

A path in braces makes one token refer to another:

```json
"accent": { "$type": "color", "$value": "{blue.600}" }
```

This builds to `--kb-color-accent: var(--kb-blue-600);`. The reference stays live, so changing `--kb-blue-600` changes every token that points at it. The build stops with an error if an alias points at a token that does not exist.

The reference resolves where the alias is declared, which is `:root`. An override on `:root` flows through every alias. An override on a wrapper element does not: the alias already holds the root value there. For example, `--kb-facet-background` aliases `--kb-color-surface`, so a wrapper that sets `--kb-color-surface` leaves facets unchanged; set `--kb-facet-background` instead.

## Dark mode

The W3C format has no concept of themes, so each semantic color stores its dark value in an extension next to its light value:

```json
"bg": { "$type": "color", "$value": "{white}", "$extensions": { "kb.dark": "{gray.950}" } }
```

From this, the build writes three blocks:

```css
:root { /* every token, light values */ }
[data-theme="dark"] { /* dark values only */ }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { /* the same dark values */ } }
```

Set `data-theme="light"` or `data-theme="dark"` on `<html>` to force a theme. Without the attribute, the visitor's system setting applies.

## Using tokens

In CSS, reference the variable:

```css
.my-panel { padding: var(--kb-space-4); background: var(--kb-color-surface); }
```

In TypeScript, add the tokens package (`bun add ../kbui/packages/tokens`) and import the `tokens` object. It holds variable names, not values, so it is correct in either theme:

```ts
import { tokens } from "@kbui/tokens";

const style = { color: `var(${tokens.color.muted})` };
```

## Adding or changing a token

1. Edit `packages/tokens/tokens.json`. A semantic color also needs a `kb.dark` value.
2. Run `bun run build` and `bun run check`.
3. Check the result in Storybook under **Foundations / Tokens**. The swatches follow your system theme; to compare both themes, open a component story and use the theme switch in the toolbar.

Components should reference semantic or component tokens, never palette colors. A new component can define its own group, such as `badge.radius`, without further setup.
