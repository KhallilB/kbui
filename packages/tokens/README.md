# @kb.ui/tokens

Shared colors, spacing, typography, and component values for kbui. Edit `tokens.json` to generate CSS variables and a typed object of their names.

Current source defaults use monochrome light/dark surfaces with a persimmon accent and shared tactile materials. Locally built packages include this refresh; published v0.7.0 tarballs keep their original appearance.

Most projects do not import this package directly, because `@kb.ui/react/styles.css` and `@kb.ui/css/styles.css` already include the generated CSS. Install it when you need the typed names, or the variables without the rest of the stylesheet.

```ts
import { tokens } from "@kb.ui/tokens";

tokens.color.accent; // "--kb-color-accent"
```

Install the optional `@kb.ui/tokens` package at the same version as your other kbui packages; [Get Started](https://kbui.kcb.pro/setup/?tokens=1) generates the command. Wrap names in `var()` when using them as styles, for example ``color: `var(${tokens.color.accent})` ``. Importing the object does not load CSS.

## Exports

| Import | File | Contents |
|---|---|---|
| `@kb.ui/tokens/tokens.css` | `dist/tokens.css` | All variables on `:root`; theme-dependent variables rebound on `[data-theme="light"]` and `[data-theme="dark"]`, plus a system-setting fallback and system-color overrides for tokens with a `kb.forced` value under `forced-colors: active` |
| `@kb.ui/tokens` | `dist/tokens.js`, `dist/tokens.d.ts` | `tokens`, a nested read-only object of variable names |
| `@kb.ui/tokens/tokens.json` | `tokens.json` | The source file |

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
