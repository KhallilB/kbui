# 0004. Write tokens in the W3C format, with dark values in an extension

## Status

Accepted on 2026-10-16.

## Context

Today the tokens only need to become CSS, but later they may feed a Tailwind preset or a native app. A standard file format keeps those options open and lets other tools read the file. However, the W3C Design Tokens format has no concept of themes, and kbui needs light and dark.

This assumes the format stays stable. If it adds its own theming and that conflicts with `kb.dark`, we will have to migrate.

## Decision

`packages/tokens/tokens.json` is the only place tokens are defined, and it follows the W3C Design Tokens format. Each semantic color stores its light value in `$value` and its dark value in `$extensions["kb.dark"]`. Palette, scale and component tokens have no dark values.

The build writes a `:root` block, a `[data-theme="dark"]` block and a `prefers-color-scheme` fallback. It fails on an alias that resolves to nothing, two tokens with the same name, a key with invalid characters, or a value that is not a string. Those checks live in `packages/tokens/src/build.test.ts`.

## Options considered

- W3C format with dark values in `$extensions`: accepted. One standard file, with each dark value next to its light value.
- A separate `tokens.dark.json`: rejected. Two files would have to stay in step, and one is easily forgotten.
- Style Dictionary with its own theme configuration: rejected as too heavy for a single output. Our build is about a hundred lines.
- Hand-written CSS variables: rejected. They lose the typed names, the alias checks and the option of a second output.

## Consequences

The `kb.dark` extension is our own, so other W3C tools ignore the dark values.

The build script is code we maintain rather than a library.

The structure supports exactly two themes. A third theme, such as high contrast, or a separate look per product would need a different structure.

## Soundness boundary

The tests check structure and alias resolution. They do not check color contrast between tokens or whether the dark values look right.

## Threat model

The checks catch broken aliases and silent name collisions. Poor color choices are not caught.

## Non-goals

- More than two themes.
- Outputs other than CSS and a TypeScript object of names.

## Revisit if

- We need a third theme or a separate look per product.
- The W3C format adds its own theming mechanism.

## Adoption

Every token in `tokens.json` follows this format, and `@kbui/css` consumes the output.

## Validation

- Done: `bun test --cwd packages/tokens` passed all 12 tests at commit 2a5fd82, including a snapshot of the three CSS blocks.
- Still to do: an automated contrast check across text and background color pairs.

## Links

- [Tokens](../tokens.md)
- [Design spec: Token model](../superpowers/specs/2026-10-16-kbui-design-system-design.md#token-model)
