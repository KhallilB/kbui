# Tokens

Every kbui value is defined in one file, `packages/tokens/tokens.json`. The file follows the [W3C Design Tokens](https://www.designtokens.org/tr/drafts/format/) format, and the build turns each entry into a CSS custom property prefixed with `--kb-`.

## Token kinds

| Kind | Examples | Who uses it |
|---|---|---|
| Palette | `--kb-gray-500`, `--kb-blue-600`, `--kb-red-500`, `--kb-amber-700`, `--kb-green-700`, `--kb-teal-700`, `--kb-white`, `--kb-black` | Other tokens only. A component stylesheet that references one fails `bun run check`; the family list lives in `packages/css/src/build.ts`. |
| Scale | `--kb-space-4`, `--kb-radius-md`, `--kb-size-sm`, `--kb-font-sans`, `--kb-font-weight-strong`, `--kb-text-h1-size` | Components and apps, directly |
| Semantic color | `--kb-color-bg`, `--kb-color-fg`, `--kb-color-accent`, `--kb-color-danger`, `--kb-color-info`, `--kb-color-success`, `--kb-color-warning` | Components and apps. These are the values that change in dark mode. Each status color has a matching `-fg` for text placed on it. |
| Motion | `--kb-motion-duration-fast`, `--kb-motion-duration-base`, `--kb-motion-duration-slow`, `--kb-motion-duration-theme`, `--kb-motion-easing-standard`, `--kb-motion-easing-enter`, `--kb-motion-easing-exit`, `--kb-motion-easing-smooth` | Transitions that respond to a user action. Nothing in kbui animates on its own, and every transition is disabled under `prefers-reduced-motion`. |
| Component | `--kb-button-height-md`, `--kb-input-height-md`, `--kb-dialog-width`, `--kb-panel-radius`, `--kb-status-running` | One component each. Override one to adjust that component without affecting others. [Restyling kbui](guides/restyling.md) lists the groups a restyle usually sets. |

## Surface theming

Dialog, Button and popup (Menu, Tooltip) expose material, typography and motion tokens. Defaults reproduce the shipped design; override them on `:root` or a themed container.

| Surface | Tokens |
|---|---|
| Dialog | `--kb-dialog-background`, `-color`, `-border`, `-border-width`, `-padding`, `-shadow`, `-description-color`, `-overlay-background`, `-title-size`, `-title-family`, `-title-weight` |
| Dialog sections | `--kb-dialog-header-padding`, `-body-padding`, `-footer-padding` (default `0px`) |
| Dialog motion | `--kb-dialog-motion-duration`, `-motion-easing`, `-enter-scale`, `-enter-offset` |
| Button | `--kb-button-motion-duration`, `-motion-easing`, `-press-offset` |
| Popup | `--kb-popup-motion-duration`, `-motion-easing` |

Reduced motion still disables every transition and the button press offset. A portaled Dialog reads tokens from its `container`; pass a themed host to scope overrides.

## Naming

A token's CSS name is its path in the file joined with dashes: `color.accent-hover` becomes `--kb-color-accent-hover`. Keys may contain letters, digits, `_` and `-`.

## Aliases

A path in braces makes one token refer to another:

```json
"accent": { "$type": "color", "$value": "{blue.600}" }
```

This builds to `--kb-color-accent: var(--kb-blue-600);`. The reference stays live, so changing `--kb-blue-600` changes every token that points at it. The build stops with an error if an alias points at a token that does not exist.

The reference resolves where the alias is declared: on `:root`, and again on each `[data-theme]` container for aliases that depend on a theme value. An override on `:root` flows through every alias. An override on a plain wrapper element does not, because the alias already holds the root value there. Put `data-theme` on the wrapper to make it rebind aliases; [Restyling kbui](guides/restyling.md#restyle-part-of-a-page) shows the pattern.

## Dark mode

The W3C format has no concept of themes, so each semantic color stores its dark value in an extension next to its light value:

```json
"bg": { "$type": "color", "$value": "{white}", "$extensions": { "kb.dark": "{gray.950}" } }
```

From this, the build writes four blocks:

```css
:where(:root) { /* every token, light values; color-scheme: light */ }
:where([data-theme="light"]) { /* theme-dependent tokens, light values */ }
:where([data-theme="dark"]) { /* theme-dependent tokens, dark values; color-scheme: dark */ }
@media (prefers-color-scheme: dark) { :where(:root:not([data-theme="light"])) { /* the same dark values */ } }
```

A token is theme-dependent when it has a `kb.dark` value or aliases a token that does. Theme containers redeclare only those, so containers allow light inside dark and dark inside light while every other token inherits from `:root`. `:where()` gives every theme selector zero specificity, so a consumer rule loaded after kbui always wins.

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

Components should reference semantic, scale or component tokens, never palette colors or raw values. `bun run check` fails on a raw size, padding, gap, radius, font size, font weight, duration or easing in component CSS; hairlines up to 2px, `0` and `em` lengths are allowed. A new component can define its own group, such as `badge.radius`, without further setup.
