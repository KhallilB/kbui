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
| `bun run check` | Builds every package, then runs Biome, the typecheck, generated/documented React example compilation, unit tests, `test:pack` and `test:consumer`. CI runs these checks. |
| `bun run test:pack` | Packs each published package and checks the tarball's name and contents. Needs built packages. |
| `bun run test:consumer` | Installs the packed React tarball outside the workspace, checks installed versions, typechecks the consumer and runs its smoke check. Needs built packages. |
| `bun run test:stories` | Renders every story in headless Chromium and runs an accessibility scan on each. CI runs it. |
| `bun run test:overlays` | Checks overlay/disclosure states, native keyboard boundaries and scanner scope in Chromium, Firefox and WebKit, both themes and motion preferences. CI runs it. |
| `bun run validate:site` | After `bun run build`, runs the complete site/browser and deployment dry-run checks. PR and main validation share these stages; without an argument this command runs all stages. Needs Bash and the documented deployment Node version. |
| `bun run new <Name>` | Generates a new component. See [Adding a component](docs/guides/adding-a-component.md). |
| `bun run check:tokens` | Compares the current token inventory against `--base <ref>` and rejects unauthorized token removals, renames, or `$type` changes. |
| `bun run lint:fix` | Applies Biome's fixes. |
| `bun run docs:up` | Serves a static Storybook build from Docker at http://localhost:6007. `bun run docs:down` stops it. |

`test:stories` needs Chromium and built packages. On a new machine, run `bunx playwright install chromium` and `bun run build` once before the first run.

CI job names use `<purpose>: <scope>`: `Check` for static/package checks, `Test` for executable suites, `Gate` for combined results, and `Deploy` for publishing. Add future jobs using the same pattern; describe detailed coverage in their steps.

CI runs **Check: code** on every PR, with separate named steps for package builds, lint, TypeScript, documented examples, unit tests, tarball contents, and packed-tarball consumer installation. Consumer installation uses the [shared fixture](.github/consumer/README.md) without publishing to npm. Docs-only changes compile Storybook without launching browsers. Runtime changes and `packages/react/docs/components/*.md`, which supplies generated catalog APIs, also start four independent checks in the official Playwright image:

- **Test: stories** renders interaction stories in normal and reduced motion.
- **Test: themes** checks component stories across the default themes.
- **Test: layouts** checks site viewports and accessibility.
- **Test: site** builds and stages the site, checks Chromium and WebKit journeys, and validates the deployment package.

The **Gate: validation** check waits for all four jobs and fails if any job fails, is cancelled, or is unexpectedly skipped. Preview publishing still waits for that gate. Each job builds its own packages on a standard `ubuntu-latest` runner; the split adds no artifact uploads or shared browser caches. Linux browser jobs reuse the image's installed browsers and system dependencies. Keep the exact Playwright package version and all workflow image tags aligned.

Run one stage locally with `bun run validate:site stories`, `themes`, `responsive`, or `built`, after `bun run build`. Run `bun run validate:site` for the complete sequence locally. Production validation runs these four stages in parallel: the artifact job runs static checks and the built stage, while the browser matrix runs stories, themes and layouts. Deployment waits for every stage to pass. Built validation prints named log groups and cleans its temporary servers and QA output on success or failure.

Container jobs use the image's Node/npm runtime to install the Bun version pinned in `packageManager`; no archive utilities are needed. Before dependency installation, they trust the exact checkout path so Git and Lefthook accept the mounted runner-owned workspace.

## Local review limits

Ordinary comprehensive local reviews retain the review-loop defaults of 400 hand-written production lines and 10 production files. A coherent component family may use the separately approved family limits of **2,000 production lines and 40 production files**. This accounts for colocated public stories, catalog integration, component CSS, token definitions and reusable media assets, which the review tool counts as production surfaces.

Use the family limits only when the components share one documented interaction or presentation contract and splitting would duplicate that contract. Keep unrelated work separate. Above these limits, reduce or split the scope before review. Record the chosen limit and actual size in the local completion report.

