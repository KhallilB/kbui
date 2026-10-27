# Using kbui in a project

Projects install kbui from a release: one tarball per package, attached to a [GitHub Release](https://github.com/KhallilB/kbui/releases). There is no registry. While you change kbui itself, a project can install it by path instead and receive every rebuild immediately.

## Installing

1. Add `@kbui/react` and `@kbui/css` from the same release. The setup page includes an install command for the current site version. Replace `0.6.0` with the version you want; every release lists its tarballs.

   ```bash
   bun add https://github.com/KhallilB/kbui/releases/download/v0.6.0/kbui-react-0.6.0.tgz \
           https://github.com/KhallilB/kbui/releases/download/v0.6.0/kbui-css-0.6.0.tgz
   ```

   This works the same on Windows, macOS and Linux. The release workflow installs every release on all three; a failed install shows as a failed `install` job on that release's workflow run. `@kbui/css` already includes the tokens. Add `kbui-tokens-<version>.tgz` from the same release only if you need the typed `tokens` object in TypeScript.

2. Install `react` and `react-dom` 19 if the project does not have them. They are peer dependencies, so kbui does not install them.

3. Import the stylesheet once, near the root of the app. The components can then be used anywhere.

   ```tsx
   import "@kbui/css/styles.css";
   import { Button, Dialog, Input } from "@kbui/react";
   ```

If TypeScript rejects the `.css` import, add this declaration to the project. Vite projects usually have it already through `vite/client`.

```ts
declare module "*.css";
```

## Default design

The normal stylesheet includes the tactile cream/forest/rust light design and charcoal/peach dark design. No skin selector or extra stylesheet is needed. Public component props and token overrides remain supported.

## Themes

Set the theme on the `<html>` element:

```html
<html data-theme="dark">
```

The attribute accepts `"light"` or `"dark"`. Without it, kbui follows the visitor's system setting. Themes switch through CSS variables, so no provider component is needed. Explicit theme containers rebind aliases for nested light/dark scopes. Put the page theme on `<html>` so body-portaled Dialog, Menu and Tooltip share it; a nested preview wrapper alone does not theme body portals.

To adjust a value for your app, override its variable after the kbui import. Scale and component tokens are the same in both themes, so one rule is enough:

```css
:root { --kb-button-radius: var(--kb-radius-full); }
```

Semantic colors differ between themes, so override the dark value as well. Otherwise a plain `:root` override also applies in dark mode:

```css
:root { --kb-color-accent: oklch(55% 0.2 150); }
:root[data-theme="dark"] { --kb-color-accent: oklch(72% 0.17 150); }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --kb-color-accent: oklch(72% 0.17 150); }
}
```

## Components

```tsx
<Button variant="secondary" size="sm" onClick={save}>Save</Button>

<Input label="Email" description="We never share it." error={errors.email} />

<Dialog>
  <Dialog.Trigger render={<Button />}>Delete</Dialog.Trigger>
  <Dialog.Content title="Delete project" description="This cannot be undone.">
    <Dialog.Actions>
      <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
      <Button variant="danger" onClick={remove}>Delete</Button>
    </Dialog.Actions>
  </Dialog.Content>
</Dialog>
```

Every prop is documented in the [React package README](../../packages/react/README.md) and on each component's **Docs** page in Storybook (`bun run storybook` in kbui).

## Upgrading

Read the [release notes](https://github.com/KhallilB/kbui/releases), also kept in `CHANGELOG.md`, for the versions between yours and the new one. Before 1.0, a minor version can contain breaking changes. Then change both URLs to the new version in one `bun add` command, so the stylesheet and the components always come from the same release. kbui does not support mixing versions. Run the installed-version guard after installing and before building:

```bash
bun node_modules/@kbui/react/dist/check-versions.js
```

Add this command to the consumer build or check script. It requires installed React/CSS packages, compares every top-level `node_modules/@kbui/*/package.json` (including optional tokens), and exits nonzero on mismatches, missing required packages, unreadable files or malformed manifests. It does not inspect nested dependency trees. There are no package exemptions.

## Installing by path while you work on kbui

This setup works only on a machine that has kbui checked out next to the project, so do not commit it to a project that builds in CI.

1. Build kbui. Package exports point at `dist/` folders, which are not committed.

   ```bash
   cd ~/proj/kbui && bun run build
   ```

2. Add the packages from your project folder. The paths assume the project sits next to kbui, as in `~/proj/<your-app>`.

   ```bash
   bun add ../kbui/packages/react ../kbui/packages/css
   ```

| After you | Run |
|---|---|
| Change a token, a style or an existing component | `bun run build` in kbui. Bun links each built file individually, so the project sees the change immediately. |
| Add a component | `bun run build` in kbui, then `bun install` once in the project, so Bun links the new files. |
| Pull kbui from git | `bun install && bun run build` in kbui |

To return to a release, run the `bun add` command from [Installing](#installing) again.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `failed to resolve` after `bun add link:../kbui/...` | In Bun, `link:` refers to a package registered with `bun link`, not a folder | Drop the prefix: `bun add ../kbui/packages/react` |
| `has a dependency loop` | `bun add` was run inside kbui | Run it from the project folder |
| `Cannot find module '@kbui/react'`, or missing types, with a path install | kbui has not been built | Run `bun run build` in kbui |
| Components render unstyled | The stylesheet is not imported | Import `@kbui/css/styles.css` once at the root |
| Dark mode never applies | `data-theme` is on the wrong element | Put it on `<html>` |
| CI or a deploy cannot find `@kbui/*` | The project installs kbui by path, and `../kbui` exists only on this machine | Install from a release instead; see [Installing](#installing) |
| Styles do not match the components | `@kbui/css` and `@kbui/react` come from different releases | Install both from the same version |
| `Invalid hook call` in jsdom tests, while the browser build works | Bun symlinks each path-installed file into `../kbui`, so Node resolves kbui's own `react` and `@base-ui/react` next to the project's copies | In the test config set `resolve: { preserveSymlinks: true, dedupe: ["react", "react-dom"] }` and inline `/@kbui\//` for jsdom; the Vite build needs nothing |
| `Element type is invalid` in Vitest browser tests after rebuilding kbui | Vite keeps the previous build of `@kbui/*` in its prebundled dependency cache | Delete `node_modules/.vite` in the project and rerun the tests |
