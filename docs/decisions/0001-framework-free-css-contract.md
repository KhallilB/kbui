# 0001. Styling lives in framework-free CSS behind an anatomy contract

## Status

Accepted, 2026-10-16, when the owner approved the design spec.

## Context

kbui serves several React projects today and may serve a non-React one later. Styling written inside a React package (CSS Modules, CSS-in-JS, Tailwind classes in JSX) would have to be rewritten for any other framework. The premise that could fail: that a second framework will ever matter. If every consumer stays React, the split costs a little indirection for no return.

## Decision

All visual rules live in `@kbui/css` as plain CSS keyed on one `kb-<name>` root class per component, `kb-<name>-<part>` parts, and `data-*` attributes for variants and states. Each stylesheet's first line is an `Anatomy:` comment that names exactly these, and framework packages only render that markup. Enforced by `packages/css/src/build.test.ts`, which fails on a missing anatomy line or a root class never used as a selector. `@kbui/react` imports no CSS.

## Options considered

| Option | Verdict |
|---|---|
| Plain CSS, `kb-` classes, `data-*` attributes | Chosen: no runtime, any framework can render it, works beside a consumer's Tailwind |
| CSS Modules inside `@kbui/react` | Rejected: class names are bound to the JS bundler, so a second framework would restyle from scratch |
| Tailwind with class variants | Rejected: every consumer would need Tailwind and kbui's content paths in its config |
| CSS-in-JS | Rejected: runtime cost and React coupling |

## Consequences

- Every component is two files to keep in step: the stylesheet and the adapter. The anatomy line is the only link, and it is a comment.
- Consumers must import `@kbui/css/styles.css` themselves; forgetting it renders unstyled components.
- Flat specificity means a consumer override needs the same attribute selector or a later-loaded rule.

## Soundness boundary

The test checks that the anatomy line exists and its root class is styled. It does not check that every listed part or attribute is styled, or that the React component emits them. Those are covered only by each component's own tests.

## Threat model

Guards against drift between layers and against styling that only one framework can use. Does not guard against a consumer overriding kbui variables or classes in its own CSS.

## Non-goals

- Shipping a non-React adapter now.
- Scoping or encapsulating styles (no shadow DOM).

## Revisit if

- A consumer needs kbui inside a shadow root or an iframe where global CSS cannot reach.
- Keeping the anatomy line and the React output in step causes repeated bugs.

## Adoption

All three components (`Button`, `Input`, `Dialog`) follow it. The generator template writes the anatomy line first.

## Validation

- Executed: `bun test --cwd packages/css` passes the anatomy and palette tests on commit 2a5fd82.
- Executed: negative fixtures for a missing anatomy line and a root class absent from selectors are part of that suite (added in commit 3a289d6) and are rejected as expected.

## Links

- [Design spec: Anatomy contract](../superpowers/specs/2026-10-16-kbui-design-system-design.md#anatomy-contract)
- [Architecture](../architecture.md)
- Related: [0002](0002-base-ui-for-behavior.md)
