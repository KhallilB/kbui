# @kbui/tokens

The single source of every kbui value. `tokens.json` is written in the W3C Design Tokens format; the build turns it into CSS custom properties and a typed object of their names.

## Outputs

| Import | File | Contents |
|---|---|---|
| `@kbui/tokens/tokens.css` | `dist/tokens.css` | `:root` light values, `[data-theme="dark"]` overrides, a `prefers-color-scheme` fallback |
| `@kbui/tokens` | `dist/tokens.js`, `dist/tokens.d.ts` | `tokens`, a nested readonly object of variable names |
| `@kbui/tokens/tokens.json` | `tokens.json` | The source |

Most consumers never import this package: `@kbui/css/styles.css` already bundles `tokens.css`.

```ts
import { tokens } from "@kbui/tokens";

tokens.color.accent; // "--kb-color-accent"
```

## Commands

```bash
bun run --cwd packages/tokens build   # writes dist/
bun run --cwd packages/tokens test    # alias, collision and key checks
```

## Rules the build enforces

- An alias such as `{blue.600}` must point at an existing token.
- Two paths may not produce the same variable name.
- Keys use only letters, digits, `_` and `-`.
- `$value` must be a string.

Tiers, naming and dark mode are explained in [docs/tokens.md](../../docs/tokens.md).
