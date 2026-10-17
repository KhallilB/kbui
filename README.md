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

Then, in the consumer, add both packages as `link:` deps (path relative to the consumer):

```bash
bun add link:../kbui/packages/react link:../kbui/packages/css
```

```tsx
import "@kbui/css/styles.css";
import { Button, Input, Dialog } from "@kbui/react";
```

`link:` symlinks `node_modules/@kbui/*` to this checkout. After changing kbui, `bun run build` here is enough; the consumer needs no reinstall.

Alternative: `bun link` inside `packages/react` and `packages/css`, then `bun link @kbui/react @kbui/css --save` in the consumer. Without `--save` nothing is written to `package.json`. This goes through Bun's global link table, so prefer the path form.

`file:` deps do not work: Bun resolves a path package's own dependencies against npm, and `@kbui/react` depends on `@kbui/css`, which is not on npm.

Consumer setup:

- Vite: `resolve: { dedupe: ["react", "react-dom"] }`. The linked package resolves Base UI from kbui's `node_modules`, which drags in kbui's own React; without dedupe the app ships two copies and hooks throw.
- TypeScript: `declare module "*.css";` somewhere in the program (`vite/client` types provide it). TypeScript 7 rejects the bare side-effect import otherwise.
- `react` and `react-dom` 19 are peer deps; install them in the consumer.

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

None. Nothing is published, so Changesets was removed: no version bumps, no CHANGELOG. Consumers track whatever is built in this checkout; `git log` is the history. Internal deps use `workspace:*`.

## Adding a framework adapter

Styling lives in `@kbui/css`. Each component stylesheet starts with an `Anatomy:` comment naming its classes and `data-*` attributes. A new adapter renders that markup; nothing in tokens or css changes.
