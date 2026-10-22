# Contributing

## Setup

```bash
mise install          # bun 1.3.11 and node 22, from mise.toml
bun install           # also installs the lefthook pre-commit hook
bun run build
```

If mise warns that `mise.toml` is not trusted, run `mise trust` once.

## Everyday loop

| Command | What it does |
|---|---|
| `bun run storybook` | Builds the packages, then serves Storybook at http://localhost:6006 |
| `bun run check` | Build, Biome lint, typecheck and unit tests. CI runs this. |
| `bun run test:stories` | Renders every story in headless Chromium with an axe scan. CI runs this. Needs a build first. |
| `bun run new <Name>` | Scaffolds a component; see [Adding a component](docs/guides/adding-a-component.md) |
| `bun run lint:fix` | Applies Biome fixes |
| `bun run docs:up` / `docs:down` | Serves the static Storybook build in Docker at http://localhost:6007 |

The first `test:stories` run on a new machine needs a browser: `bunx playwright install chromium`.

## Before you commit

The pre-commit hook runs Biome on staged files and the full typecheck. Before pushing, run both gates:

```bash
bun run check && bun run test:stories
```

Behavior changes are test-first: write the failing test, watch it fail, then make it pass.

## Component conventions

- **Consumer props spread first, then `kb()`.** The design system's class and `data-*` attributes win, so the typed API cannot be overridden by a raw attribute.
- **Four files per component.** `.tsx`, `.test.tsx` and `.stories.tsx` in `packages/react`, plus a stylesheet in `packages/css`. A test fails if a story or test is missing.
- **Contract first.** Each stylesheet starts with an `Anatomy:` comment, and only semantic, scale and component tokens are allowed in it.
- **`className` is a string.** Base UI also accepts a function; kbui narrows it so `kb()` can merge classes.
- **Refs reach the DOM element.** Each component has a ref-forwarding test.
- **Rendered links pass `role="link"`.** With `render={<a href="…" />}` and `nativeButton={false}`, Base UI otherwise announces the anchor as a button.
- **One-line JSDoc on every prop.** It becomes the Storybook props table.

## Comments

One line per comment, stating intent, an invariant or a constraint. Never narrate the code.

## Commits

- Sign every commit: `git commit -S`. The repository uses SSH signing.
- Use Conventional Commit subjects: `feat(react): …`, `fix(css): …`, `docs: …`, `chore: …`, `test: …`.
- Do not add AI attribution lines or trailers.
- Keep commits small and logical; each should pass `bun run check`.

## Decisions

A choice that changes ownership, compatibility or a dependency gets a record in [docs/decisions](docs/decisions/README.md). Routine fixes and new components under the existing contract do not.
