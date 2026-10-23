# kbui

kbui is the design system shared across our projects. Design tokens define every value, plain CSS defines every style, and a thin React layer built on [Base UI](https://base-ui.com) provides behavior. Each release attaches one tarball per package to a [GitHub Release](https://github.com/KhallilB/kbui/releases); nothing is published to a registry.

| Package | Contents | Docs |
|---|---|---|
| `@kbui/tokens` | Colors, spacing, type and component sizes, defined once in `tokens.json` | [packages/tokens](packages/tokens/README.md) |
| `@kbui/css` | All styling, one stylesheet per component | [packages/css](packages/css/README.md) |
| `@kbui/react` | 13 components for React 19, from `Button` to `Panel` and `Toolbar` | [packages/react](packages/react/README.md) |
| `apps/storybook` | Live component docs and accessibility tests | [apps/storybook](apps/storybook/README.md) |

## Using kbui in a project

Install `@kbui/react` and `@kbui/css` from the same release. Replace `0.1.0` with the version you want:

```bash
bun add https://github.com/KhallilB/kbui/releases/download/v0.1.0/kbui-react-0.1.0.tgz \
        https://github.com/KhallilB/kbui/releases/download/v0.1.0/kbui-css-0.1.0.tgz
```

```tsx
import "@kbui/css/styles.css";
import { Button } from "@kbui/react";

export const Save = () => <Button variant="primary">Save</Button>;
```

[Using kbui in a project](docs/guides/using-kbui.md) covers upgrading, installing by path while you work on kbui itself, theming and common errors.

## Versioning

All packages share one version. release-please reads the conventional commits on `main` and opens a release PR; merging it updates `CHANGELOG.md`, tags `v<version>` and uploads the tarballs. Before 1.0, a breaking change raises the minor version. Install the same version of every package. [Decision 0007](docs/decisions/0007-lockstep-github-tarball-releases.md) records why.

## Working on kbui

```bash
mise install && bun install
bun run storybook        # http://localhost:6006
bun run check            # build, lint, typecheck and unit tests
```

[CONTRIBUTING](CONTRIBUTING.md) lists every command, the checks CI runs and the conventions components follow.

## Direction

The next stage makes kbui the design judgment layer for generated UI: one contract that checks and fixes a screen the same way whether a person, a coding agent or a model inside a product wrote it. kbui will provide the component catalog, the rules every screen must pass, the fixes, and adapters to existing agent runtimes. It will not build a runtime of its own. None of this exists yet. The [product document](docs/product.md) describes every feature and differentiator, the [roadmap](docs/roadmap.md) orders them into milestones with pass marks, and decisions [0005](docs/decisions/0005-catalog-and-quality-layer-not-runtime.md) and [0006](docs/decisions/0006-canonical-tree-adapters-at-edge.md) record the reasoning. Progress is recorded in [`progress.json`](progress.json).

## Documentation

| Document | Covers |
|---|---|
| [Product](docs/product.md) | What kbui is for, every feature with its status, the differentiators and the non-goals |
| [Roadmap](docs/roadmap.md) | Milestones, pass marks and gates, recorded in `progress.json` |
| [Architecture](docs/architecture.md) | How the packages fit together and what the build checks |
| [Tokens](docs/tokens.md) | Token kinds, naming, aliases and dark mode |
| [Using kbui in a project](docs/guides/using-kbui.md) | Installing, theming, updating and troubleshooting |
| [Adding a component](docs/guides/adding-a-component.md) | The generator, styles, tests and stories |
| [Decision records](docs/decisions/README.md) | Why the larger choices were made |
| [Generative UI direction](docs/superpowers/specs/2026-10-22-generative-ui-direction.md) | The first generative UI direction, kept as the 2026-10-22 record |
| [Evidence report](docs/superpowers/specs/2026-10-22-generative-ui-evidence.md) | The research behind the differentiators, with sources |
| [Original design spec](docs/superpowers/specs/2026-10-16-kbui-design-system-design.md) | The 2026-10-16 design. Its registry plan was replaced by decisions [0003](docs/decisions/0003-local-path-installs.md) and [0007](docs/decisions/0007-lockstep-github-tarball-releases.md) |
| [Versioning design spec](docs/superpowers/specs/2026-10-22-kbui-versioning-design.md) | How releases are versioned, built and installed |

## License

[MIT](LICENSE)
