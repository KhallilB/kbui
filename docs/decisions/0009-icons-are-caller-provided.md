# 0009. Icons are caller-provided nodes

## Status

Accepted on 2026-10-22.

## Context

`Status` shows state as text plus an icon, never as color alone. That raised the question of where the icon comes from. An icon set is a dependency with its own license, size and visual opinion, and each consumer already has one or will pick one.

kbui must also stay domain-neutral. An icon for "running" or "blocked" is a product decision that belongs to the consumer.

## Decision

kbui ships no icons and depends on no icon library. A component that shows an icon takes it as a `ReactNode` prop (`icon` on `Status`) and renders it inside a decorative slot (`.kb-status-icon`, `aria-hidden="true"`). The slot sizes the node to `1em` and colors it through `currentColor`, so any inline SVG or icon component fits.

Because the slot is decorative, the visible text carries the meaning. A component may not hide its text to show only an icon; `Status` requires `children`.

## Options considered

- Caller-provided nodes: accepted. No dependency, no license, no opinion about the icon style, and consumers reuse the set they already have.
- Bundle a small set such as Lucide: rejected. It would fix one style for every consumer and add a dependency whose updates we would track.
- A named icon prop (`icon="check"`) resolved through a registry the consumer fills: rejected for now. It is more machinery than one consumer needs. Revisit if generated UI (0005) needs icons named as strings.

## Consequences

Stories and the showcase define their own sample icons as inline SVG. Each consumer wires its icon set itself.

Nothing in kbui enforces that two consumers use the same icon for the same state.

## Soundness boundary

Tests prove that the slot is decorative and that text is always rendered. They do not check that the node passed in is a sensible icon.

## Threat model

Guards against color-only or icon-only status and against an icon dependency in a shared package. Does not guard against a consumer passing an icon that contradicts its text.

## Non-goals

- An icon component or icon tokens.
- Icon-only buttons; those will need a separate accessible-name rule when they arrive.

## Revisit if

- Generated UI needs icons addressable by name.
- Three consumers duplicate the same icon wiring.

## Adoption

`Status` follows this record. The `Panel` rail is a colored plane, not an icon, so it is unaffected.

## Validation

- Done: `packages/react/src/components/Status/Status.test.tsx` checks that the icon slot is `aria-hidden`, that it is absent without an icon, and that every tone renders its text, in pull request #2.

## Links

- Related: [0008](0008-visual-regression-with-vitest-browser-screenshots.md), [0010](0010-dark-product-skin-light-validated.md)
