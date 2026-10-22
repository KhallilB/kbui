# Architecture

kbui has three packages. Tokens hold the values, the CSS turns those values into styles, and the React package adds behavior on top. Each package builds on the one below it, and React only meets the CSS through the class and attribute names it renders. A one-line comment at the top of every component stylesheet, which we call the anatomy contract, keeps the two in agreement.

```mermaid
flowchart TD
  json["tokens.json<br/>W3C design tokens"] -->|bun run build| tokens["@kbui/tokens<br/>tokens.css, typed names"]
  tokens -->|bundled into styles.css| css["@kbui/css<br/>all visual design, no framework"]
  css -->|classes and data-* to emit| react["@kbui/react<br/>Base UI behavior + kb()"]
  css -.->|same contract| adapters["future adapters<br/>Vue, Svelte, web components"]
  react --> apps["consumer apps"]
  css --> apps
```

## What each package owns

`@kbui/tokens` owns every value: colors, spacing, radii, type sizes and the few sizes specific to components, in both light and dark. It knows nothing about components.

`@kbui/css` owns every visual rule. Styles hang off `kb-` classes and `data-*` attributes. There's no JavaScript in it, so it doesn't care which framework renders the markup.

`@kbui/react` owns behavior. Focus handling, keyboard support and ARIA come from Base UI, and the `kb()` helper turns props into the right classes and attributes. It doesn't import any CSS.

Because none of the styling depends on React, supporting another framework later means writing a new adapter that renders the same markup. The tokens and CSS wouldn't change.

## The anatomy contract

Every file in `packages/css/src/components/` opens with a comment describing the component's markup. Here's the one from `button.css`:

```css
/* Anatomy: .kb-button [data-variant=primary|secondary|ghost|danger] [data-size=sm|md|lg] [data-disabled] */
```

Each component has one root class, `kb-<name>`, and its parts are named `kb-<name>-<part>`. Variants and sizes are `data-*` attributes with string values. On/off states like `data-disabled`, `data-open` and `data-invalid` are attributes without a value, which is also how Base UI writes them. Selectors never reach into another component, so specificity stays flat and overrides stay predictable.

On the React side, `kb(name, attrs, className)` produces the matching props. It returns `{ className: "kb-<name> …", "data-<key>": value }` and leaves out anything that's `false` or `undefined`.

## What keeps it honest

We don't rely on people remembering the contract. `bun run check` fails if:

| Problem | Caught by |
|---|---|
| A token points at one that doesn't exist, two tokens end up with the same name, or a key has odd characters | `packages/tokens/src/build.test.ts` |
| A stylesheet is missing its `Anatomy:` line, or never actually styles the root class it names | `packages/css/src/build.test.ts` |
| Component or reset CSS uses a palette color like `--kb-gray-500`, or a raw color like `#fff` | `packages/css/src/build.test.ts` |
| A component folder is missing its story or its test | `packages/react/src/story-coverage.test.ts` |

On top of that, `bun run test:stories` renders every story in a real browser and fails if the accessibility scan finds anything.

## What the build produces

| Package | Built with | Output in `dist/` |
|---|---|---|
| tokens | `bun scripts/build.ts` | `tokens.css`, `tokens.js`, `tokens.d.ts` |
| css | `bun scripts/build.ts`, using lightningcss | `styles.css` (tokens, reset and every component, minified), `reset.css`, `components/*.css` |
| react | `vite build`, then `tsc -p tsconfig.build.json` | `index.js` and type declarations |

The root `bun run build` runs them in that order. The CSS has to build after the tokens because it bundles their output; nothing else depends on the order.

## Planned: generative UI layers

None of this exists yet. The [direction spec](superpowers/specs/2026-10-22-generative-ui-direction.md) adds layers above the existing packages so that agents can compose kbui screens:

```mermaid
flowchart TD
  contract["anatomy lines + tokens + prop types"] -->|generated, checked for drift| manifest["manifest<br/>catalog + canonical tree"]
  manifest --> lint["lint<br/>grammar + design rules"]
  manifest --> render["render-react<br/>tree to kbui React"]
  manifest --> adapters["adapters<br/>A2UI, json-render, MCP Apps"]
  lint -.->|also runs on| stories["hand-written stories"]
```

Two rules keep the layers in order:

- **The manifest is generated from the anatomy contract, never written by hand** ([0005](decisions/0005-catalog-and-quality-layer-not-runtime.md)). A component and its catalog entry can't disagree without a test failing.
- **Everything works on kbui's own tree format** ([0006](decisions/0006-canonical-tree-adapters-at-edge.md)). Outside formats only appear in adapters, so a change upstream touches one adapter and nothing else.

## Why it's built like this

The [decision records](decisions/README.md) explain the bigger choices, including why there's no package registry.
