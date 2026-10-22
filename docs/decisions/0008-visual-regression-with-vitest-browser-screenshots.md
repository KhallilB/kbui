# 0008. Catch visual regressions with Vitest browser screenshots

## Status

Accepted on 2026-10-22; the first screenshot assertions are still to be written.

## Context

The facet vocabulary (`Facet`, `Status`, and decisions 0009 and 0010) puts meaning into geometry: a clipped corner, a 1px seam, a 3px rail. The accessibility scan in `bun run test:stories` cannot see any of that. A regression that removes the cut or moves the rail passes every current check.

The story test runner is already Vitest in browser mode, driving headless Chromium through Playwright. Vitest 4 added `expect(locator).toMatchScreenshot()` with a comparator and per-platform reference images; the installed `@vitest/browser-playwright` 5.0.5 exposes it.

## Decision

Visual regression tests use Vitest browser mode's `toMatchScreenshot` inside story play functions or dedicated `*.visual.test.tsx` files under `apps/storybook`. Reference images are committed under `apps/storybook/__screenshots__/`, one set per platform, and CI runs on the same Linux image that generates them. A failing comparison is a review conversation, not an automatic update: the `--update` flag runs only by hand.

Scope: the showcase stories, `Facet` tones and cuts, and any component whose meaning depends on geometry. Plain components such as `Button` are not screenshotted unless a regression has happened.

## Options considered

- Vitest browser `toMatchScreenshot`: accepted. No new runner, no new service, references live in the repository, and the same Chromium that runs the accessibility scan takes the pictures.
- Chromatic or Percy: rejected for now. A hosted service adds an account, a secret in CI and a per-snapshot bill for a repository that so far has one consumer. Revisit if review needs a visual diff UI.
- Playwright test with `toHaveScreenshot`: rejected. It would be a second runner next to Vitest with its own configuration and reporters.
- Storyshots style DOM snapshots: rejected. They do not see CSS, which is where the facet geometry lives.

## Consequences

Reference images are binary files in git. The repository grows by a few hundred kilobytes per screenshotted story.

Screenshots differ between macOS and Linux font rendering, so a developer who generates references locally may see CI diffs. The rule above (CI's platform is the source of truth) resolves that at the cost of one CI round trip.

## Soundness boundary

Pixel comparison proves that the rendering did not change. It does not prove that the rendering is right, and a wrong reference stays wrong until someone looks at it.

## Threat model

Guards against silent CSS regressions in geometry and color. Does not guard against a change that is intentional but bad; review does that.

## Non-goals

- Cross-browser visual coverage. Chromium only.
- Screenshots for every story.

## Revisit if

- Reference churn makes the update flag run on most pull requests.
- A second consumer needs a visual diff review tool.
- Vitest removes or reshapes the matcher.

## Adoption

None yet. The story runner is configured; the first `toMatchScreenshot` call is not written.

## Validation

- Still to do: a screenshot assertion for each showcase story, and a deliberately broken cut that fails it.
- Nothing has run yet.

## Links

- [Vitest visual regression testing](https://vitest.dev/guide/browser/visual-regression-testing)
- Related: [0009](0009-icons-are-caller-provided.md), [0010](0010-dark-product-skin-light-validated.md)
