# kbui Storybook

Live documentation for kbui and its accessibility gate. Stories live next to the components in `packages/react/src/components/*/`; this app only configures Storybook and holds the docs pages in `docs/`.

## Run

```bash
bun run storybook                                # from the repo root; builds first
bun run --filter @kbui/storybook build-storybook # static build in storybook-static/
bun run docs:up                                  # static build served by Docker at :6007
```

The toolbar switches between light and dark by setting `data-theme` on `<html>`, the same way a consumer app does.

## Tests

```bash
bun run test:stories
```

Every story runs in headless Chromium through `@storybook/addon-vitest`. The a11y addon is set to `test: "error"`, so any axe violation fails the run. Docs pages are not tested.

## Pages

| Page | Source |
|---|---|
| Introduction | `docs/Introduction.mdx` |
| Foundations / Tokens | `docs/Tokens.mdx`, generated from `@kbui/tokens` |
| Components | `packages/react/src/components/*/*.stories.tsx` |
