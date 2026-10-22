# 0004. Write tokens in the W3C format, with dark values in an extension

## Status

Accepted on 2026-10-16.

## Context

Today the tokens only need to become CSS, but later they might feed a Tailwind preset or a native app. A standard file format keeps those options open and means other tools can read it. The catch is that the W3C Design Tokens format has no idea of themes, and kbui needs light and dark.

We're assuming the format stays stable. If it adds its own theming and that clashes with `kb.dark`, we'll have to migrate.

## Decision

`packages/tokens/tokens.json` is the only place tokens are defined, and it follows the W3C Design Tokens format. Each semantic color keeps its light value in `$value` and its dark value in `$extensions["kb.dark"]`. Palette, scale and component tokens don't have dark values.

The build writes a `:root` block, a `[data-theme="dark"]` block and a `prefers-color-scheme` fallback. It fails on an alias that points nowhere, two tokens with the same name, a key with odd characters, or a value that isn't a string. Those checks live in `packages/tokens/src/build.test.ts`.

## Options considered

- We accepted the W3C format with dark values in `$extensions`: one standard file, with each dark value right next to its light one.
- A separate `tokens.dark.json` was rejected. Two files would have to stay in step, and it's easy to forget one.
- Style Dictionary with its own theme setup was ruled out as too heavy for a single output. Our build is about a hundred lines.
- Hand-written CSS variables were rejected. We'd lose the typed names, the alias checks and any chance of a second output.

## Consequences

The `kb.dark` extension is our own invention, so other W3C tools will ignore the dark values.

The build script is code we maintain ourselves rather than a library.

This shape only fits two themes. A third theme such as high contrast, or a separate look per product, would need a different structure.

## Soundness boundary

The tests check structure and alias resolution. They don't check color contrast between tokens, or whether the dark values look right.

## Threat model

The checks catch broken aliases and silent name collisions. Poor color choices get through.

## Non-goals

- More than two themes.
- Outputs other than CSS and a TypeScript list of names.

## Revisit if

- We need a third theme or a separate look per product.
- The W3C format adds its own way of handling themes.

## Adoption

Every token in `tokens.json` follows this format, and `@kbui/css` uses the output.

## Validation

- Done: `bun test --cwd packages/tokens` passed all 12 tests at commit 2a5fd82, including a snapshot of the three CSS blocks.
- Still to do: an automatic contrast check across the text and background color pairs.

## Links

- [Tokens](../tokens.md)
- [Design spec: Token model](../superpowers/specs/2026-10-16-kbui-design-system-design.md#token-model)
