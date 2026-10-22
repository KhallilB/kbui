# @kbui/tokens

This package is where every kbui value is defined. You edit `tokens.json`, and the build produces the CSS variables plus a typed list of their names.

Most projects never import it directly, because `@kbui/css/styles.css` already includes the CSS it generates. You only need it for the typed names, or to load the variables on their own.

```ts
import { tokens } from "@kbui/tokens";

tokens.color.accent; // "--kb-color-accent"
```

## What it exports

| Import | File | What you get |
|---|---|---|
| `@kbui/tokens/tokens.css` | `dist/tokens.css` | The variables: light values on `:root`, dark ones under `[data-theme="dark"]`, and a fallback for the system setting |
| `@kbui/tokens` | `dist/tokens.js`, `dist/tokens.d.ts` | `tokens`, a nested read-only object of variable names |
| `@kbui/tokens/tokens.json` | `tokens.json` | The source file |

## Building and testing

```bash
bun run --cwd packages/tokens build
bun run --cwd packages/tokens test
```

The build refuses a token file with mistakes in it. An alias like `{blue.600}` has to point at a real token, two paths can't produce the same variable name, keys can only use letters, digits, `_` and `-`, and every `$value` has to be a string.

[docs/tokens.md](../../docs/tokens.md) explains the token kinds, naming and dark mode in more detail.
