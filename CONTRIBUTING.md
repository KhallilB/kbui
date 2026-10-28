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
| `bun run check` | Builds every package, then runs Biome, the typecheck, generated/documented React example compilation, the unit tests and `test:pack`. CI runs it. |
| `bun run test:pack` | Packs each published package and checks the tarball's name and contents. Needs built packages. |
| `bun run test:stories` | Renders every story in headless Chromium and runs an accessibility scan on each. CI runs it. |
| `bun run validate:site` | After `bun run build`, runs the complete site/browser and deployment dry-run checks. PR and main validation share these stages; without an argument this command runs all stages. Needs Bash and the documented deployment Node version. |
| `bun run new <Name>` | Generates a new component. See [Adding a component](docs/guides/adding-a-component.md). |
| `bun run lint:fix` | Applies Biome's fixes. |
| `bun run docs:up` | Serves a static Storybook build from Docker at http://localhost:6007. `bun run docs:down` stops it. |

`test:stories` needs Chromium and built packages. On a new machine, run `bunx playwright install chromium` and `bun run build` once before the first run.

CI job names use `<purpose>: <scope>`: `Check` for static/package checks, `Test` for executable suites, `Gate` for combined results, and `Deploy` for publishing. Add future jobs using the same pattern; describe detailed coverage in their steps.

CI runs **Check: code** on every PR, with separate named steps for package builds, lint, TypeScript, documented examples, unit tests, and tarball checks. Docs-only changes compile Storybook without launching browsers. Runtime changes and `packages/react/README.md`, which supplies generated catalog APIs, also start four independent checks in the official Playwright image:

- **Test: stories** renders interaction stories in normal and reduced motion.
- **Test: themes** checks component stories across the default themes.
- **Test: layouts** checks site viewports and accessibility.
- **Test: site** builds and stages the site, checks Chromium and WebKit journeys, and validates the deployment package.

The **Gate: validation** check waits for all four jobs and fails if any job fails, is cancelled, or is unexpectedly skipped. Preview publishing still waits for that gate. Each job builds its own packages on a standard `ubuntu-latest` runner; the split adds no artifact uploads or shared browser caches. Linux browser jobs reuse the image's installed browsers and system dependencies. Keep the exact Playwright package version and all workflow image tags aligned.

Run one stage locally with `bun run validate:site stories`, `themes`, `responsive`, or `built`, after `bun run build`. Run `bun run validate:site` for the complete sequence used by production validation. Built validation prints named log groups and cleans its temporary servers and QA output on success or failure.

Container jobs use the image's Node/npm runtime to install the Bun version pinned in `packageManager`; no archive utilities are needed. Before dependency installation, they trust the exact checkout path so Git and Lefthook accept the mounted runner-owned workspace.

## Before you push

The pre-commit hook lints staged files and typechecks the repository. It does not run tests. Run what CI runs before you push:

```bash
bun run check && bun run test:stories
```

Behavior changes are test-first: write the test, see it fail, then write the code that makes it pass.

## Public docs and internal stories

