# Restyling kbui

Style kbui components the same way you style your own elements. kbui's CSS sits in the `kbui` cascade layer, so any rule you write outside a layer wins over it, whatever its specificity. You do not need kbui class names or tokens to change one component.

The source build uses the same monochrome and persimmon defaults in installed components and the documentation site. Import `@kb.ui/react/styles.css` once; no site theme stylesheet is needed. The palette lives in `packages/tokens/tokens.json`, and Card’s face and shadow use the same material roles as raised controls. Local builds include this refresh; existing published v0.7.0 release assets keep their original appearance.

## Style one component

Pass a class with `className`. It lands on the component's root element:

```tsx
<Button className="checkout">Pay</Button>
```

```css
.checkout { background: #0b6e4f; border-radius: 999px; }
```

Components with inner parts also take `classNames`, keyed by part. Split uses `classNames={{ track: "project-column" }}` for its column tracks. The props type lists every part, so your editor completes the names:

```tsx
<Input label="Email" classNames={{ control: "signup-input", label: "signup-label" }} />
<Select label="View" value={view} onValueChange={setView} options={options}
  classNames={{ control: "rounded-none", popup: "shadow-xl" }} />
```

`style` works too. Ordinary inline declarations beat stylesheet rules; a stylesheet declaration with `!important` can still override them.

State is exposed through `data-*` attributes, so you can style it without kbui names. Examples: `data-variant`, `data-size`, `data-disabled`, `data-checked`, `data-open`, `data-highlighted` and `data-invalid`.

```css
.checkout:hover { background: #095c42; }
.checkout[data-disabled] { opacity: 0.5; }
```

CSS Modules and other scoped class names work the same way.

### Tailwind CSS v4

Declare the layer order once, before Tailwind's import, so utilities win and Tailwind's preflight stays below kbui:

```css
@layer theme, base, kbui, components, utilities;
@import "tailwindcss";
```

```tsx
<Button className="rounded-full bg-emerald-700">Pay</Button>
<Input label="Email" classNames={{ control: "rounded-none border-black" }} />
```

### Global resets

An unlayered element rule, such as `button { padding: 0; }`, also beats kbui and reaches its components. Put resets and other base styles in a layer declared before `kbui`:

```css
@layer reset, kbui;
@layer reset {
  button { padding: 0; }
}
```

## Theme every component with tokens

Tokens restyle every component at once, in light and dark. Components read every color, size, type and timing value from them. Token kinds, naming and aliases are described in [Tokens](../tokens.md).

### Write the override

Load the overrides after kbui. Rules outside a layer, or in a layer declared after `kbui`, win in every theme.

```css
@import "@kb.ui/react/styles.css";
@import "./restyle.css";
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

### Common changes

| Goal | Tokens to set |
|---|---|
| Brand accents and indicators | `--kb-color-accent`, `--kb-color-accent-hover`, `--kb-color-accent-fg`, `--kb-color-ring` |
| Filled actions and primary selection | `--kb-color-action`, `--kb-color-action-hover`, `--kb-color-action-fg` |
| Page and surface colors | `--kb-color-bg`, `--kb-color-fg`, `--kb-color-muted`, `--kb-color-surface`, `--kb-color-border` |
| Typeface | `--kb-font-sans`, `--kb-font-mono`, `--kb-font-weight-regular`, `--kb-font-weight-medium`, `--kb-font-weight-strong` |
| Type sizes | `--kb-text-body-size`, `--kb-text-control-size`, `--kb-text-small-size`, `--kb-text-caption-size`, `--kb-text-h1-size` to `--kb-text-h4-size` |
| Shape | `--kb-radius-sm`, `--kb-radius-md`, `--kb-radius-lg`; component radii such as `--kb-callout-radius` and `--kb-toolbar-radius` |
| Density | `--kb-space-1` to `--kb-space-8`, `--kb-button-height-*`, `--kb-button-padding-*`, `--kb-input-height-*` |
| Motion | `--kb-motion-duration-*`, `--kb-motion-easing-*`, `--kb-button-motion-duration`, `--kb-dialog-motion-duration`, `--kb-popup-motion-duration`, `--kb-switch-duration` |
| Depth and material | `--kb-material-*` for shared shadows and faces; `--kb-panel-*` and `--kb-status-*` for panels and status chips |

Set action fill, hover and text together. Dark primary actions use a deeper fill with white text; the bright brand accent remains available for indicators. A custom palette can override both modes on the same theme scope:

```css
:root, [data-theme] {
  --kb-color-action: light-dark(#0b6e4f, #145c45);
  --kb-color-action-hover: light-dark(#084f39, #0b4936);
  --kb-color-action-fg: #ffffff;
}
```

Keep action text at least 4.5:1 against both rendered fills, including any sheen or overlay. The default dark action uses white text; a custom palette should choose its foreground for contrast rather than assume dark mode always needs white. Segmented RadioGroup defaults share the action pair. Changing the brand accent alone does not replace the dark action colors.

Use Button variants when they fit. Local classes may change colors as well as layout and shape; check intentional overrides in both themes, including hover, focus and disabled states. For component contributions, follow [Theme and state support](adding-a-component.md#theme-and-state-support).

Global scale tokens move every component that aliases them. Component tokens, such as `--kb-button-height-md`, adjust one component and take precedence for it. `packages/tokens/tokens.json` lists every token with its default.

Hairline borders and focus-ring widths have no tokens because they protect legibility and accessibility. A class can still change them; keep focus rings visible. `--kb-button-touch-min` sets the minimum button size on narrow screens; keep it at 44px or more.

### Restyle part of a page

To retheme a section with tokens, put `data-theme` on the wrapper together with the restyle class. The attribute makes the wrapper rebind aliases, so component tokens resolve against the wrapper's values:

```html
<section class="brand-b" data-theme="light">…</section>
```

```css
.brand-b {
  --kb-color-bg: #f4f1ff;
  --kb-color-accent: #5b3cc4;
  --kb-color-accent-fg: #ffffff;
  --kb-color-action: #5b3cc4;
  --kb-color-action-hover: #462c9f;
  --kb-color-action-fg: #ffffff;
}
```

Without `data-theme`, an alias such as `--kb-panel-background` keeps the value resolved at `:root`. Dialog, Menu and Tooltip render into `<body>`, outside the wrapper, so they use the page's restyle by default. Pass a stable themed wrapper as `container` to keep a nested theme; see [forms and overlays](forms-and-overlays.md#theme-hosts-and-portals).

Set `--kb-color-bg` for the page canvas and `--kb-material-surface-bg` for elevated content such as Cards, Panels, Dialogs and popups. The default light theme separates white content surfaces from the chalk canvas; a theme that wants one shared fill can set both roles.

## Check a restyle

1. Run `bun run storybook` and open a component story.
2. Use the theme switch in the toolbar to review light and dark.
3. Check text contrast against `--kb-color-bg`, `--kb-color-surface` and each `-fg` pairing. The Storybook accessibility panel reports failures.
