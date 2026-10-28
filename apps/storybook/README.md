# kbui Storybook

kbui's live documentation and accessibility tests. Stories live next to each component in `packages/react/src/components/`. This folder holds the Storybook configuration, the standalone pages in `docs/`, and the composed showcase stories and fixtures in `stories/`. Files under `stories/` are not components, so the component coverage test does not apply to them.

## Maintained home

[The maintained home](site/README.md) introduces kbui through a live day-off composition. The site also serves a matching playground, searchable featured entries, curated examples, and a component catalog. Storybook and the site render the same demo source; Catalog previews embed the actual component stories and its API summaries come from the React guide; full typed API documentation stays in Storybook. Build both with `bun run --filter @kbui/storybook build:site`; serve `dist/` as one static site.

## Running

From the repository root:

```bash
bun run storybook
```

This builds the packages and serves Storybook on port 6006. The theme switch in the toolbar sets `data-theme` on `<html>`, as a consuming app would.

| Task | Command |
|---|---|
| Build a static copy | `bun run --filter @kbui/storybook build-storybook` |
| Build and serve a static copy in Docker on port 6007 | `bun run docs:up` |

## Tests

```bash
bun run test:stories
```

Every story is rendered in headless Chromium and scanned for accessibility violations. Any violation fails the run, so each story is also a test. The suite runs twice, once by default and once with the reduced-motion preference on (`vitest.config.ts`). Dark coverage comes from stories that set `globals: { theme: "dark" }`. Complete React modules in installation and usage documentation are typechecked by `verify:code` within `bun run check`. MDX pages are compiled by the Storybook build; they do not run story play functions. Responsive site stories and staged Chromium/WebKit journeys exercise the website separately through `test:site` and `verify:release`.

The fixture restyle in `stories/skin-fixture-values.ts` is checked by `bun test apps/storybook/stories`, which runs inside `bun run check`.

## Pages

| Page | Source |
|---|---|
| Introduction | `docs/Introduction.mdx` |
| Foundations / Tokens | `docs/Tokens.mdx`. Reads its list from `@kbui/tokens`, so it always matches `tokens.json`. |
| Each component | Colocated `.stories.tsx` examples, canonical API tables from `packages/react/README.md`, and practical usage/accessibility guidance from `catalog/component-guides.ts`, rendered by `.storybook/docs.tsx` |
| Showcase / Restyle | `stories/Skins.stories.tsx`, one composition from stock `Button`, `Dialog`, `Panel` and `Status`, rendered with default tokens and with the fixture restyle from `stories/skin-fixture.tsx` |

## Story visibility

The default development server and production build expose component documentation and public guides. Internal Site, Showcase and Validation stories stay in `stories/` and are not shipped. Use `bun run --filter @kbui/storybook dev:internal` for the full QA view on port 6008. Test commands enable that scope automatically; the public catalog gate rejects internal entries in production output. Site validation builds a temporary internal artifact for built control-edge checks and removes it afterward; it never enters deployment staging. See [Contributing](../../CONTRIBUTING.md#public-docs-and-internal-stories) for placement and deletion rules.