Follow [Adding a component](docs/guides/adding-a-component.md), including its [theme and state requirements](docs/guides/adding-a-component.md#theme-and-state-support), when introducing or changing shared controls.

Public Storybook includes `apps/storybook/docs` and component stories beside `packages/react/src` implementations. Keep reusable component examples there. Site screens, restyle showcases and validation fixtures belong in `apps/storybook/stories`; they are excluded from production bundles and navigation.

Each visible story should teach a distinct use, variant, or meaningful state. Use the theme toolbar instead of adding a second public story just for dark mode. Tag theme duplicates and regression-only component fixtures with `tags: ["!dev", "!autodocs"]`; keep their default `test` tag. This removes them from the sidebar and generated Docs without breaking direct story URLs, catalog previews, or automated checks. New app-only fixtures stay in the internal directory above. Keep errors, empty states, disabled controls, and useful compositions visible.

Storybook chrome and Docs read the package palette from `.storybook/theme.ts`; do not copy color values into manager overrides. Docs styling stays scoped to documentation classes so it cannot restyle the components being demonstrated. `verify:storybook` checks the built manager, curated navigation, retained QA URLs, and synchronized System/Light/Dark themes. It runs as part of `validate:site`.

Each component has a named API section in `packages/react/README.md` and usage/accessibility guidance in `apps/storybook/catalog/component-guides.ts`. Storybook reads the canonical API tables through `virtual:kbui-reference`; edit that source instead of copying types into a Docs page. Keep primary examples practical and compilable. Stories that render an already-open modal need `!autodocs` so reading a page never launches a dialog; keep them reachable in the canvas. `verify:component-docs` checks every component in both themes, mobile layouts, editable controls, and dialog focus as part of site validation.

Run `bun run --filter @kbui/storybook dev:internal` to inspect those fixtures at http://localhost:6008. Browser test commands opt into the same internal scope with `KBUI_STORYBOOK_INTERNAL=1`. Keep validation fixtures while they protect unique behavior; delete one only after equivalent coverage exists elsewhere. Do not remove tests just to tidy navigation. `build:site` rejects internal stories in its public index and verifies every catalog link. `validate:site` builds a separate temporary QA Storybook for built control-edge checks, then removes it; deployment staging contains only public docs. Set `SITE_VALIDATION_PORT` when local ports 4175/4176 are occupied; QA uses the next port.

## Component conventions

The existing components follow every rule below and are the best reference.

- Each component has four files: the `.tsx`, `.test.tsx` and `.stories.tsx` in `packages/react`, and a stylesheet in `packages/css`. A test fails the build if the story or the test is missing.
- Write the stylesheet's first line before anything else. It is the `Anatomy:` comment listing the component's classes and attributes, and every renderer must follow it.
- Stylesheets use semantic, scale and component tokens only. Palette colors, raw colors such as `#fff`, and raw sizes, type or timings such as `40px` or `120ms` fail the check. Hairlines up to 2px are allowed.
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

The root package version drives the site install builder and generated first-component example. Release Please updates the marked version blocks in `README.md`, `docs/guides/using-kbui.md` and `apps/storybook/docs/Introduction.mdx`. Keep one version literal per managed line and reuse `KBUI_VERSION` in URLs: the generic updater replaces only the first version on a line. `bun run check` rejects stale, missing or unsafe version blocks, and verifies that each installation entry point is registered with the updater.

Review usage, migration guidance and component API documentation whenever behavior or exports change. Version automation updates release metadata; it cannot infer new API semantics. Historical compatibility versions stay outside managed blocks. `bun run check` also compiles complete React examples from the installation entry points, React API recipes, and numeric-field, file-input and overlay guides against the current package exports, alongside generated catalog and site examples. Run the setup stories when changing installation behavior.

Commit subjects on `main` set the next version: `fix` raises the patch, `feat` the minor, and a breaking change (`feat!:` or a `BREAKING CHANGE:` footer) the minor until 1.0. Merge pull requests by rebase, or squash with a conventional title, so subjects and footers reach `main` intact.

release-please keeps a release PR open on `main`. Merging it releases: the release workflow checks the tag, attaches a tarball per package, and publishes the same tarballs to npm once they install on every OS. Each npm package trusts `release.yml` in this repository as its trusted publisher, so no npm token is stored. A new published package must be published once by hand and given the same trusted publisher before the workflow can publish it. Do not edit versions or `CHANGELOG.md` by hand. A new published package needs an `extra-files` entry in `release-please-config.json`; `bun run test` fails without it.

When a release PR adds a version, add a short public title and highlights in `apps/storybook/site/release-notes.ts`. Keep required migration steps in its `upgrade` list. The site shows this edited copy; generated commit categories and internal work stay in the source history. `release-notes.test.ts` requires a public summary for every published version and upgrade notes for breaking changes, so a version bump cannot silently leave the public notes behind.

## Private documentation

Keep product plans, roadmaps, architecture, decision records and research in `.internal/docs/`. This directory is ignored by Git and excluded from Docker builds. Keep installation, component, token and contribution guides in tracked documentation. Public documentation must not link to private files.

Local instruction files and tool settings are ignored too. Ignored files have no Git backup; keep private documentation in access-controlled storage outside this repository before deleting or replacing a checkout.

## Feature documentation

When a capability changes, update its canonical documentation and the [maintained feature map](docs/features.md). The `kbui-docs-features` skill supports this workflow. Link shared examples rather than copying them; distinguish local implementation from publication. `bun test scripts/feature-docs.test.ts` checks the register's local file destinations and runs inside `bun run check`.
