# kbui

kbui is the design system shared across our projects. Design tokens define every value, plain CSS defines every style, and a thin React layer built on [Base UI](https://base-ui.com) provides behavior. Projects install kbui from this folder by path; nothing is published to a registry.

| Package | Contents | Docs |
|---|---|---|
| `@kbui/tokens` | Colors, spacing, type and component sizes, defined once in `tokens.json` | [packages/tokens](packages/tokens/README.md) |
| `@kbui/css` | All styling, one stylesheet per component | [packages/css](packages/css/README.md) |
| `@kbui/react` | `Button`, `Input` and `Dialog` for React 19 | [packages/react](packages/react/README.md) |
| `apps/storybook` | Live component docs and accessibility tests | [apps/storybook](apps/storybook/README.md) |

## Using kbui in a project

Build kbui, then add the packages by path from the project folder:

```bash
cd ~/proj/kbui && bun run build
cd ~/proj/<your-app> && bun add ../kbui/packages/react ../kbui/packages/css
```

```tsx
import "@kbui/css/styles.css";
import { Button } from "@kbui/react";

export const Save = () => <Button variant="primary">Save</Button>;
```

[Using kbui in a project](docs/guides/using-kbui.md) covers theming, picking up changes and common errors.

## Working on kbui

```bash
mise install && bun install
bun run storybook        # http://localhost:6006
bun run check            # build, lint, typecheck and unit tests
```

[CONTRIBUTING](CONTRIBUTING.md) lists every command, the checks CI runs and the conventions components follow.

## Direction

The next stage makes kbui screens composable in plain language, both by developers asking an agent for code and by end users asking an app for a view. kbui will provide the component catalog, the design rules every screen must pass, and adapters to existing agent runtimes. It will not build a runtime of its own. None of this exists yet. The [generative UI direction](docs/superpowers/specs/2026-10-22-generative-ui-direction.md) sets out the plan, and decisions [0005](docs/decisions/0005-catalog-and-quality-layer-not-runtime.md) and [0006](docs/decisions/0006-canonical-tree-adapters-at-edge.md) record the reasoning.

## Documentation

| Document | Covers |
|---|---|
| [Architecture](docs/architecture.md) | How the packages fit together and what the build checks |
| [Tokens](docs/tokens.md) | Token kinds, naming, aliases and dark mode |
| [Using kbui in a project](docs/guides/using-kbui.md) | Installing, theming, updating and troubleshooting |
| [Adding a component](docs/guides/adding-a-component.md) | The generator, styles, tests and stories |
| [Decision records](docs/decisions/README.md) | Why the larger choices were made |
| [Generative UI direction](docs/superpowers/specs/2026-10-22-generative-ui-direction.md) | Plan, field survey and roadmap for composing kbui in plain language |
| [Original design spec](docs/superpowers/specs/2026-10-16-kbui-design-system-design.md) | The 2026-10-16 design. Its registry plan was replaced by [decision 0003](docs/decisions/0003-local-path-installs.md) |

## License

[MIT](LICENSE)
