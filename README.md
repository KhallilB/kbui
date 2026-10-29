# kbui

kbui is a React component library with shared design tokens and plain CSS. Use the default light and dark themes, or adjust the tokens to fit your app. Components combine native controls with [Base UI](https://base-ui.com) for interaction. Current releases are published to [npm](https://www.npmjs.com/package/@kb.ui/react) with the same tarballs attached to a [GitHub Release](https://github.com/KhallilB/kbui/releases).

| Package | Contents | Docs |
|---|---|---|
| `@kb.ui/react` | React 19+ components, bundled styles and CSS tokens; the complete install for React apps | [React API](packages/react/README.md) |
| `@kb.ui/css` | Standalone styles for HTML or another renderer, including CSS tokens | [CSS package](packages/css/README.md) |
| `@kb.ui/tokens` | Optional typed CSS variable names, token-only CSS and source JSON | [Token package](packages/tokens/README.md) |

## Using kbui in a project

Add `@kb.ui/react` to an existing React app. It includes every component, the complete stylesheet and CSS tokens. Base UI and other runtime dependencies install automatically. Your app supplies React and React DOM 19 or later.

<!-- x-release-please-start-version -->
```bash
npm install @kb.ui/react@0.10.4
```
<!-- x-release-please-end -->

```tsx
import "@kb.ui/react/styles.css";
import { Button } from "@kb.ui/react";

export const Save = () => <Button variant="primary">Save</Button>;
```

Import the stylesheet once at your app entry or framework's global-style entry. Components follow the system theme; put `data-theme="light"` or `data-theme="dark"` on `<html>` to choose explicitly. A separate CSS or token package is optional for React apps.

[Get Started](https://kbui.kcb.pro/setup/) generates commands for npm, Bun, pnpm and Yarn. [Using kbui in a project](docs/guides/using-kbui.md) covers React prerequisites, CSS-only use, typed tokens, upgrades, local development and troubleshooting.

## Versioning

All packages share one version. Keep every kbui package your app installs on that version. Before 1.0, a minor release can include breaking changes; read the [release notes](https://kbui.kcb.pro/changelog/) before upgrading.

Release Please opens a release PR from conventional commits on `main`. Merging it creates the tag and GitHub assets. GitHub Actions validates the packages and consumer installs on Linux, macOS and Windows, then publishes the same tarballs to npm through trusted publishing. Release PRs update the installation examples here, in the usage guide and in Storybook. The site derives commands from the root package version, and checks reject stale managed examples. Older `@kbui/*` releases use their original GitHub tarballs; see the [upgrade guide](docs/guides/using-kbui.md#upgrading).

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
| [Media and identity](docs/guides/media-and-identity.md) | Avatar, stable image framing, thumbnails and gallery recipes (unreleased) |
| [Collection workflows](packages/react/docs/components/Collection.md) | Sorting, filtering, page selection, pagination, bulk actions and server ownership |
| [React component guide](packages/react/README.md) | Choose components by task, read APIs, and find focused examples |
| [Maintained features](docs/features.md) | Implementation, canonical docs, examples and current limits |
| [Tokens](docs/tokens.md) | Token kinds, naming, aliases and dark mode |
| [Copyable content](docs/guides/copyable-content.md) | Copy identifiers, commands and references with feedback and recovery |
| [Layout composition](docs/guides/layout.md) | Shared page widths, gutters, wrapping rows, alignment and column collapse |
| [Using kbui in a project](docs/guides/using-kbui.md) | Installing, theming, updating and troubleshooting |
| [Restyling kbui](docs/guides/restyling.md) | Style components with your own classes or Tailwind; tokens for app-wide changes |
| [Adding a component](docs/guides/adding-a-component.md) | The generator, styles, tests and stories |
| [Forms and overlays](docs/guides/forms-and-overlays.md) | Form sections, action rows, error summaries, theme hosts for popups, structured dialogs, drawers, confirmations, disclosure and popover choices, surface tokens and accessibility checks |

## License

[MIT](LICENSE)
