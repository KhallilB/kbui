# kbui

kbui is a React component library with shared design tokens and plain CSS. Use the default light and dark themes, or adjust the tokens to fit your app. Components combine native controls with [Base UI](https://base-ui.com) for interaction. Each release attaches one tarball per package to a [GitHub Release](https://github.com/KhallilB/kbui/releases); nothing is published to a registry.

| Package | Contents | Docs |
|---|---|---|
| `@kbui/tokens` | Colors, spacing, type and component sizes, defined once in `tokens.json` | [packages/tokens](packages/tokens/README.md) |
| `@kbui/css` | All styling, one stylesheet per component | [packages/css](packages/css/README.md) |
| `@kbui/react` | React 19+ components for forms, feedback, and layout | [packages/react](packages/react/README.md) |
| `apps/storybook` | Live component docs and accessibility tests | [apps/storybook](apps/storybook/README.md) |

## Using kbui in a project

Install `@kbui/react` from a release; it includes styles and CSS tokens. Your app needs React and React DOM 19 or later. The commands below use Bash (Git Bash or WSL on Windows); the [Get Started page](https://kbui.kcb.pro/setup/) also generates complete commands for npm, Bun, pnpm and Yarn.

<!-- x-release-please-start-version -->
```bash
KBUI_VERSION=0.8.0
bun add "https://github.com/KhallilB/kbui/releases/download/v${KBUI_VERSION}/kbui-react-${KBUI_VERSION}.tgz"
```
<!-- x-release-please-end -->

```tsx
import "@kbui/react/styles.css";
import { Button } from "@kbui/react";

export const Save = () => <Button variant="primary">Save</Button>;
```

[Using kbui in a project](docs/guides/using-kbui.md) covers upgrading, installing by path while you work on kbui itself, theming and common errors.

## Versioning

All packages share one version. release-please reads the conventional commits on `main` and opens a release PR; merging it updates `CHANGELOG.md`, tags `v<version>` and uploads the tarballs. Before 1.0, a breaking change raises the minor version. Install the same version of every package. Release PRs also update the marked installation examples in this README, the usage guide and Storybook introduction. The site derives its install commands from the root package version; checks reject stale managed documentation.

## Working on kbui

```bash
mise install && bun install
bun run storybook        # http://localhost:6006
bun run check            # build, lint, types, examples, unit and package checks
```

[CONTRIBUTING](CONTRIBUTING.md) lists every command, the checks CI runs and the conventions components follow.

## Documentation

| Document | Covers |
|---|---|
| [Maintained features](docs/features.md) | Implementation, canonical docs, examples and current limits |
| [Tokens](docs/tokens.md) | Token kinds, naming, aliases and dark mode |
| [Using kbui in a project](docs/guides/using-kbui.md) | Installing, theming, updating and troubleshooting |
| [Restyling kbui](docs/guides/restyling.md) | Style components with your own classes or Tailwind; tokens for app-wide changes |
| [Adding a component](docs/guides/adding-a-component.md) | The generator, styles, tests and stories |
| [Forms and overlays](docs/guides/forms-and-overlays.md) | Theme hosts for popups, structured dialogs, surface tokens and accessibility checks |

## License

[MIT](LICENSE)
