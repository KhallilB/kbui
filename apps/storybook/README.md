# kbui Storybook

This is where kbui's live documentation runs, along with its accessibility checks. The stories themselves sit next to each component in `packages/react/src/components/`. This folder holds the Storybook setup and the handful of standalone pages in `docs/`.

## Running it

From the repo root:

```bash
bun run storybook
```

That builds the packages and opens Storybook on port 6006. The theme switch in the toolbar sets `data-theme` on `<html>`, the same way an app using kbui would.

To build a static copy, run `bun run --filter @kbui/storybook build-storybook`. `bun run docs:up` builds its own copy inside Docker and serves it on port 6007.

## Tests

```bash
bun run test:stories
```

Every story is rendered in headless Chromium and scanned for accessibility problems. Any violation fails the run, so each story doubles as a test. The standalone docs pages aren't tested.

## Pages

The Introduction page lives in `docs/Introduction.mdx`. The Foundations / Tokens page, in `docs/Tokens.mdx`, reads its list from `@kbui/tokens`, so it stays in step with `tokens.json` automatically. Each component's page comes from its `.stories.tsx` file.
