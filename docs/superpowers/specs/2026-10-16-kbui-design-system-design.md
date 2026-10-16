# kbui design system — skeleton design

Date: 2026-10-16
Status: approved in conversation, pending spec review

## Goal

One shared design system, `kbui`, consumed by every project (LiveLeague, loupe,
hearthstone-deck-workshop, future apps). Published to a self-hosted Verdaccio
registry running in Docker on the owner's PC. Styling must survive a change of
frontend framework; only behavior adapters are framework-bound.

## Non-goals

- Shipping more than three components in the skeleton.
- Public npm or GitHub Packages publishing.
- Non-React adapters now. The structure makes them cheap later; none is built.
- Tailwind preset, Swift/Kotlin token output. Token source supports them; not emitted yet.

## Decisions

| Topic | Decision | Why |
|---|---|---|
| Styling | CSS custom properties + plain CSS with `kb-` prefixed classes and `data-*` attributes | Framework-free, zero runtime, works beside Tailwind |
| Behavior | `@base-ui/react` | Accessible headless primitives, React 19 native, emits `data-open`/`data-disabled` that match the CSS contract |
| Repo shape | Bun workspaces, three publishable packages + private Storybook app | Styling packages reusable by a future non-React adapter without restructure |
| Versioning | Changesets, `fixed` version group | One version across packages, one changelog story |
| Registry | Verdaccio 6 in Docker Compose, named volume | Up/down in one command, packages survive restarts |
| Docs | Storybook 10 (react-vite), static build served by nginx container | Design docs on LAN beside registry |
| Toolchain | bun 1.3.x + node 22 via mise (npm needed by `changeset publish`), TypeScript strict, biome, lefthook, vitest | Matches existing projects |

## Package graph

```
@kbui/tokens   tokens.json -> tokens.css, tokens.ts        (agnostic)
@kbui/css      component stylesheets, depends on tokens    (agnostic)
@kbui/react    Base UI + class/attr mapping, depends on css (React 19)
apps/storybook private, depends on react                   (docs + story tests)
```

Future `@kbui/vue`, `@kbui/svelte`, `@kbui/wc` depend on `@kbui/css` and
implement the same anatomy contract. Nothing in tokens or css changes.

## Repository layout

```
kbui/
  package.json                 workspaces, root scripts
  bunfig.toml                  registry for @kbui scope
  .npmrc                       @kbui:registry=http://localhost:4873
  mise.toml                    bun + node pin
  tsconfig.base.json
  biome.json
  lefthook.yml
  .changeset/config.json       fixed: [["@kbui/*"]]
  .github/workflows/ci.yml     lint, typecheck, test, build
  packages/
    tokens/
      tokens.json              W3C design-token source of truth
      scripts/build.ts         emits dist/tokens.css, dist/tokens.ts
      package.json             exports ./tokens.css, .
    css/
      src/
        reset.css
        components/button.css
        components/input.css
        components/dialog.css
        styles.css             imports tokens.css, reset, every component
      scripts/build.ts         lightningcss bundle + minify to dist/styles.css
      package.json             exports ./styles.css, ./reset.css, ./components/*.css
    react/
      src/
        utils/kb.ts            kb(name, attrs, className?) -> { className, data-* }
        components/Button/     Button.tsx, Button.test.tsx, Button.stories.tsx
        components/Input/
        components/Dialog/
        index.ts
      vite.config.ts           lib mode, ESM only; tsconfig.build.json emits d.ts
      package.json             peer react/react-dom >=19, dep @base-ui/react, clsx
  apps/
    storybook/
      .storybook/main.ts       react-vite, addon-a11y, addon-docs, addon-vitest
      .storybook/preview.ts    imports @kbui/css/styles.css, theme toolbar toggles data-theme
      stories pulled from packages/react/src/**/*.stories.tsx
  docker/
    compose.yml                services: registry, docs
    verdaccio/config.yaml
    docs/Dockerfile            multi-stage: oven/bun builds storybook, nginx:alpine serves
  scripts/
    new-component.ts           stamps Button-shaped folder for a new name
  templates/
    component/                 Name.tsx, Name.test.tsx, Name.stories.tsx, name.css
  docs/superpowers/specs/      this file
```

## Token model

`tokens.json` follows the W3C Design Tokens Community Group format, one file.
DTCG has no theme concept, so a semantic token carries its light value in
`$value` and an optional dark value in `$extensions["kb.dark"]`; primitives and
component tokens have no dark value. Three tiers:

