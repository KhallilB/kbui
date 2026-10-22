# kbui

kbui is a shared design system for the projects on this machine. Its look lives in framework-free CSS driven by design tokens; a thin React layer on [Base UI](https://base-ui.com) adds behavior. Projects consume it straight from this checkout. Nothing is published.

| Package | What it holds | Docs |
|---|---|---|
| `@kbui/tokens` | `tokens.json` source; builds `tokens.css` and a typed `tokens` object | [packages/tokens](packages/tokens/README.md) |
| `@kbui/css` | All visual design: reset plus one stylesheet per component, bundled into `styles.css` | [packages/css](packages/css/README.md) |
| `@kbui/react` | React 19 components: `Button`, `Input`, `Dialog` | [packages/react](packages/react/README.md) |
| `apps/storybook` | Live component docs, accessibility checks and story tests | [apps/storybook](apps/storybook/README.md) |

## Quick start

Use kbui in another project:

```bash
cd ~/proj/kbui && bun run build
cd ~/proj/<your-app> && bun add ../kbui/packages/react ../kbui/packages/css
```

```tsx
import "@kbui/css/styles.css";
import { Button } from "@kbui/react";

export const Save = () => <Button variant="primary">Save</Button>;
```

The full setup, theming and update loop are in [Using kbui in a project](docs/guides/using-kbui.md).

Work on kbui itself:

```bash
mise install && bun install
bun run storybook        # http://localhost:6006
bun run check            # build, lint, typecheck, unit tests
```

## Documentation

- [Architecture](docs/architecture.md): the three layers and the anatomy contract that joins them.
- [Tokens](docs/tokens.md): tiers, naming, dark mode and how to add a token.
- [Using kbui in a project](docs/guides/using-kbui.md): install, theme, update, troubleshoot.
- [Adding a component](docs/guides/adding-a-component.md): generator, CSS rules, tests and stories.
- [Contributing](CONTRIBUTING.md): checks, conventions and commit rules.
- [Decision records](docs/decisions/README.md): why kbui is built this way.
- [Design spec](docs/superpowers/specs/2026-10-16-kbui-design-system-design.md): the original design.

## License

[MIT](LICENSE)
