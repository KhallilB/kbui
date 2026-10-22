# Contributing

## Setting up

```bash
mise install          # installs bun 1.3.11 and node 22 from mise.toml
bun install           # also sets up the pre-commit hook
bun run build
```

If mise complains that `mise.toml` isn't trusted, run `mise trust` once and try again.

## Day to day

Most of the time you'll want Storybook running while you work:

```bash
bun run storybook
```

It builds the packages first, then serves at http://localhost:6006.

These are the other commands you'll use:

| Command | What it does |
|---|---|
| `bun run check` | Builds everything, then runs Biome, the typecheck and the unit tests. CI runs this. |
| `bun run test:stories` | Renders every story in headless Chromium and runs an accessibility scan on each. CI runs this too. |
| `bun run new <Name>` | Creates a new component. See [Adding a component](docs/guides/adding-a-component.md). |
| `bun run lint:fix` | Applies Biome's fixes. |
| `bun run docs:up` | Serves a static Storybook build from Docker at http://localhost:6007. `docs:down` stops it. |

`test:stories` needs a browser. On a new machine, install it once with `bunx playwright install chromium`, and run `bun run build` before your first `test:stories` run.

## Before you commit

The pre-commit hook lints your staged files and typechecks the whole repo, but it doesn't run the tests. Before you push, run the same two commands CI runs:

```bash
bun run check && bun run test:stories
```

For any change in behavior, write the test first and watch it fail before you write the code that makes it pass.

## How components are written

A few habits keep the components consistent. The existing ones follow all of them, so they're a good reference.

Spread the caller's props first and the result of `kb()` last. That way the component's own class and `data-*` attributes always win, and a stray `data-variant` from a caller can't contradict the `variant` prop.

Every component has four files: the `.tsx`, a `.test.tsx` and a `.stories.tsx` in `packages/react`, and a stylesheet in `packages/css`. A test fails the build if the story or the test is missing.

Write the first line of the stylesheet before anything else. It's the `Anatomy:` comment that lists the component's classes and attributes, and it's what any other framework would have to follow. In that stylesheet, stick to semantic, scale and component tokens. Palette colors and raw hex values fail the check.

`className` only accepts a string. Base UI also allows a function there, but `kb()` needs a string to merge classes, so we narrow the type.

Each component gets a test that its `ref` reaches the underlying DOM element.

If a component renders a link through `render={<a href="…" />}`, pass `nativeButton={false}` and `role="link"`. Without the role, Base UI announces it as a button.

Give every prop a one-line JSDoc comment. Storybook turns them into the props table.

## Comments in code

Keep comments to a single line, and only write one when the code can't say it for itself, for example to record a constraint or explain why odd-looking code is correct.

## Commits

Sign every commit with `git commit -S`; the repo uses SSH signing. Subjects follow Conventional Commits, for example `feat(react): add Badge` or `fix(css): keep focus ring on invalid inputs`. Keep each commit small enough that it passes `bun run check` on its own. Don't add AI attribution lines or trailers.

## Recording decisions

Bigger choices get a decision record. [docs/decisions](docs/decisions/README.md) explains when a change needs one.