- **Primitive** `--kb-blue-500`, `--kb-space-4`, `--kb-radius-md`, `--kb-font-sans`.
- **Semantic** `--kb-color-bg`, `--kb-color-fg`, `--kb-color-muted`,
  `--kb-color-accent`, `--kb-color-accent-fg`, `--kb-color-danger`,
  `--kb-color-border`, `--kb-color-ring`.
- **Component** `--kb-button-radius`, `--kb-input-height-md`.

Build emits:

```css
:root { /* primitives + light semantic */ }
[data-theme="dark"] { /* dark semantic overrides only */ }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { /* same dark set */ } }
```

`data-theme` lives on `<html>`. Components reference semantic or component tier
for color; scale primitives (`space`, `radius`, `font`, `size`) may be used
directly. A test in `@kbui/css` fails when component CSS references a palette
primitive (`--kb-gray-*`, `--kb-blue-*`, `--kb-red-*`, `--kb-white`, `--kb-black`).

`tokens.ts` exports `const tokens = { color: { bg: "--kb-color-bg", ... } } as const`
for TS consumers who style in JS.

## Anatomy contract

Every component stylesheet begins with an anatomy comment. It is the contract any
adapter implements. Example:

```css
/* Anatomy: .kb-button [data-variant=primary|secondary|ghost|danger] [data-size=sm|md|lg] [data-disabled] */
```

Rules:

- One root class per component, `kb-<name>`. Sub-parts are `kb-<name>-<part>`.
- Variants and sizes are `data-*` attributes with string values.
- Boolean state is a valueless attribute (`data-disabled`, `data-open`, `data-invalid`),
  matching what Base UI emits.
- No descendant selectors across components. Flat specificity.
- Consumer overrides use the same attributes plus their own class.

## Components in skeleton

### Button

Props: `variant` (default `primary`), `size` (default `md`), everything from
Base UI `Button` including `render` for polymorphism, `disabled`, native button
attrs. Renders `<button class="kb-button" data-variant data-size>`.

### Input

