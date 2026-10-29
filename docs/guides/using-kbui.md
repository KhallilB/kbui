# Using kbui in a project

Install kbui from npm in your app's folder. The React adapter includes the components, their styles and CSS tokens. While developing kbui itself, use a local path install instead. GitHub Releases retain the same package archives for pinned downloads and historical releases.

## Installing

1. Add `@kb.ui/react` using your app's package manager. Choose one command; these commands work in standard shells on Windows, macOS and Linux. The [Get Started page](https://kbui.kcb.pro/setup/) generates the same versioned commands.

   <!-- x-release-please-start-version -->
   | Package manager | Command |
   |---|---|
   | npm | `npm install @kb.ui/react@0.10.3` |
   | Bun | `bun add @kb.ui/react@0.10.3` |
   | pnpm | `pnpm add @kb.ui/react@0.10.3` |
   | Yarn | `yarn add @kb.ui/react@0.10.3` |
   <!-- x-release-please-end -->

   Base UI and `clsx` install automatically as dependencies. The stylesheet includes all component rules and CSS variables, so this one kbui package is sufficient for a React app.

2. Your app needs `react` and `react-dom` 19 or later as peer dependencies. If missing, install them with your package manager, for example `npm install react@19 react-dom@19`. TypeScript apps also need compatible React type packages, for example `npm install --save-dev @types/react@19 @types/react-dom@19`.

3. Import the stylesheet once, near the root of the app. The components can then be used anywhere.

   ```tsx
   import "@kb.ui/react/styles.css";
   import { Button, Dialog, Input } from "@kb.ui/react";
   ```

Use your app entry or the global-style entry supported by your framework. Bundlers resolve the package stylesheet; browsers cannot resolve a bare npm package name in an HTML `href`. Keep the stylesheet import in the app even when importing individual components. No theme provider or separate Base UI setup is required for this example.

If TypeScript rejects the `.css` import, add this declaration to the project. Vite projects usually have it already through `vite/client`.

```ts
declare module "*.css";
```

Commit your app's package manifest and lockfile so CI and deployments install the same versions. The release workflow checks consumer installation on Windows, macOS and Linux before publishing to npm.

### Choosing packages

| Your app needs | Install | Load |
|---|---|---|
| React components | `@kb.ui/react` | `@kb.ui/react/styles.css` once |
| Plain HTML or another renderer's markup | `@kb.ui/css` | `@kb.ui/css/styles.css` once |
| Typed token names in JavaScript or TypeScript | Optional `@kb.ui/tokens` at the same kbui version | Import `{ tokens }`; use the existing full stylesheet |
| CSS variables without component styles | `@kb.ui/tokens` | `@kb.ui/tokens/tokens.css` |

React is the framework adapter currently provided. The CSS package supplies styling for other renderers; interactive controls still need their own behavior and accessible markup. The [CSS package guide](../../packages/css/README.md) describes its anatomy and individual stylesheet exports.

