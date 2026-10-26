# Contributing

## Setup

```bash
mise install          # bun 1.3.11 and node 22, from mise.toml
bun install           # also installs the pre-commit hook
bun run build
```

If mise reports that `mise.toml` is not trusted, run `mise trust` once and retry.

## Commands

Run Storybook while you work. It builds the packages first and serves at http://localhost:6006.

```bash
bun run storybook
```

| Command | What it does |
|---|---|
| `bun run check` | Builds every package, then runs Biome, the typecheck, the unit tests and `test:pack`. CI runs it. |
| `bun run test:pack` | Packs each published package and checks the tarball's name and contents. Needs built packages. |
| `bun run test:stories` | Renders every story in headless Chromium and runs an accessibility scan on each. CI runs it. |
| `bun run new <Name>` | Generates a new component. See [Adding a component](docs/guides/adding-a-component.md). |
| `bun run lint:fix` | Applies Biome's fixes. |
| `bun run docs:up` | Serves a static Storybook build from Docker at http://localhost:6007. `bun run docs:down` stops it. |

`test:stories` needs Chromium and built packages. On a new machine, run `bunx playwright install chromium` and `bun run build` once before the first run.

## Before you push

The pre-commit hook lints staged files and typechecks the repository. It does not run tests. Run what CI runs before you push:

```bash
bun run check && bun run test:stories
```

Behavior changes are test-first: write the test, see it fail, then write the code that makes it pass.

## Component conventions

The existing components follow every rule below and are the best reference.

- Each component has four files: the `.tsx`, `.test.tsx` and `.stories.tsx` in `packages/react`, and a stylesheet in `packages/css`. A test fails the build if the story or the test is missing.
- Write the stylesheet's first line before anything else. It is the `Anatomy:` comment listing the component's classes and attributes, and every renderer must follow it.
- Stylesheets use semantic, scale and component tokens only. Palette colors and raw values such as `#fff` fail the check.
- Spread the caller's props first and the result of `kb()` last, so the component's own class and `data-*` attributes win over anything the caller passes.
- `className` accepts a string only. Base UI also accepts a function, but `kb()` needs a string to merge classes.
- Test that each component forwards its `ref` to the underlying DOM element.
- A component rendered as a link through `render={<a href="…" />}` needs `nativeButton={false}` and `role="link"`. Without the role, Base UI announces it as a button.
- Give every prop a one-line JSDoc comment. Storybook builds the props table from them.

## Code comments

Comments are one line. Write one only when the code cannot say it: a constraint, an invariant, or why a surprising choice is correct.

## Writing documentation

- Start each section with what the reader needs to do or know.
- Use plain, professional language. Avoid contractions, filler ("simply", "just", "really") and promotional words ("powerful", "seamless", "robust").
- State facts directly. Avoid rhetorical setups such as "Here's the thing", "The gap:" or slogans of the form "X, not Y".
- Use tables for reference material and prose for reasoning. Use bold sparingly.
- Put commands, file paths and identifiers in backticks, and make every command copyable as written.
- Date any claim that can go stale, such as test counts, versions or external projects.
- Give each topic one home and link to it instead of repeating it.

## Commits

Sign every commit with `git commit -S`; the repository uses SSH signing. Subjects follow Conventional Commits, for example `feat(react): add Badge` or `fix(css): keep focus ring on invalid inputs`. Each commit must pass `bun run check` on its own. Do not add AI attribution lines or trailers.

## Releases

Commit subjects on `main` set the next version: `fix` raises the patch, `feat` the minor, and a breaking change (`feat!:` or a `BREAKING CHANGE:` footer) the minor until 1.0. Merge pull requests by rebase, or squash with a conventional title, so subjects and footers reach `main` intact.

release-please keeps a release PR open on `main`. Merging it releases: the release workflow checks the tag and attaches a tarball per package. Do not edit versions or `CHANGELOG.md` by hand. A new published package needs an `extra-files` entry in `release-please-config.json`; `bun run test` fails without it.

## Private documentation

Keep product plans, roadmaps, architecture, decision records and research in `.internal/docs/`. This directory is ignored by Git and excluded from Docker builds. Keep installation, component, token and contribution guides in tracked documentation. Public documentation must not link to private files.

Local instruction files and tool settings are ignored too. Ignored files have no Git backup; keep private documentation in access-controlled storage outside this repository before deleting or replacing a checkout.

## Feature documentation

When a capability changes, update its canonical documentation and the [maintained feature map](docs/features.md). The `kbui-docs-features` skill supports this workflow. Link shared examples rather than copying them; distinguish local implementation from publication. `bun test scripts/feature-docs.test.ts` checks the register's local file destinations and runs inside `bun run check`.
