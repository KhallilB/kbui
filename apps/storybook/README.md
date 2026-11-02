# kbui Storybook

This app hosts kbui’s documentation and accessibility tests. Component stories sit beside their source in `packages/react/src/components/`. This folder holds Storybook settings, public pages in `docs/`, and demos and test fixtures in `stories/`. Files in `stories/` are not package components, so the component coverage test does not count them.

## Maintained home

[The maintained home](site/README.md) introduces kbui through a live day-off composition. The site also serves a matching playground, searchable featured entries, curated examples, and a component catalog. Storybook and the site render the same demo source; Catalog previews embed the actual component stories and its API summaries come from the React reference; full typed API documentation stays in Storybook. Build both with `bun run --filter @kb.ui/storybook build:site`; serve `dist/` as one static site.

## Running

From the repository root:

```bash
bun run storybook
```

This builds the packages and serves Storybook on port 6006. The theme switch in the toolbar sets `data-theme` on `<html>`, as a consuming app would.

| Task | Command |
|---|---|
| Build a static copy | `bun run --filter @kb.ui/storybook build-storybook` |
| Build and serve a static copy in Docker on port 6007 | `bun run docs:up` |

## Tests

```bash
bun run test:stories
```

Every story is rendered in headless Chromium and scanned for accessibility violations. Any violation fails the run, so each story is also a test. The suite runs twice, once by default and once with the reduced-motion preference on (`vitest.config.ts`). `test:themes` (`vitest.themes.config.ts`) renders every component story again in light and dark, with and without reduced motion, so stories need no dark copies. Complete React modules in installation and usage documentation are typechecked by `verify:code` within `bun run check`. MDX pages are compiled by the Storybook build; they do not run story play functions. Responsive site stories and staged Chromium/WebKit journeys exercise the website separately through `test:site` and `verify:release`.

The fixture restyle in `stories/skin-fixture-values.ts` is checked by `bun test apps/storybook/stories`, which runs inside `bun run check`.

Built-browser checks live in `e2e/` and run through Playwright Test. Build packages and the combined site first, then run all suites:

```bash
bun run build
bun run --cwd apps/storybook build:site
bun run --cwd apps/storybook test:e2e
```

Existing `verify:*` commands select individual suites. Public checks start a strict static server on port 4177; internal checks build QA fixtures and serve port 4178; override checks need no server. Set `CATALOG_PREVIEW_URL` or `STORYBOOK_URL` to use an existing public build, and `CONTROL_EDGES_URL` or `FOCUS_PREVIEW_URL` for an existing internal build. Existing recipe, story, theme, browser and profile filters remain supported. The runner owns isolated contexts, cleanup, failure screenshots and `.playwright/test-results/`; append `--trace on` to an individual command for traces. Retries remain disabled so failures stay visible.

`RECIPE_SITE_URL` and `LANDING_PREVIEW_URL` take precedence for their own suites when several server URLs are set.

## Pages

| Page | Source |
|---|---|
| Introduction | `docs/Introduction.mdx` |
| Foundations / Tokens | `docs/Tokens.mdx`. Reads its list from `@kb.ui/tokens`, so it always matches `tokens.json`. |
| Each component | Colocated `.stories.tsx` examples, API reference tables from `packages/react/README.md`, and practical usage/accessibility guidance from `catalog/component-guides.ts`, rendered by `.storybook/docs.tsx` |
| Showcase / Restyle | `stories/Skins.stories.tsx`, one composition from stock `Button`, `Dialog`, `Panel` and `Status`, rendered with default tokens and with the fixture restyle from `stories/skin-fixture.tsx` |

## Story visibility

The default development server and production build expose component documentation and public guides. Internal Site, Showcase and Validation stories stay in `stories/` and are not shipped. Use `bun run --filter @kb.ui/storybook dev:internal` for the full QA view on port 6008. Test commands enable that scope automatically; the public catalog gate rejects internal entries in production output. Site validation builds a temporary internal artifact for built control-edge checks and removes it afterward; it never enters deployment staging. See [Contributing](../../CONTRIBUTING.md#public-docs-and-internal-stories) for placement and deletion rules.
