# 0001. Keep styling in plain CSS, tied to components by an anatomy comment

## Status

Accepted on 2026-10-16, when the design spec was approved.

## Context

kbui serves several React projects today and may later need to serve a project that does not use React. If styles lived inside the React package, as CSS Modules, CSS-in-JS or Tailwind classes, a second framework would require restyling every component.

The benefit depends on a second framework arriving. If every project stays on React, this adds a small amount of indirection for no gain.

## Decision

All visual styling lives in `@kbui/css` as plain CSS. Each component has one root class, `kb-<name>`; its parts are `kb-<name>-<part>`; variants and states are `data-*` attributes. The first line of each stylesheet is an `Anatomy:` comment that lists exactly those names. The React package renders that markup and imports no CSS.

A test in `packages/css/src/build.test.ts` fails if a stylesheet lacks its anatomy line or never styles the root class it names.

## Options considered

- Plain CSS with `kb-` classes and `data-*` attributes: accepted. It has no runtime cost, any framework can render it, and it works alongside a project's own Tailwind.
- CSS Modules inside `@kbui/react`: rejected. The JavaScript bundler generates the class names, so another framework would have to start over.
- Tailwind with class variants: rejected. Every consuming project would need Tailwind, configured to scan kbui's files.
- CSS-in-JS: rejected for its runtime cost and its dependency on React.

## Consequences

Each component consists of two files that must agree, the stylesheet and the React component, and only a comment links them.

Projects must import `@kbui/css/styles.css` themselves. Without it, components render unstyled.

Specificity is kept flat, so overriding a style requires either a more specific selector or an equally specific one that loads later.

## Soundness boundary

The test checks that the anatomy line exists and that its root class is styled. It does not check that every part and attribute in the line is styled, or that the React component renders them. Each component's own tests are the only coverage for that.

## Threat model

This protects against the layers drifting apart and against styles that only one framework can use. It does not prevent a project from overriding kbui's variables or classes in its own CSS.

## Non-goals

- Building a non-React adapter now.
- Isolating styles with shadow DOM or similar techniques.

## Revisit if

- A project needs kbui inside a shadow root or an iframe that global CSS cannot reach.
- Keeping the anatomy line and the React output in step repeatedly causes bugs.

## Adoption

`Button`, `Input` and `Dialog` follow it, and the component generator writes the anatomy line first.

## Validation

- Done: `bun test --cwd packages/css` passed the anatomy and palette tests at commit 2a5fd82.
- Done: the same suite rejects a stylesheet with a missing anatomy line and one with an unstyled root class, both cases added in commit 3a289d6.

## Links

- [Design spec: Anatomy contract](../superpowers/specs/2026-10-16-kbui-design-system-design.md#anatomy-contract)
- [Architecture](../architecture.md)
- Related: [0002](0002-base-ui-for-behavior.md)
