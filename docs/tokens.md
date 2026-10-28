# Tokens

Every kbui value is defined in one file, `packages/tokens/tokens.json`. The file follows the [W3C Design Tokens](https://www.designtokens.org/tr/drafts/format/) format, and the build turns each entry into a CSS custom property prefixed with `--kb-`.

Current source defaults use chalk and graphite surfaces with persimmon accents. `color.accent` owns action fills; `color.accent-ink` owns readable small accent text, including running statuses. Success, warning and danger retain separate semantic colors. Themes follow system preference unless an explicit `data-theme` is set. Local builds carry this refresh; previously published v0.7.0 assets are unchanged.

## Token kinds

| Kind | Examples | Who uses it |
|---|---|---|
| Palette | `--kb-gray-500`, `--kb-blue-600`, `--kb-red-500`, `--kb-amber-700`, `--kb-green-700`, `--kb-teal-700`, `--kb-white`, `--kb-black` | Other tokens only. A component stylesheet that references one fails `bun run check`; the family list lives in `packages/css/src/build.ts`. |
| Layout | `--kb-container-size-lg`, `--kb-container-gutter`, `--kb-layout-gap-md`, `--kb-split-collapse-md`, `--kb-separator-color` | Shared page widths, gutters, wrapping and column collapse; see [Layout composition](guides/layout.md#tokens-and-overrides). |
| Typography | `--kb-heading-size-xl`, `--kb-text-measure`, `--kb-link-color`, `--kb-code-size` | Shared hierarchy and inline content; see [Typography](guides/typography.md#theme-and-scale). |
| Scale | `--kb-space-4`, `--kb-radius-md`, `--kb-size-sm`, `--kb-font-sans`, `--kb-font-weight-strong`, `--kb-text-h1-size` | Components and apps, directly |
| Semantic color | `--kb-color-bg`, `--kb-color-fg`, `--kb-color-accent`, `--kb-color-danger`, `--kb-color-info`, `--kb-color-success`, `--kb-color-warning` | Components and apps. These are the values that change in dark mode. Each status color has a matching `-fg` for text placed on it. |
| Visualization | `--kb-viz-current`, `--kb-viz-current-bg`, `--kb-viz-current-fg`, `--kb-viz-visited`, `--kb-viz-changed` | Apps that draw data structures or algorithm state. See [Visualization roles](#visualization-roles). |
| Motion | `--kb-motion-duration-fast`, `--kb-motion-duration-base`, `--kb-motion-duration-slow`, `--kb-motion-duration-theme`, `--kb-motion-easing-standard`, `--kb-motion-easing-enter`, `--kb-motion-easing-exit`, `--kb-motion-easing-smooth` | Transitions that respond to a user action. Nothing in kbui animates on its own, and every transition is disabled under `prefers-reduced-motion`. |
| Component | `--kb-button-height-md`, `--kb-input-height-md`, `--kb-dialog-width`, `--kb-panel-radius`, `--kb-status-running` | One component each. Override one to adjust that component without affecting others. [Restyling kbui](guides/restyling.md) lists the groups a restyle usually sets. |

## Visualization roles

Use the `viz` tokens to mark the state of cells, nodes and pointers in a drawing, such as an array, grid or tree that an algorithm walks through. Each role has three tokens:

| Token | Use | Contrast held by the token tests |
|---|---|---|
| `--kb-viz-<role>` | Mark: outline, stroke, arrow or pointer label | 4.5:1 on `--kb-color-bg` and `--kb-color-surface` |
| `--kb-viz-<role>-bg` | Tint: cell or node fill | — |
| `--kb-viz-<role>-fg` | Text on the tint | 4.5:1 on the tint; the mark holds 3:1 on the tint |

| Role | Meaning | Light and dark source |
|---|---|---|
| `current` | The element the code is looking at now | Blue, separate from the accent so a cursor never reads as an error |
| `visited` | Processed or done | Teal |
| `changed` | Value changed in this step | `--kb-color-warning` |
| `error` | Out of bounds, failed check | `--kb-color-danger` |
| `discarded` | Out of range or no longer considered | `--kb-color-muted` on `--kb-color-surface` |
| `frontier` | Queued or next to visit | Aliases `current`; distinguish it by shape, such as a dashed outline |
| `path` | Part of the answer | `--kb-color-accent-ink` |

Never rely on color alone. Pair each role with a shape, label or pattern, because `current` and `visited` sit close together for some color-vision types, and forced-colors mode reduces several roles to the same system color.

## Forced colors

A token can name a system color in a `kb.forced` extension next to `kb.dark`:

```json
"current": { "$type": "color", "$value": "#2f5fa8", "$extensions": { "kb.dark": "#8fb4f0", "kb.forced": "Highlight" } }
```

The build writes these values in one `@media (forced-colors: active)` block on `:where(:root, [data-theme])`, after the theme blocks, so they replace light, dark and container values. Only the `viz` tokens use it today. Components keep their own forced-colors rules in their stylesheets.

## Surface theming

Dialog, Button and popup (Menu, Tooltip) expose material, typography and motion tokens. Defaults reproduce the shipped design; override them on `:root` or a themed container.

| Surface | Tokens |
|---|---|
| Dialog | `--kb-dialog-background`, `-color`, `-border`, `-border-width`, `-padding`, `-shadow`, `-description-color`, `-overlay-background`, `-title-size`, `-title-family`, `-title-weight` |
| Dialog sections | `--kb-dialog-header-padding`, `-body-padding`, `-footer-padding` (default `0px`) |
| Dialog motion | `--kb-dialog-motion-duration`, `-motion-easing`, `-enter-scale`, `-enter-offset` |
| Card | `--kb-card-background`, `-face`, `-color`, `-border`, `-border-width`, `-radius`, `-padding`, `-shadow` |
| Button | `--kb-button-motion-duration`, `-motion-easing`, `-press-offset` |
| Popup | `--kb-popup-motion-duration`, `-motion-easing` |

Outlined Cards use a neutral sheen, a contact rim and a lower ledge with an ambient shadow. `appearance="plain"` adds no face or shadow. Override `--kb-card-face: none` and `--kb-card-shadow: none` for a flat outlined surface; `--kb-card-background` still controls the underlying color.

Reduced motion still disables every transition and the button press offset. A portaled Dialog reads tokens from its `container`; pass a themed host to scope overrides. See [forms and overlays](guides/forms-and-overlays.md).

## Naming

A token's CSS name is its path in the file joined with dashes: `color.accent-hover` becomes `--kb-color-accent-hover`. Keys may contain letters, digits, `_` and `-`.

## Aliases

A path in braces makes one token refer to another:

```json
"accent": { "$type": "color", "$value": "{blue.600}" }
```

This builds to `--kb-color-accent: var(--kb-blue-600);`. The reference stays live, so changing `--kb-blue-600` changes every token that points at it. The build stops with an error if an alias points at a token that does not exist.

The reference resolves where the alias is declared: on `:root`, and again on each `[data-theme]` container for aliases that depend on a theme value. An override on `:root` flows through every alias. An override on a plain wrapper element does not, because the alias already holds the root value there. Put `data-theme` on the wrapper to make it rebind aliases; [Restyling kbui](guides/restyling.md#restyle-part-of-a-page) shows the pattern. Or set the component token directly, such as `--kb-panel-background`.

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

The full React and CSS stylesheets already include these CSS variables. No extra token install is needed for CSS styling.

For JavaScript or TypeScript, add the optional `@kbui/tokens` tarball from the same release as React. The [Get Started page](https://kbui.kcb.pro/setup/?tokens=1) generates a matching command for your package manager. Import its `tokens` object for typed variable names, not resolved values, so the same reference works in either theme:

```ts
import { tokens } from "@kbui/tokens";

const style = { color: `var(${tokens.color.muted})` };
```

When developing against a local kbui checkout, `bun add ../kbui/packages/tokens` installs the built package by path. See [path installs](guides/using-kbui.md#installing-by-path-while-you-work-on-kbui).

## Adding or changing a token

1. Edit `packages/tokens/tokens.json`. A semantic color also needs a `kb.dark` value.
2. Run `bun run build` and `bun run check`.
3. Check the result in Storybook under **Foundations / Tokens**. The swatches follow your system theme; to compare both themes, open a component story and use the theme switch in the toolbar.

Components should reference semantic, scale or component tokens, never palette colors or raw values. `bun run check` fails on a raw size, padding, gap, radius, font size, font weight, duration or easing in component CSS; hairlines up to 2px, `0` and `em` lengths are allowed. A new component can define its own group, such as `badge.radius`, without further setup.