Props: `label` (required for a11y, `visuallyHidden` escape hatch), `description`,
`error` (string; when set, `Field.Root invalid` adds `data-invalid` and
`Field.Error match` renders the message wired via `aria-describedby`), `size`,
native input attrs (`size` is `Omit`ted from native props, kbui's string size wins). Built on Base UI `Field.Root/Label/Description/Error` +
`Input`. Anatomy, verbatim:

```css
/* Anatomy: .kb-input [data-size=sm|md|lg] [data-invalid] [data-disabled] > .kb-input-label, .kb-input-control, .kb-input-description, .kb-input-error */
```

Root `.kb-input` is `Field.Root`; the native input is `.kb-input-control`.

### Dialog

Compound on Base UI `Dialog`:

```tsx
<Dialog>
  <Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>
  <Dialog.Content title="..." description="...">children</Dialog.Content>
</Dialog>
```

`title` and `description` are optional; omit them and compose `Dialog.Title` /
`Dialog.Description` in children instead. `Dialog.Content` renders portal, backdrop `.kb-dialog-backdrop`, popup
`.kb-dialog-popup[data-open]`, `.kb-dialog-title`, `.kb-dialog-description`,
`.kb-dialog-body`. `Dialog.Root` renders no DOM, so `.kb-dialog-popup` is the
anatomy root for the CSS build test. Anatomy, verbatim:

```css
/* Anatomy: .kb-dialog-popup [data-open] > .kb-dialog-title, .kb-dialog-description, .kb-dialog-body; sibling .kb-dialog-backdrop [data-open] */
```

`Dialog.Title`, `Dialog.Description`, `Dialog.Close` are
exported for custom layouts. Focus trap, escape, scroll lock come from Base UI.

## React authoring pattern

```tsx
// Button.tsx
import { Button as Base } from "@base-ui/react/button";
import { kb } from "../../utils/kb";

export type ButtonProps = Omit<Base.Props, "className"> & {
  /** Plain class string. */
  className?: string;
  /** Visual weight. */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Height and padding scale. */
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <Base {...kb("button", { variant, size }, className)} {...props} />;
}
```

`kb(name, attrs, className?)` returns `{ className: clsx("kb-" + name, className),
"data-variant": ..., "data-size": ... }`, dropping `undefined` and `false` values
so `data-disabled="false"` never renders; `true` renders as a valueless attribute. One helper,
every component reads the same.

Consumer surface:

```tsx
import { Button, Input, Dialog } from "@kbui/react";
import "@kbui/css/styles.css";
```

Single import path. No deep imports required; `sideEffects: false` on react,
`sideEffects: ["*.css"]` on css.

## Build outputs

| Package | Tool | Output |
|---|---|---|
| tokens | bun script | `dist/tokens.css`, `dist/tokens.ts` |
| css | bun script + lightningcss | `dist/styles.css` (bundled, minified), `dist/reset.css`, `dist/components/*.css` |
| react | Vite lib mode; `tsc --emitDeclarationOnly` for types | `dist/index.js` (ESM), `dist/index.d.ts` |

`react` externalizes `react`, `react-dom`, `react/jsx-runtime`, `@base-ui/react/*`
and excludes `*.stories.tsx` and `*.test.tsx` from the build and emitted types.
`@kbui/css` imports tokens by relative path (`../../tokens/dist/tokens.css`) so
lightningcss `bundle` needs no custom resolver.

## Testing

- **Unit**: vitest + jsdom + `@testing-library/react` per component. TDD: failing
  test first, then component. Tests assert rendered class, data attributes,
  accessibility names, and behavior (dialog opens, input error wires
  `aria-describedby`).
- **Story smoke + a11y**: Storybook `addon-vitest` runs every story in Chromium via
  Playwright; `addon-a11y` fails the story on axe violations.
- **Story coverage**: one test in `packages/react` asserts every component
  folder has a story and a test (LiveLeague pattern).
- **Token build**: snapshot test of `tokens.css` output, in `packages/tokens`.
- **CSS build**: tests in `packages/css` that `styles.css` contains every
  component anatomy root class and that no component CSS references a palette primitive var.

## Publishing

```
bun changeset          write change description
bun run version        changeset version: bump, CHANGELOG
bun run release        build all, changeset publish to Verdaccio
```

`.npmrc` in repo root: `@kbui:registry=http://localhost:4873`. First-time
`bun run registry:login` wraps `npm adduser --registry`. Consumers copy the same
`.npmrc` line and `bun add @kbui/react @kbui/css`.

## Docker

`docker/compose.yml`:

- `registry`: `verdaccio/verdaccio:6`, port `4873`, config bind-mounted read-only,
  storage in named volume `kbui-registry`. Config: `@kbui/*` publish requires auth,
  all else proxies npmjs, `listen: 0.0.0.0:4873`, `max_users: -1` after first user.
- `docs`: built from `docker/docs/Dockerfile` with build context at repo root
  (workspaces need the whole tree). Stage 1 `oven/bun` installs and
  runs `build-storybook`; stage 2 `nginx:alpine` serves `storybook-static` on
  port `6007`.

Root scripts: `registry:up`, `registry:down`, `registry:logs`, `docs:up`
(`compose up -d --build docs`), `docs:down`, `stack:up`, `stack:down`,
`registry:backup` (tars the named volume to `backups/`).
`down` never passes `-v`; a documented `registry:nuke` does.

## Generator

`bun run new Button` copies `templates/component/*`, renames `Name` to
`Button` and `name` to `button`, appends export to `packages/react/src/index.ts`
and import to `packages/css/src/styles.css`. Refuses if the folder exists.

## CI

`.github/workflows/ci.yml` on push and PR: mise install, `bun install --frozen-lockfile`,
`bun run check` (biome, typecheck, test), `bun run build`, and on PRs
`changeset status --since=origin/main` so a change under `packages/*` without a
changeset fails. Playwright Chromium is installed for the Storybook vitest run.
No publish step; the registry is local.

## Git hygiene

lefthook pre-commit: biome check on staged files, `tsc --noEmit` per package.
Commits SSH-signed. Changeset required on PRs that touch `packages/*` (enforced in CI).

## Build order

Phased so each step is verifiable alone: tokens, css, react + tests, storybook,
docker, generator + CI. Generator, `registry:backup`, and the docs container are
the first candidates to defer if the plan runs long.

## Risks

- Base UI 1.x is young; API changes may land in minors. Pinned exact version,
  bumped via changeset with tests as guard.
- Verdaccio on a single PC is a single point of failure. Named volume plus a
  `registry:backup` script that tars the volume mitigates loss.
- `prefers-color-scheme` fallback plus explicit `data-theme` can surprise; documented
  in README and Storybook theme toolbar.
