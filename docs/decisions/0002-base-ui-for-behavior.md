# 0002. Use Base UI for component behavior

## Status

Accepted on 2026-10-16. We haven't settled yet whether to keep Base UI long term or write our own primitives.

## Context

Dialogs, form fields and menus need focus trapping, keyboard handling, ARIA attributes and portals. Getting those right by hand is slow, and they break easily. We also wanted the behavior to come without any styling of its own, so kbui's CSS ([0001](0001-framework-free-css-contract.md)) stays in charge of how things look.

The risk is that a new Base UI release changes the attributes or API our CSS relies on.

## Decision

`@kbui/react` builds its components on `@base-ui/react`, pinned to exactly version 1.9.0. Our styles rely on the attributes Base UI sets: `data-open`, `data-disabled`, `data-invalid`, `data-starting-style` and `data-ending-style`. Base UI also lets `className` be a function, and we narrow it to a plain string.

## Options considered

- Base UI was accepted because it ships no styles, it's built for React 19, and it exposes state as `data-*` attributes that match how our CSS is written.
- Radix Primitives were rejected. Each primitive is a separate install, and several of its authors have since moved on to build Base UI.
- Writing our own behavior was ruled out for now. Focus traps, portals and ARIA wiring are more work than three components justify. We haven't closed this option off.

## Consequences

Every component depends on a library with its own release schedule, so upgrading means a deliberate version bump and a full test run.

Some of Base UI's defaults show through. For example, a `Button` rendered as a link is announced as a button unless you pass `role="link"`.

Projects using kbui also install Base UI from npm.

## Soundness boundary

The component tests run in jsdom and cover what we use: opening, closing, Escape, labels, descriptions and refs. They don't prove that focus management works in real browsers or with every screen reader. The Storybook accessibility scan only checks the rendered markup.

## Threat model

Leaning on Base UI keeps us from making our own accessibility mistakes in hand-written behavior. A Base UI release that changes attributes or its API is a different risk, and pinning the exact version is how we handle it.

## Non-goals

- Wrapping every Base UI component.
- Supporting Base UI's function form of `className`.

## Revisit if

- We decide to write our own primitives.
- A Base UI upgrade changes the `data-*` attributes our CSS depends on.
- We need a component that Base UI doesn't have.

## Adoption

`Button`, `Input` (through Base UI's `Field` and `Input`) and `Dialog` use it.

## Validation

- Done: `bun run --cwd packages/react test` passed all 28 tests at commit 2a5fd82, including opening and closing the dialog, Escape, and controlled state.
- Done: `bun run test:stories` passed all 16 stories with the accessibility scan in Chromium at the same commit.
- Still to do: a keyboard-only and screen-reader check in a real browser before the first product ships.

## Links

- [Design spec: Decisions](../superpowers/specs/2026-10-16-kbui-design-system-design.md#decisions)
- Related: [0001](0001-framework-free-css-contract.md)
