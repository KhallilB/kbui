# 0002. Component behavior comes from Base UI

## Status

Accepted, 2026-10-16. Under review: the owner has an open question on keeping Base UI versus hand-writing primitives.

## Context

Dialogs, fields and menus need focus trapping, keyboard handling, ARIA wiring and portals. Getting these right by hand is slow and easy to break. kbui wants behavior that is unstyled, so its own CSS ([0001](0001-framework-free-css-contract.md)) stays in charge of the look. The premise that could fail: that Base UI's attributes and API stay compatible with kbui's contract across releases.

## Decision

`@kbui/react` builds components on `@base-ui/react`, pinned to an exact version (1.9.0). kbui relies on the `data-open`, `data-disabled`, `data-invalid`, `data-starting-style` and `data-ending-style` attributes Base UI emits, and narrows Base UI's `className` (string or function) to a string.

## Options considered

| Option | Verdict |
|---|---|
| Base UI | Chosen: headless, React 19 native, emits state as `data-*` attributes that match the CSS contract |
| Radix Primitives | Rejected: per-package installs, and several of its authors now build Base UI |
| Hand-written behavior | Rejected for now: focus traps, portals and ARIA wiring cost more than three components justify; this is the option under review |

## Consequences

- An external dependency with its own release cadence sits under every component. Upgrades need a deliberate bump and the full test run.
- Some Base UI defaults leak through: an anchor rendered by `Button` is announced as a button unless the caller passes `role="link"`.
- Consumers install Base UI from npm, which brings one more dependency into their tree.

## Soundness boundary

Component tests in jsdom cover the behavior kbui exercises: opening, closing, Escape, labelling, descriptions, refs. They do not prove Base UI's focus management in real browsers or with every assistive technology; the Storybook axe run covers static accessibility only.

## Threat model

Guards against accessibility regressions in hand-rolled behavior. Does not guard against a Base UI release changing attributes or API; the exact pin is the defense.

## Non-goals

- Wrapping every Base UI component.
- Supporting Base UI's function-form `className`.

## Revisit if

- The owner decides to hand-write primitives.
- A Base UI upgrade changes the `data-*` attributes kbui's CSS keys on.
- A needed component is missing from Base UI.

## Adoption

`Button`, `Input` (Base UI `Field` and `Input`) and `Dialog` use it.

## Validation

- Executed: `bun run --cwd packages/react test` passes 28 tests on commit 2a5fd82, including dialog open, close, Escape and controlled-state cases.
- Executed: `bun run test:stories` passes 16 stories with axe in Chromium on the same commit.
- Planned: a keyboard-only and screen-reader pass in a real browser before the first product ships.

## Links

- [Design spec: Decisions](../superpowers/specs/2026-10-16-kbui-design-system-design.md#decisions)
- Related: [0001](0001-framework-free-css-contract.md)
