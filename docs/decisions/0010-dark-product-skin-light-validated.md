# 0010. Ship the product skin in dark, validate light in Storybook

## Status

Accepted on 2026-10-22.

## Context

The first consumer runs in a desktop window where operators watch long-running work, mostly in dark. Its look, a product skin, is a set of `--kb-facet-*` and `--kb-status-*` overrides. kbui itself must remain neutral and keep working in both themes for any other consumer.

Two questions followed. Where does the skin live, and which theme is the one we design for first?

## Decision

The skin is not part of `packages/`. It is a scoped set of custom property overrides that a consumer sets on a wrapper element, using only the component tokens documented in `tokens.json`. Storybook holds a neutral fixture in `apps/storybook/stories/skin-fixture-values.ts` with a decorator that applies it; a test proves the fixture sets documented `--kb-facet-*` and `--kb-status-*` properties only, uses no `.kb-*` selectors and no `!important`.

The product is designed and reviewed in dark first. Light is validated, not designed: every `Facet` and `Status` story and every showcase story also renders in light and must pass the accessibility scan there. Both themes must pass with and without the skin, and the story suite also runs with the reduced-motion preference on.

Removing the decorator must leave layout and behavior unchanged. The skin may change values, never structure.

## Options considered

- Skin as scoped custom property overrides, dark first, light validated: accepted. The product gets its look, kbui stays neutral, and the token contract is the only coupling.
- Skin as a `data-skin` attribute with selectors in `@kbui/css`: rejected. It would put one product's look into the shared package and bypass the palette lint.
- A third theme next to light and dark: rejected. 0004 fixes the structure at two themes, and a skin is a different axis from a theme.
- Dark only: rejected. One consumer's preference should not remove a theme that costs nothing to keep validated.

## Consequences

Light is never the primary review surface for the product. A light-only visual problem may be caught only by the accessibility scan, not by a person.

Consumers own their skin values, including contrast. The fixture uses semantic colors so it inherits kbui's checked values.

## Soundness boundary

The accessibility scan checks contrast and labeling in both themes. It does not judge whether the light rendering looks finished.

## Threat model

Guards against product styling leaking into `packages/` and against a skin that breaks when the consumer removes it. Does not guard against a consumer skin that fails contrast with its own raw values.

## Non-goals

- Shipping any skin from kbui.
- A theme switcher component.

## Revisit if

- A second consumer wants the same product skin; it could then move to a `@kbui/skin-<name>` package.
- A skin needs structure, not values. That is a component change, not a skin.

## Adoption

The showcase stories under "Showcase / Skins" render idle, running, blocked and long-content states with and without the decorator, in light and dark.

## Validation

- Done: `apps/storybook/stories/skin-fixture.test.ts` proves the fixture's shape, in pull request #2.
- Done: `bun run test:stories` passes every story in default and reduced-motion Chromium, in pull request #2.

## Links

- Builds on: [0004](0004-dtcg-tokens-with-dark-extension.md)
- Related: [0008](0008-visual-regression-with-vitest-browser-screenshots.md), [0009](0009-icons-are-caller-provided.md)
