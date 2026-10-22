# 0004. Tokens use the W3C format, with dark values in an extension

## Status

Accepted, 2026-10-16.

## Context

Tokens must reach CSS today and possibly other targets later (a Tailwind preset, native apps). A standard source format keeps that door open and lets other tools read the file. The W3C Design Tokens format has no concept of themes, yet kbui needs light and dark. The premise that could fail: that the format stays stable enough, or adds its own theming that conflicts with kbui's extension.

## Decision

`packages/tokens/tokens.json` is the single source, in W3C Design Tokens format. A semantic color carries its light value in `$value` and its dark value in `$extensions["kb.dark"]`; primitives and component tokens have no dark value. The build emits `:root`, `[data-theme="dark"]` and a `prefers-color-scheme` fallback, and fails on unknown aliases, colliding names, invalid keys or non-string values (`packages/tokens/src/build.test.ts`).

## Options considered

| Option | Verdict |
|---|---|
| W3C format, dark value in `$extensions` | Chosen: standard file, one entry per token, dark sits next to light |
| Separate `tokens.dark.json` | Rejected: two files to keep in step and easy to forget |
| Style Dictionary with its own theme setup | Rejected: a heavy tool for one output; the custom build is about 100 lines |
| Hand-written CSS variables | Rejected: no typed names, no alias checking, no second target |

## Consequences

- The `kb.dark` extension is kbui's own; other W3C tools will ignore dark values.
- The build script is kbui code to maintain, not a library.
- Only two themes fit this shape. More (high contrast, per-product voices) would need a different structure.

## Soundness boundary

The tests check structure and alias resolution. They do not check color contrast between token pairs, or that dark values look right.

## Threat model

Guards against broken aliases and silent name collisions. Does not guard against poor color choices.

## Non-goals

- More than light and dark.
- Outputs other than CSS and a TypeScript name map.

## Revisit if

- A third theme or per-product voice is needed.
- The W3C format adds a theming mechanism.

## Adoption

All tokens in `tokens.json` follow it; `@kbui/css` consumes the output.

## Validation

- Executed: `bun test --cwd packages/tokens` passes 12 tests, including a snapshot of the three-block CSS, on commit 2a5fd82.
- Planned: an automated contrast check across semantic text and background pairs.

## Links

- [Tokens](../tokens.md)
- [Design spec: Token model](../superpowers/specs/2026-10-16-kbui-design-system-design.md#token-model)
