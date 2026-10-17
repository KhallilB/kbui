# kbui

Shared design system. Agnostic tokens and CSS, React adapter on Base UI, consumed straight from this checkout by other projects on the same machine. No registry.

## Packages

| Package | What |
|---|---|
| `@kbui/tokens` | Design tokens: `tokens.json` source, `tokens.css` vars, typed `tokens` object |
| `@kbui/css` | All styling. `styles.css` bundles tokens, reset, components |
| `@kbui/react` | React 19 components: `Button`, `Input`, `Dialog` |

## Use in a project

Build here first; package exports point at `dist/`, which is gitignored.

```bash
bun run build            # in kbui
```

Then, in the consumer, add both packages by path (relative to the consumer):

```bash
bun add ../kbui/packages/react ../kbui/packages/css
```

```tsx
import "@kbui/css/styles.css";
import { Button, Input, Dialog } from "@kbui/react";
```

Bun records them as path deps and symlinks each file of `dist/` into the consumer's `node_modules/@kbui/*`, so after changing kbui, `bun run build` here is enough. Only a new file in `dist/` (a new component's `.d.ts`) needs `bun install` in the consumer again. `@base-ui/react` and `clsx` install from npm into the consumer, so there is one React.

For this to work, `@kbui/react` declares no dependency on `@kbui/css` and `@kbui/css` none on `@kbui/tokens`: Bun resolves a path package's dependencies (dev ones too) against npm, and `workspace:*` is unresolvable there. `styles.css` bundles the tokens at build time; the root `build` script orders tokens, css, react.

Consumer requirements:

- `react` and `react-dom` 19 installed in the consumer (peer deps).
- `declare module "*.css";` in the consumer program (`vite/client` types provide it); TypeScript rejects the bare side-effect import otherwise.

`link:` is not a path protocol in Bun; `bun add link:../kbui/...` fails with "failed to resolve". `bun link` (global link table) works but is not needed.

Set `data-theme="light"` or `"dark"` on `<html>`; without it the system preference applies.

## Develop

```bash
mise install && bun install
bun run storybook        # http://localhost:6006
bun run check            # build + lint + typecheck + unit tests
bun run test:stories     # story smoke + axe (runs after check or bun run build)
bun run new Badge        # scaffold a component
```

### Scripts

| Script | What |
|---|---|
| `docs:up` / `docs:down` | Serve or stop the built Storybook in Docker at http://localhost:6007 |
| `lint` / `lint:fix` | Biome check, with or without writes |
| `typecheck` | Package typecheck plus root `scripts/` |
| `test` | Unit tests for packages and `scripts/` |

## Conventions

- Consumer props spread first, then `kb()`, so the design system's `class` and `data-*` win.
- Every component has `.tsx`, `.test.tsx` and `.stories.tsx`; a test enforces it.
- Component CSS starts with an `Anatomy:` comment and may only use semantic, component and scale tokens; a test enforces it.
- Rendered links pass `role="link"`.

## Versioning

None. Nothing is published, so Changesets was removed: no version bumps, no CHANGELOG. Consumers track whatever is built in this checkout; `git log` is the history. Publishable packages declare no dependency on each other (see Use in a project).

## Adding a framework adapter

Styling lives in `@kbui/css`. Each component stylesheet starts with an `Anatomy:` comment naming its classes and `data-*` attributes. A new adapter renders that markup; nothing in tokens or css changes.
