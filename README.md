# kbui

Shared design system. Agnostic tokens and CSS, React adapter on Base UI, published to a local Verdaccio registry.

## Packages

| Package | What |
|---|---|
| `@kbui/tokens` | Design tokens: `tokens.json` source, `tokens.css` vars, typed `tokens` object |
| `@kbui/css` | All styling. `styles.css` bundles tokens, reset, components |
| `@kbui/react` | React 19 components: `Button`, `Input`, `Dialog` |

## Use in a project

```
# .npmrc
@kbui:registry=http://localhost:4873
```

```bash
bun add @kbui/react @kbui/css
```

```tsx
import "@kbui/css/styles.css";
import { Button, Input, Dialog } from "@kbui/react";
```

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
| `registry:up` / `down` / `logs` | Start, stop, tail the Verdaccio registry |
| `registry:login` / `backup` / `nuke` | Create the publish user, tar the volume, back up then delete the volume |
| `docs:up` / `docs:down` | Serve or stop the built Storybook |
| `stack:up` / `stack:down` | Start or stop the whole Docker stack |
| `lint` / `lint:fix` | Biome check, with or without writes |
| `typecheck` | Package typecheck plus root `scripts/` |
| `test` | Unit tests for packages and `scripts/` |

## Conventions

- Consumer props spread first, then `kb()`, so the design system's `class` and `data-*` win.
- Every component has `.tsx`, `.test.tsx` and `.stories.tsx`; a test enforces it.
- Component CSS starts with an `Anatomy:` comment and may only use semantic, component and scale tokens; a test enforces it.
- Rendered links pass `role="link"`.

## Release

```bash
bun run registry:up      # Verdaccio at http://localhost:4873
bun run registry:login   # first time only; then set max_users: -1 in docker/verdaccio/config.yaml
bun changeset            # describe the change
bun run version          # bump + changelog
bun run release          # build + publish
```

Run registry:login right after the first registry:up; until then the single signup slot is open to anyone on the LAN.

Internal deps between packages are plain versions, not workspace:*, because changeset publish does not rewrite the protocol; Changesets keeps them in sync on every bump.

`bun run docs:up` serves the built Storybook at http://localhost:6007.
`bun run registry:backup` tars the registry volume into `backups/`.
`bun run registry:nuke` deletes the registry volume. Everything published is gone.

## Adding a framework adapter

Styling lives in `@kbui/css`. Each component stylesheet starts with an `Anatomy:` comment naming its classes and `data-*` attributes. A new adapter renders that markup; nothing in tokens or css changes.
