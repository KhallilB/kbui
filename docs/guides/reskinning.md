# Reskinning kbui

A skin is a stylesheet of token overrides loaded after `@kbui/css/styles.css`. Components read every color, size, type and timing value from tokens, so a skin changes the look of every component without touching component CSS. Token kinds, naming and aliases are described in [Tokens](../tokens.md).

## Write the override

Load the skin after kbui. Every kbui theme selector has zero specificity, so any later rule wins in every theme.

```css
@import "@kbui/css/styles.css";
@import "./skin.css";
```

Which selector to use depends on whether the token changes between light and dark:

| Token | Selector | Example |
|---|---|---|
| Scale, motion and component tokens that are not colors | `:root` | `:root { --kb-radius-md: 2px; }` |
| Colors, materials and any token that aliases one | `:root, [data-theme]` | `:root, [data-theme] { --kb-color-accent: light-dark(#0b6e4f, #7fd1ae); }` |

`light-dark()` takes the light value first and the dark value second. kbui sets `color-scheme` on `:root` and on every `[data-theme]` container, so one declaration resolves correctly under the system setting, a forced `data-theme` on `<html>` and nested theme containers. The `[data-theme]` part of the selector is required: theme containers redeclare theme-dependent tokens, and without it a nested container falls back to kbui's values.

Values that cannot be written with `light-dark()`, such as a shadow list that differs between themes, need one rule per theme:

```css
:root, [data-theme="light"] { --kb-material-panel-shadow: 0 1px 2px rgb(0 0 0 / 0.1); }
[data-theme="dark"] { --kb-material-panel-shadow: none; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --kb-material-panel-shadow: none; }
}
```

## Common changes

| Goal | Tokens to set |
|---|---|
| Brand color | `--kb-color-accent`, `--kb-color-accent-hover`, `--kb-color-accent-fg`, `--kb-color-ring` |
| Page and surface colors | `--kb-color-bg`, `--kb-color-fg`, `--kb-color-muted`, `--kb-color-surface`, `--kb-color-border` |
| Typeface | `--kb-font-sans`, `--kb-font-mono`, `--kb-font-weight-regular`, `--kb-font-weight-medium`, `--kb-font-weight-strong` |
| Type sizes | `--kb-text-body-size`, `--kb-text-control-size`, `--kb-text-small-size`, `--kb-text-caption-size`, `--kb-text-h1-size` to `--kb-text-h4-size` |
| Shape | `--kb-radius-sm`, `--kb-radius-md`, `--kb-radius-lg`; component radii such as `--kb-callout-radius` and `--kb-toolbar-radius` |
| Density | `--kb-space-1` to `--kb-space-8`, `--kb-button-height-*`, `--kb-button-padding-*`, `--kb-input-height-*` |
| Motion | `--kb-motion-duration-*`, `--kb-motion-easing-*`, `--kb-button-duration`, `--kb-dialog-duration`, `--kb-switch-duration` |
| Depth and material | `--kb-material-*` for shared shadows and faces; `--kb-panel-*` and `--kb-status-*` for panels and status chips |

Global scale tokens move every component that aliases them. Component tokens, such as `--kb-button-height-md`, adjust one component and take precedence for it. `packages/tokens/tokens.json` lists every token with its default.

Hairline borders and focus-ring widths are fixed in component CSS because they protect legibility and accessibility. `--kb-button-touch-min` sets the minimum button size on narrow screens; keep it at 44px or more.

## Scope a skin to part of a page

Put `data-theme` on the wrapper together with the skin class. The attribute makes the wrapper rebind aliases, so component tokens resolve against the wrapper's values:

```html
<section class="brand-b" data-theme="light">…</section>
```

```css
.brand-b { --kb-color-bg: #f4f1ff; --kb-color-accent: #5b3cc4; }
```

Without `data-theme`, an alias such as `--kb-panel-background` keeps the value resolved at `:root`. Dialog, Menu and Tooltip render into `<body>`, outside the wrapper, so they use the page skin.

## Check a skin

1. Run `bun run storybook` and open a component story.
2. Use the theme switch in the toolbar to review light and dark.
3. Check text contrast against `--kb-color-bg`, `--kb-color-surface` and each `-fg` pairing. The Storybook accessibility panel reports failures.
