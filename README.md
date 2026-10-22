# kbui

kbui is the design system we share across our projects. The look is plain CSS built from design tokens, and a small React layer on top of [Base UI](https://base-ui.com) handles behavior. Other projects use it directly from this folder; nothing gets published.

It's split into three packages and a Storybook app:

| Package | What's in it | Docs |
|---|---|---|
| `@kbui/tokens` | Colors, spacing, type and sizes, defined once in `tokens.json` | [packages/tokens](packages/tokens/README.md) |
| `@kbui/css` | Every style, as one stylesheet per component | [packages/css](packages/css/README.md) |
| `@kbui/react` | `Button`, `Input` and `Dialog` for React 19 | [packages/react](packages/react/README.md) |
| `apps/storybook` | Live examples and the accessibility checks | [apps/storybook](apps/storybook/README.md) |

## Where it's heading

We want kbui screens to be composable in plain language, by developers asking an agent for code and by end users asking an app for a view. kbui will supply the catalog, the design rules and adapters for the agent runtimes that do the generating, and won't build a runtime of its own. None of this is built yet. The [generative UI direction](docs/superpowers/specs/2026-10-22-generative-ui-direction.md) has the plan, and decisions [0005](docs/decisions/0005-catalog-and-quality-layer-not-runtime.md) and [0006](docs/decisions/0006-canonical-tree-adapters-at-edge.md) explain why.

## Getting started

To use kbui in another project, build it here and add it by path from that project:

```bash
cd ~/proj/kbui && bun run build
cd ~/proj/<your-app> && bun add ../kbui/packages/react ../kbui/packages/css
```

```tsx
import "@kbui/css/styles.css";
import { Button } from "@kbui/react";

export const Save = () => <Button variant="primary">Save</Button>;
```

[Using kbui in a project](docs/guides/using-kbui.md) covers theming, updates and the errors you're likely to hit.

To work on kbui itself:

```bash
mise install && bun install
bun run storybook        # http://localhost:6006
bun run check            # build, lint, typecheck and unit tests
```

## Further reading

- [Architecture](docs/architecture.md) explains how the three packages fit together.
- [Tokens](docs/tokens.md) covers naming, dark mode and adding new values.
- [Adding a component](docs/guides/adding-a-component.md) walks through the generator, styles, tests and stories.
- [Contributing](CONTRIBUTING.md) lists the checks and conventions we follow.
- [Decision records](docs/decisions/README.md) explain why things are built the way they are.
- The [generative UI direction](docs/superpowers/specs/2026-10-22-generative-ui-direction.md) covers the plan for composing kbui in plain language, how it compares with other projects, and the roadmap.
- The [original design spec](docs/superpowers/specs/2026-10-16-kbui-design-system-design.md) has the full background. Its registry plan was later dropped; see [decision 0003](docs/decisions/0003-local-path-installs.md).

## License

[MIT](LICENSE)
