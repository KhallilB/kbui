# @kbui/tokens

Defines every kbui value. You edit `tokens.json`; the build produces the CSS variables and a typed object of their names.

Most projects do not import this package directly, because `@kbui/css/styles.css` already includes the generated CSS. Install it when you need the typed names, or the variables without the rest of the stylesheet.

```ts
import { tokens } from "@kbui/tokens";

tokens.color.accent; // "--kb-color-accent"
```

## Exports

| Import | File | Contents |
|---|---|---|
| `@kbui/tokens/tokens.css` | `dist/tokens.css` | The variables: light values on `:root`, dark values under `[data-theme="dark"]`, and a system-setting fallback |
| `@kbui/tokens` | `dist/tokens.js`, `dist/tokens.d.ts` | `tokens`, a nested read-only object of variable names |
| `@kbui/tokens/tokens.json` | `tokens.json` | The source file |

## Build and test

```bash
bun run --cwd packages/tokens build
bun run --cwd packages/tokens test
```

The build rejects a token file that:

- contains an alias, such as `{blue.600}`, pointing at a token that does not exist
- has two paths that produce the same variable name
- uses a key with characters other than letters, digits, `_` and `-`
- has a `$value` that is not a string

[docs/tokens.md](../../docs/tokens.md) explains token kinds, naming and dark mode.