The family allowance changes review size only. Exact-head evidence, the Full Slice probe floor, independent review lenses, source and artifact checks, coupled-surface validation, findings closure, signing and required repository checks remain mandatory. A size allowance never makes an unresolved finding acceptable.

For an approved family review, pass these repository-owned limits to the installed review-loop gate:

```bash
REVIEW_LOOP_SIZE_LIMIT=2000 REVIEW_LOOP_FILE_LIMIT=40 \
  ~/.codex/skills/review-loop/scripts/review_loop_round.sh gate \
  tier=full probes=16 base=origin/main \
  artifact="bun run --filter @kb.ui/storybook build:site" \
  coupled="bun test scripts/feature-docs.test.ts apps/storybook/stories/catalog-source.test.ts"
```

Open the review round and record its exact-head executable probes before invoking the gate. Read the completion report; a refused gate still blocks push. The installed review skill owns the full procedure.

## Before you push

The pre-commit hook lints staged files and typechecks the repository. It does not run tests. Run what CI runs before you push:

```bash
bun run check && bun run test:stories && bun run test:overlays
```

Behavior changes are test-first: write the test, see it fail, then write the code that makes it pass.

## Public docs and internal stories

Follow [Adding a component](docs/guides/adding-a-component.md), including its [theme, selection-state and rendered-contrast requirements](docs/guides/adding-a-component.md#theme-and-state-support), when introducing or changing shared controls. Verify the actual light/dark theme roots and visible control states in the rendered previews.

Public Storybook includes `apps/storybook/docs` and component stories beside `packages/react/src` implementations. Keep reusable component examples there. Site screens, restyle showcases and validation fixtures belong in `apps/storybook/stories`; they are excluded from production bundles and navigation.

Each visible story should teach a distinct use, variant, or meaningful state. Use the theme toolbar instead of adding a second public story just for dark mode. Tag theme duplicates and regression-only component fixtures with `tags: ["!dev", "!autodocs"]`; keep their default `test` tag. This removes them from the sidebar and generated Docs without breaking direct story URLs, catalog previews, or automated checks. New app-only fixtures stay in the internal directory above. Keep errors, empty states, disabled controls, and useful compositions visible.

Storybook chrome and Docs read the package palette from `.storybook/theme.ts`; do not copy color values into manager overrides. Docs styling stays scoped to documentation classes so it cannot restyle the components being demonstrated. `verify:storybook` checks the built manager, curated navigation, retained QA URLs, and synchronized System/Light/Dark themes. It runs as part of `validate:site`.

Each component has a canonical API and complete usage example in `packages/react/docs/components/<Name>.md` and live usage/accessibility guidance in `apps/storybook/catalog/component-guides.ts`. Storybook reads the canonical API tables through `virtual:kbui-reference`; edit that source instead of copying types into a Docs page. Keep primary examples practical and compilable. Stories that render an already-open modal need `!autodocs` so reading a page never launches a dialog; keep them reachable in the canvas. `verify:component-docs` checks every component in both themes, mobile layouts, editable controls, and dialog focus as part of site validation.

Run `bun run --filter @kb.ui/storybook dev:internal` to inspect those fixtures at http://localhost:6008. Browser test commands opt into the same internal scope with `KBUI_STORYBOOK_INTERNAL=1`. Keep validation fixtures while they protect unique behavior; delete one only after equivalent coverage exists elsewhere. Do not remove tests just to tidy navigation. `build:site` rejects internal stories in its public index and verifies every catalog link. `validate:site` builds a separate temporary QA Storybook for built control-edge checks, then removes it; deployment staging contains only public docs. Set `SITE_VALIDATION_PORT` when local ports 4175/4176 are occupied; QA uses the next port.

### Components and recipes

Use [Components and recipes](docs/guides/components-and-recipes.md) for the delivery and ownership distinction. Layout remains a component category. Component work follows [Adding a component](docs/guides/adding-a-component.md); a recipe adds no package export or component inventory entry.

New recipes provide copied source for a whole task over time: selection, drafts, validation, pending and failed saves, and focus after every step. Recipes in a flow family are checked against that family's shared flow contract. List and detail is the only family today. Examples remain larger demonstrations with links to their reusable parts. Contributor and agent instructions link to these rules rather than keeping another delivery checklist.

The established PageHeader and FormSection composition recipes remain maintained exceptions. Preserve their recipe URLs, public story IDs and exact source sets. The [maintained composition decision](docs/guides/components-and-recipes.md#maintained-composition-recipes) supersedes their retirement while retaining the contribution rules below.

#### Add a recipe

Start from a task a real product needs, and build the complete flow, including every empty, pending and error state. Arrangement alone is an example or a package pattern. A different flow is a different recipe, not a flag on an existing one.

Keep executable source, required CSS and runnable stories in `apps/storybook/recipes`. Register its guide, exact source files, component dependencies and default story in `apps/storybook/catalog/content.ts`. Use a thin `apps/storybook/docs/<Name>.mdx` wrapper around `RecipeDocs`. The website and Storybook share the guide and exact copyable files through `virtual:kbui-system`. Do not duplicate the guide in MDX or page JSX.

A recipe imports package exports, never another recipe. A shared support file is allowed only when every recipe that uses it lists it in its `files`. Keep routing, saving, validation policy and permissions behind props the guide documents, and keep validation errors separate from save failures: a field's description holds validation errors only, and a failed save shows a visible, announced message instead. Normalise an empty selection parameter to `null` at the routing boundary, then compare with `!== null`.

A recipe that lets people pick a record from a list and act on it in a detail pane sets `flow: "list-detail"` in `content.ts`, and adds `apps/storybook/stories/list-detail-flow/<Name>.stories.tsx`. That file supplies a `FlowFixture` (records, accessible names, draft controls and status region) to the shared rules in `contract.ts`, and exports one `story(id)` per rule that applies, ending with `complete()`. `complete()` fails when an applicable rule has no story, and a bun test fails when a flow recipe has no contract file or a file has no recipe. Record each rule the recipe does not meet yet in `gaps`, with the reason.

Write `docs/guides/<name>.md` as the canonical explanation, in this order: use when; use instead (the nearest component, pattern or recipe, and what separates them); copy the files; what you supply, marking preview props; business logic (what each validation and save outcome does); task policy you can change; flow guarantees; customising the look; check your changes; known limits. Draw the file list, task policy and flow guarantees from `content.ts` and the contract rather than retyping them. Mark the guide as unreleased until its source and documentation are published.

`verify:code` compiles registered recipe modules and guide examples. `build:site` rejects missing guides, files, local source dependencies, component dependencies and built Storybook targets. Add behavior tests for represented interactions, source-loading rejection cases and affected navigation; check both themes, narrow layouts and keyboard access. Cover pending, failure and unmount states where the flow has them. Browser-check scope derives from registered guides, and deployment includes `docs/guides/**` so future recipes need no separate guide allowlist. Against a combined static preview, `verify:recipes` checks recipe discovery, live previews, refresh/history, invalid URLs, Storybook links and theme changes. It runs during `validate:site`.

#### Change a recipe or a rule

Keep a changed recipe's URL, story title and story IDs, and keep its `files` list exact. Its contract stories must still pass. A gap story passes only while the rule still fails, so fixing the recipe makes it fail until you remove the gap. Change task policy, such as where the panes collapse or whether context starts open, in the registry and the guide together. A prop marked preview may be renamed or reshaped before 1.0 without an alias; name the change in the release notes.

To add a rule, add it to `contract.ts`, and show it failing on one recipe, or on a deliberately broken copy, before fixing anything. Each recipe's `complete()` then fails until that recipe has a story for it or lists it as a gap. Rules that need async commits declare `requires: "async"` and apply only to fixtures with `async`. Do not weaken a rule to make a recipe pass; a recipe that cannot meet it yet lists a gap with the reason.

Move code into a shared support file only when two recipes need it unchanged.

#### Retire a recipe

Propose an explicit retirement decision when a package component or pattern covers a recipe's whole job, or when it no longer meets the bar for adding one. PageHeader and FormSection remain maintained under the composition exception above; package overlap alone does not retire them. Once a retirement is accepted, follow these steps. Remove its entry from `recipeDefinitions`, and delete its source, stories, docs wrapper and guide, plus any CSS nothing else uses. Switch anything that imported or named it to the replacement. Keep `/recipes/?recipe=<id>` resolving, hash included, to the replacement's page. Its story IDs are removed with it unless an example page keeps them. Record the retirement in `docs/features.md`, and say in the release notes what to use instead. Copies already in apps are theirs and keep working.


## Component conventions

The existing components follow every rule below and are the best reference.

For a new shared capability or complete screen recipe, start with [Developing components and screen patterns](docs/guides/component-and-screen-patterns.md). It covers current and concurrent capability, component-versus-recipe ownership, interaction and customization contracts, complete-screen validation, and evidence-backed documentation. Use the smallest applicable workflow; bounded copy or appearance corrections do not require a new study. [Adding a component](docs/guides/adding-a-component.md) owns the package checklist.

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
- Use inline code for code mentioned in a sentence: component and recipe names, props, functions, types, filenames, file paths, CSS selectors, HTML elements and attributes. For example: Set `level={2}` on `PageHeader` and place fields inside `Panel.Body`. Keep ordinary prose and visible UI labels in normal text.
- Use fenced code blocks with a language tag for examples and multi-line commands, such as `tsx`, `css` or `sh`. Keep examples complete and commands copyable; use inline code for short commands and syntax inside prose.
- Date any claim that can go stale, such as test counts, versions or external projects.
- Give each topic one home and link to it instead of repeating it.

### React reference maintenance

Keep `packages/react/README.md` as the package overview and grouped component index. Put component-specific usage, props, defaults, and behavior in `packages/react/docs/components/<Name>.md`, starting with `# <Name>`. Use second-level headings for Usage and Reference. Every page needs a complete `tsx` example with imports and an exported component, an API or composition table, a return link to the index, and a link to its live Storybook Docs page. Add a short More examples list linking to distinct existing stories and a Related components paragraph explaining nearby choices. Keep the story implementation in its colocated story file; add a deeper page example only when it teaches a missing workflow or caller-owned state.

The catalog and Storybook read those API tables directly. Keep interactive stories beside implementations and live usage/accessibility guidance in `apps/storybook/catalog/component-guides.ts`. Shared topics belong in `docs/guides`; link them from component pages instead of repeating them. Keep public reference pages free of release-specific version literals; describe unreleased behavior explicitly when needed.

When adding a component, create its reference page and index link alongside its public export, catalog metadata, guidance, and stories. `bun run check` checks index coverage, reference links, API parsing, complete example compilation, and packaged Markdown. Changes to component reference pages also run site validation and trigger the site deployment workflow.

### Accessibility documentation

Every component reference must explain how to implement and verify its applicable accessibility requirements. Follow [Implementing and verifying accessibility](docs/guides/accessibility.md) as the shared standards/procedure source. Keep component-specific support, author responsibilities, concrete checks, and linked WCAG criteria in `apps/storybook/catalog/accessibility-guides.ts`; Storybook renders that same contract. Label APG patterns as informative, including work-in-progress limitations where applicable.

Name the public props or composition points that supply labels, relationships, state, focus, validation feedback, and alternative input methods. Confirm those capabilities in implementation and meaningful tests before claiming support. If a required capability is missing, implement/test it or explicitly record the gap; a vague instruction to “make it accessible” is insufficient. Include a complete recipe when a caller-owned requirement needs composition, such as non-drag pointer resizing.

Document automated evidence and manual verification limits separately. Checks must state an action and expected result for keyboard/focus, naming/state, errors/updates, and relevant visual or pointer behavior. Use official WCAG links, distinguish Level A/AA requirements from AAA enhancements and APG recommendations, and do not claim component or page conformance from an accessibility scan alone.

## Commits

Sign every commit with `git commit -S`; the repository uses SSH signing. Subjects follow Conventional Commits, for example `feat(react): add Badge` or `fix(css): keep focus ring on invalid inputs`. Each commit must pass `bun run check` on its own. Do not add AI attribution lines or trailers.

## Pull requests

Use the [PR template](.github/pull_request_template.md): **What changed** and **Why**. Explain the result and its reason in clear, professional prose. Include supporting context, checks actually run, review guidance or relevant risks in short paragraphs where they help the reader. Avoid canned phrasing, unnecessary headings and a fixed checklist for every change. Repository templates take precedence over generic PR-description helpers.

## Releases

The root package version drives the site install builder and generated first-component example. Release Please updates the marked version blocks in `README.md`, `docs/guides/using-kbui.md` and `apps/storybook/docs/Introduction.mdx`. Keep one version literal per managed line and reuse `KBUI_VERSION` in URLs: the generic updater replaces only the first version on a line. `bun run check` rejects stale, missing or unsafe version blocks, and verifies that each installation entry point is registered with the updater.

Review usage, migration guidance and component API documentation whenever behavior or exports change. Version automation updates release metadata; it cannot infer new API semantics. Historical compatibility versions stay outside managed blocks. `bun run check` also compiles complete React examples from the installation entry points, React API recipes, and numeric-field, file-input and overlay guides against the current package exports, alongside generated catalog and site examples. Run the setup stories when changing installation behavior.

Commit subjects on `main` set the next version: `fix` raises the patch, `feat` the minor, and a breaking change (`feat!:` or a `BREAKING CHANGE:` footer) the minor until 1.0. Use conventional commit subjects and preserve SSH-signed commits with a GitHub merge commit. Rebase-and-merge drops the original signatures; squash replaces the commits. Keep the merge title conventional too.

Release Please keeps a release PR open on `main`. Merging it creates the tag; GitHub Actions checks the tagged source, attaches a tarball per package, verifies consumer installation on Linux, macOS and Windows, then publishes those same tarballs to npm. `@kb.ui/react`, `@kb.ui/css` and `@kb.ui/tokens` use validated GitHub Actions trusted publishers. The connection on each package is GitHub Actions, owner `KhallilB`, repository `kbui`, workflow filename `release.yml`, with no environment restriction and direct `npm publish` allowed. Dist-tag management is off. The publish job uses GitHub OIDC with `id-token: write`, Node 24 and an npm version supporting trusted publishing; no stored npm token is required.

Do not edit versions or `CHANGELOG.md` by hand. After merging, verify the release workflow, main CI and site deployment. Confirm all three npm versions and `latest` tags, compare each npm integrity with its GitHub tarball, and test a clean registry install. A successful rerun that skips existing versions proves recovery completed; it does not exercise a new publisher connection. npm package settings must show the connection as **Valid** after a real publication.

Each npm package page displays the `README.md` from that package's root at publication time. Updating GitHub or Storybook alone leaves npm's copy unchanged; [npm requires a new package version](https://docs.npmjs.com/about-package-readme-files/#updating-an-existing-package-readmemd-file). Include README changes in the next synchronized release. Let the release PR generate versions and changelog data. Documentation commits (`docs:`) are visible release entries and prepare a patch release PR automatically, so README-only corrections no longer need a manual version footer. Review and merge that PR through the normal release process.

`bun run test:pack` checks that each archive ships its package README byte for byte. After publishing, the release workflow compares all three registry READMEs, `latest` versions and SHA-512 integrity values with the published archives. It retries while registry caches settle and fails if any mismatch remains. Recovery of an older tag checks its immutable archive integrity without requiring its README to replace the current npm page. Spot-check rendered npm pages when changing README layout. Package READMEs must describe the published install path; the repository README and Storybook remain complementary entry points.

GitHub, npm and Storybook share source documentation rather than separate release edits: package READMEs own npm pages, `packages/react/README.md` supplies Storybook API tables, and the marked installation blocks and site version come from the root version. Update usage semantics in their canonical sources when APIs change; automation checks versions, compiled examples and published bytes, but cannot infer new prose.

The site resolves public notes through `releaseCopy` in `apps/storybook/site/changelog-model.ts`. Every new version gets highlights from the generated changelog, with internal scopes filtered out and breaking instructions retained. Maintenance-only releases get a short summary and a full-history link. A version bump must work without a new handwritten entry. Optional titles, highlights and detailed migration instructions in `apps/storybook/site/release-notes.ts` override the generated copy; an absent or empty upgrade list falls back to the changelog's breaking instructions. Keep migration instructions accurate when behavior or package names change.

Before merging a release PR, run `bun test apps/storybook/stories/release-notes.test.ts apps/storybook/stories/changelog-model.test.ts scripts/release-mentions.test.js scripts/ci-workflows.test.ts` and the normal release checks. These tests cover current notes, an unknown future version, breaking migrations, and maintenance-only releases. Check the final release PR head after release-please refreshes it; edits to a generated release branch can be overwritten.

Put npm scopes and package names inside backticks in commit subjects, breaking-change footers, PR titles and release prose: `@kbui`, `@kb.ui`, and `@kb.ui/react` are package names. Bare scopes can mention unrelated GitHub accounts or be auto-linked as contributor handles. The release workflow runs `scripts/release-mentions.mjs` after creating each release to remove those scope mentions while preserving real contributor credit. Repair an existing release by editing its notes; do not rewrite its tag or publish different tarballs under the same version.

If npm publishing fails after the release tarballs were uploaded, retry the existing release with the current workflow: `gh workflow run release.yml --ref main -f tag=v0.10.1` (replace the tag with the release being recovered). This checks the tagged source, downloads the exact uploaded tarballs, repeats consumer installation on every OS, and skips package versions already on npm. It does not create a new release or replace its assets. Rerunning an old failed job uses its old workflow definition, so it cannot pick up a later publishing fix. Local tarball arguments must start with `./` or an absolute path; npm can interpret `release/package.tgz` as a GitHub repository shorthand.

## Private documentation

Keep product plans, roadmaps, architecture, decision records and research in `.internal/docs/`. This directory is ignored by Git and excluded from Docker builds. Keep installation, component, token and contribution guides in tracked documentation. Public documentation must not link to private files.

Local instruction files and tool settings are ignored too. Ignored files have no Git backup; keep private documentation in access-controlled storage outside this repository before deleting or replacing a checkout.

## Feature documentation

When a capability changes, update its canonical documentation and the [maintained feature map](docs/features.md). The `kbui-docs-features` skill supports this workflow. Link shared examples rather than copying them; distinguish local implementation from publication. `bun test scripts/feature-docs.test.ts` checks the register's local file destinations and runs inside `bun run check`.

### Adding an npm package

Add the package's version field to `release-please-config.json` under `extra-files`; `bun run test` checks this coverage. Update the release retry's explicit asset list when adding a published package. Keep package repository metadata pointed at this GitHub repository so provenance can be verified.

A package must exist on npm before its trusted publisher can be configured. After the release's source checks and all three consumer installs pass, an authenticated owner can publish the exact downloaded archive once with `npm publish ./archive.tgz --access public`, using the actual local filename and completing npm's 2FA flow. Configure that package's GitHub Actions trusted publisher with the values above and allow direct publication. Check npm's validation deadline: a new connection must complete a real workflow publication before that deadline. Rerunning a version already on npm skips it, so validation needs the next approved release. Existing packages already use this automatic process.

The legacy `@kbui` scope is unavailable on npm. Releases before 0.10.0 retain their original package names and GitHub tarballs; the publish job skips that scope. Current packages use `@kb.ui/*`, with stable npm publication from 0.10.1. Version 0.10.0 has the new names but remains available through GitHub tarballs. Keep the historical migration instructions in the [usage guide](docs/guides/using-kbui.md#upgrading).
