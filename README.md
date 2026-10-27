# kbui

kbui is a React component library with shared design tokens and plain CSS. Use the default light and dark themes, or adjust the tokens to fit your app. Components use [Base UI](https://base-ui.com) for interaction. Each release attaches one tarball per package to a [GitHub Release](https://github.com/KhallilB/kbui/releases); nothing is published to a registry.

| Package | Contents | Docs |
|---|---|---|
| `@kbui/tokens` | Colors, spacing, type and component sizes, defined once in `tokens.json` | [packages/tokens](packages/tokens/README.md) |
| `@kbui/css` | All styling, one stylesheet per component | [packages/css](packages/css/README.md) |
| `@kbui/react` | 21 components for React 19, including forms, feedback, and layout | [packages/react](packages/react/README.md) |
| `apps/storybook` | Live component docs and accessibility tests | [apps/storybook](apps/storybook/README.md) |

## Using kbui in a project

Install `@kbui/react` and `@kbui/css` from the same release. Replace `0.6.0` with the version you want:

```bash
bun add https://github.com/KhallilB/kbui/releases/download/v0.6.0/kbui-react-0.6.0.tgz \
        https://github.com/KhallilB/kbui/releases/download/v0.6.0/kbui-css-0.6.0.tgz
```

```tsx
import "@kbui/css/styles.css";
import { Button } from "@kbui/react";

export const Save = () => <Button variant="primary">Save</Button>;
```

[Using kbui in a project](docs/guides/using-kbui.md) covers upgrading, installing by path while you work on kbui itself, theming and common errors.

## Versioning

All packages share one version. release-please reads the conventional commits on `main` and opens a release PR; merging it updates `CHANGELOG.md`, tags `v<version>` and uploads the tarballs. Before 1.0, a breaking change raises the minor version. Install the same version of every package.

## Working on kbui

```bash
mise install && bun install
bun run storybook        # http://localhost:6006
bun run check            # build, lint, typecheck and unit tests
```

[CONTRIBUTING](CONTRIBUTING.md) lists every command, the checks CI runs and the conventions components follow.

## Documentation

| Document | Covers |
|---|---|
| [Maintained features](docs/features.md) | Implementation, canonical docs, examples and current limits |
| [Tokens](docs/tokens.md) | Token kinds, naming, aliases and dark mode |
| [Using kbui in a project](docs/guides/using-kbui.md) | Installing, theming, updating and troubleshooting |
| [Adding a component](docs/guides/adding-a-component.md) | The generator, styles, tests and stories |
| [Forms and overlays](docs/guides/forms-and-overlays.md) | Theme hosts for popups, structured dialogs, surface tokens and accessibility checks |

## License

[MIT](LICENSE)
