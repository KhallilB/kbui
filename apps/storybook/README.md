# kbui Storybook

kbui's live documentation and accessibility tests. Stories live next to each component in `packages/react/src/components/`. This folder holds the Storybook configuration and the standalone pages in `docs/`.

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

Every story is rendered in headless Chromium and scanned for accessibility violations. Any violation fails the run, so each story is also a test. The standalone pages are not tested.

## Pages

| Page | Source |
|---|---|
| Introduction | `docs/Introduction.mdx` |
| Foundations / Tokens | `docs/Tokens.mdx`. Reads its list from `@kbui/tokens`, so it always matches `tokens.json`. |
| Each component | That component's `.stories.tsx` file |