To add typed tokens, use the [matching command](https://kbui.kcb.pro/setup/?tokens=1) and update React and tokens together. `tokens.color.accent` returns `--kb-color-accent`, a variable name; use `var(${tokens.color.accent})` in styles. Importing the JavaScript object does not load CSS. See the [token guide](../tokens.md).

## Default design

The published stylesheet uses monochrome light/dark surfaces with a persimmon accent. Raised controls and cards share edge light, contact shading and soft shadows. Token overrides customize these defaults through the same bundled stylesheet. Historical releases retain the appearance they shipped with.

## Themes

Set the theme on the `<html>` element:

```html
<html data-theme="dark">
```

The attribute accepts `"light"` or `"dark"`. Without it, kbui follows the visitor's system setting. Themes switch through CSS variables, so no provider component is needed. Explicit theme containers rebind aliases for nested light/dark scopes. Put the page theme on `<html>` so body-portaled Dialog, Menu and Tooltip share it; a nested preview wrapper alone does not theme body portals.

To style one component, pass your own class. kbui's CSS sits in a cascade layer, so your CSS, CSS Modules or Tailwind classes win without kbui names. Components with inner parts take `classNames`:

```tsx
<Button className="checkout">Pay</Button>
<Input label="Email" classNames={{ control: "signup-input" }} />
```

To change every component at once, override a token after the kbui import. Tokens that are the same in both themes need one `:root` rule. Colors take both theme values through `light-dark()`:

```css
:root { --kb-button-radius: var(--kb-radius-full); }
:root, [data-theme] { --kb-color-accent: light-dark(oklch(55% 0.2 150), oklch(72% 0.17 150)); }
```

[Restyling kbui](restyling.md) covers classes, inner parts, Tailwind setup, tokens and restyling part of a page.

## Your first component

Import the stylesheet once in the app entry, then render a component. This example is a complete React module:

```tsx
import "@kb.ui/react/styles.css";
import { useState } from "react";
import { Button, Checkbox, Input, Status } from "@kb.ui/react";

export function Preferences() {
  const [name, setName] = useState("");
  const [updates, setUpdates] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <form onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
      <Input
        label="Display name"
        name="displayName"
        value={name}
        onValueChange={(value) => { setName(value); setSaved(false); }}
      />
      <Checkbox
        label="Send product updates"
        checked={updates}
        onCheckedChange={(checked) => { setUpdates(checked); setSaved(false); }}
      />
      <Button type="submit">Save preferences</Button>
      {saved && <Status live tone="success">Preferences saved for this session.</Status>}
    </form>
  );
}
```

This example keeps values in component state. Connect submission to your own storage or API when using it in an app. Your layout owns spacing between fields. Checkbox, Select, RadioGroup and Switch are controlled components; keep their value in state and pass the corresponding change callback.

The [React package README](../../packages/react/README.md) documents component APIs; Storybook includes the full typed prop reference. The [Examples page](https://kbui.kcb.pro/examples/) shows complete compositions with copyable code. The [forms and overlays guide](forms-and-overlays.md) covers themed popups, structured dialogs and focus behavior.

## Upgrading

### Moving from `@kbui` to `@kb.ui` (0.10.0)

The npm scope `@kbui` was unavailable, so from 0.10.0 the packages are `@kb.ui/react`, `@kb.ui/css` and `@kb.ui/tokens`. Stable npm publication starts at 0.10.1; 0.10.0 is available through GitHub release tarballs. Use a published npm version when following the current install command. The scope rename itself leaves component APIs unchanged.

1. Remove every `@kbui/*` dependency from `package.json`, then run the install command from [Installing](#installing). Add `@kb.ui/tokens` if you used `@kbui/tokens`.

2. Replace `@kbui/` with `@kb.ui/` in imports, stylesheet imports and any build config that names the packages, such as Vite `dedupe` or test `inline` lists.

3. Point the version guard at the new path: `node_modules/@kb.ui/react/dist/check-versions.js`.

### Updating current npm releases

Read the [release notes](https://kbui.kcb.pro/changelog/) and [full changelog](https://github.com/KhallilB/kbui/blob/main/CHANGELOG.md) for the versions between yours and the new one. Before 1.0, a minor version can contain breaking changes. Run the install command again with the new version, updating optional CSS and tokens packages in the same change. Commit the updated manifest and lockfile. kbui does not support mixed installed package versions. Run the installed-version guard after installing and before building:

```bash
node node_modules/@kb.ui/react/dist/check-versions.js
```

Add this command to the consumer build or check script. Bun can run the same file. The guard requires `@kb.ui/react`, treats separate CSS and tokens packages as optional, compares every top-level `node_modules/@kb.ui/*/package.json` (including optional tokens), and exits nonzero on mismatches, missing required packages, unreadable files or malformed manifests. It expects a `node_modules` installation; Yarn Plug'n'Play is outside its coverage. It does not inspect nested dependency trees. There are no package exemptions.

### Historical tarball installs

Releases before 0.10.0 are not on npm and use `@kbui/*`. Their React archive is at `https://github.com/KhallilB/kbui/releases/download/v<version>/kbui-react-<version>.tgz`. Releases before 0.7.0 also need the matching CSS archive and `@kbui/css/styles.css`; 0.7.0 and later bundle the stylesheet in React. Version 0.10.0 uses the new `@kb.ui` scope and `kb.ui-react-0.10.0.tgz` asset name, but remains tarball-only. When moving to current npm releases, remove old tarball dependencies, switch imports to `@kb.ui/`, and load `@kb.ui/react/styles.css`. Keep a separate CSS package only when your app uses its individual exports.

### Hearing about new releases

Because kbui is on npm, the usual tools see new versions: `bun outdated` or `npm outdated` lists them, and Dependabot or Renovate opens upgrade pull requests. kbui packages must share a version, so group them into one Dependabot update:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm # use bun for a bun.lock project
    directory: /
    schedule: { interval: weekly }
    groups:
      kbui:
        patterns: ["@kb.ui/*"]
```

These tools cannot see a project that installs kbui from a tarball URL; switch it to the command in [Installing](#installing). Without a bot, choose **Watch → Custom → Releases** on [the repository](https://github.com/KhallilB/kbui), or subscribe to [its releases feed](https://github.com/KhallilB/kbui/releases.atom).

## Installing by path while you work on kbui

This setup works only on a machine that has kbui checked out next to the project, so do not commit it to a project that builds in CI.

These development examples use Bun and Unix-style paths. Adapt the checkout paths to your machine; the published npm install above works without a kbui checkout.

1. Build kbui. Package exports point at `dist/` folders, which are not committed.

   ```bash
   cd ~/proj/kbui && bun run build
   ```

2. Add the packages from your project folder. The paths assume the project sits next to kbui, as in `~/proj/<your-app>`.

   ```bash
   bun add ../kbui/packages/react
   ```

| After you | Run |
|---|---|
| Change a token, a style or an existing component | `bun run build` in kbui. Bun links each built file individually, so the project sees the change immediately. |
| Add a component | `bun run build` in kbui, then `bun install` once in the project, so Bun links the new files. |
| Pull kbui from git | `bun install && bun run build` in kbui |

To return to a published release, run the `bun add` command from [Installing](#installing) again.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `failed to resolve` after `bun add link:../kbui/...` | In Bun, `link:` refers to a package registered with `bun link`, not a folder | Drop the prefix: `bun add ../kbui/packages/react` |
| `has a dependency loop` | `bun add` was run inside kbui | Run it from the project folder |
| `Cannot find module '@kb.ui/react'`, or missing types, with a path install | kbui has not been built | Run `bun run build` in kbui |
| Components render unstyled | The stylesheet is not imported | Import `@kb.ui/react/styles.css` once at the root |
| Dark mode never applies | `data-theme` is on the wrong element | Put it on `<html>` |
| CI or a deploy cannot find `@kb.ui/*` | The project installs kbui by path, and `../kbui` exists only on this machine | Install from npm instead; see [Installing](#installing) |
| Styles do not match the components | `@kb.ui/css/styles.css` is imported from a different release than `@kb.ui/react` | Import `@kb.ui/react/styles.css` and remove `@kb.ui/css` |
| `Invalid hook call` in jsdom tests, while the browser build works | Bun symlinks each path-installed file into `../kbui`, so Node resolves kbui's own `react` and `@base-ui/react` next to the project's copies | In the test config set `resolve: { preserveSymlinks: true, dedupe: ["react", "react-dom"] }` and inline `/@kb\.ui\//` for jsdom; the Vite build needs nothing |
| `Element type is invalid` in Vitest browser tests after rebuilding kbui | Vite keeps the previous build of `@kb.ui/*` in its prebundled dependency cache | Delete `node_modules/.vite` in the project and rerun the tests |
