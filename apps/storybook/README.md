# kbui Storybook

kbui's live documentation and accessibility tests. Stories live next to each component in `packages/react/src/components/`. This folder holds the Storybook configuration, the standalone pages in `docs/`, and the composed showcase stories and fixtures in `stories/`. Files under `stories/` are not components, so the component coverage test does not apply to them.

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

Every story is rendered in headless Chromium and scanned for accessibility violations. Any violation fails the run, so each story is also a test. The suite runs twice, once by default and once with the reduced-motion preference on (`vitest.config.ts`). Dark coverage comes from stories that set `globals: { theme: "dark" }`. The standalone pages are not tested.

The fixture skin in `stories/skin-fixture-values.ts` is checked by `bun test apps/storybook/stories`, which runs inside `bun run check`.

## Pages

| Page | Source |
|---|---|
| Introduction | `docs/Introduction.mdx` |
| Foundations / Tokens | `docs/Tokens.mdx`. Reads its list from `@kbui/tokens`, so it always matches `tokens.json`. |
| Each component | That component's `.stories.tsx` file |
| Showcase / Skins | `stories/Skins.stories.tsx`, one composition from stock `Button`, `Dialog`, `Panel` and `Status`, rendered with default tokens and with the fixture skin from `stories/skin-fixture.tsx` |
