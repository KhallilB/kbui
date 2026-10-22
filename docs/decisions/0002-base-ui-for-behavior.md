# 0002. Use Base UI for component behavior

## Status

Accepted on 2026-10-16. Whether to keep Base UI long term or write our own primitives is still open.

## Context

Dialogs, form fields and menus need focus trapping, keyboard handling, ARIA attributes and portals. Implementing these by hand is slow and error-prone. The behavior layer must also ship without styling, so that kbui's CSS ([0001](0001-framework-free-css-contract.md)) controls appearance.

The risk is that a Base UI release changes the attributes or API that our CSS depends on.

## Decision

`@kbui/react` builds its components on `@base-ui/react`, pinned to exactly version 1.9.0. Our styles depend on the attributes Base UI sets: `data-open`, `data-disabled`, `data-invalid`, `data-starting-style` and `data-ending-style`. Base UI allows `className` to be a function; we narrow it to a plain string.

## Options considered

- Base UI: accepted. It ships no styles, targets React 19, and exposes state as `data-*` attributes that match how our CSS is written.
- Radix Primitives: rejected. Each primitive is a separate install, and several of its authors now build Base UI.
- Writing our own behavior: deferred. Focus traps, portals and ARIA wiring are more work than three components justify. The option remains open.

## Consequences

Every component depends on a library with its own release schedule. An upgrade is a deliberate version bump followed by a full test run.

Some Base UI defaults are visible. For example, a `Button` rendered as a link is announced as a button unless it has `role="link"`.

Projects that use kbui also install Base UI from npm.

## Soundness boundary

The component tests run in jsdom and cover the behavior we use: opening, closing, Escape, labels, descriptions and refs. They do not prove that focus management works in real browsers or with every screen reader. The Storybook accessibility scan checks only the rendered markup.

## Threat model

Relying on Base UI avoids accessibility mistakes in hand-written behavior. A Base UI release that changes attributes or its API is a separate risk, handled by pinning the exact version.

## Non-goals

- Wrapping every Base UI component.
- Supporting Base UI's function form of `className`.

## Revisit if

- We decide to write our own primitives.
- A Base UI upgrade changes the `data-*` attributes our CSS depends on.
- We need a component that Base UI does not provide.

## Adoption

`Button`, `Input` (through Base UI's `Field` and `Input`) and `Dialog` use it.

## Validation

- Done: `bun run --cwd packages/react test` passed all 28 tests at commit 2a5fd82, including opening and closing the dialog, Escape, and controlled state.
- Done: `bun run test:stories` passed all 16 stories with the accessibility scan in Chromium at the same commit.
- Still to do: a keyboard-only and screen-reader check in a real browser before the first product ships.

## Links

- [Design spec: Decisions](../superpowers/specs/2026-10-16-kbui-design-system-design.md#decisions)
- Related: [0001](0001-framework-free-css-contract.md)
