# Using kbui in a project

Projects install kbui from npm. Each release also attaches the same tarballs to a [GitHub Release](https://github.com/KhallilB/kbui/releases). While you change kbui itself, a project can install it by path instead and receive every rebuild immediately.

## Installing

1. Add `@kbui/react` from npm. It includes all component styles and CSS tokens. These examples use Bash; use Git Bash or WSL on Windows, or copy a complete command for your package manager from the [Get Started page](https://kbui.kcb.pro/setup/).

   <!-- x-release-please-start-version -->
   ```bash
   bun add @kbui/react@0.9.0
   ```
   <!-- x-release-please-end -->

   The release workflow checks installation on Windows, macOS and Linux; a failed install shows as a failed `install` job on that release's workflow run. npm publishes a release only after those installs pass. The stylesheet already includes the tokens. Add `@kbui/tokens` at the same version only if you need the typed `tokens` object in TypeScript.

   Releases before 0.9.0 are not on npm. Install them from their tarball, `https://github.com/KhallilB/kbui/releases/download/v<version>/kbui-react-<version>.tgz`.

2. Install `react` and `react-dom` 19 if the project does not have them. They are peer dependencies; keep them as dependencies of your app.

3. Import the stylesheet once, near the root of the app. The components can then be used anywhere.

   ```tsx
   import "@kbui/react/styles.css";
   import { Button, Dialog, Input } from "@kbui/react";
   ```

If TypeScript rejects the `.css` import, add this declaration to the project. Vite projects usually have it already through `vite/client`.

```ts
declare module "*.css";
```

Releases before 0.7.0 require both matching React and CSS tarballs and the `@kbui/css/styles.css` import. Keep that import only while consuming those older releases.

## Default design

The current source stylesheet uses monochrome light/dark surfaces with a persimmon accent. Raised controls and cards share edge light, contact shading and soft shadows. No extra theme stylesheet is needed. Local builds include the refresh; existing published v0.7.0 downloads retain their original colors. Public component props and token overrides remain supported.

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
import "@kbui/react/styles.css";
import { useState } from "react";
import { Button, Checkbox, Input, Status } from "@kbui/react";

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

Read the [release notes](https://github.com/KhallilB/kbui/releases), also kept in `CHANGELOG.md`, for the versions between yours and the new one. Before 1.0, a minor version can contain breaking changes. Run the install command again with the new version. From 0.7.0, the React tarball carries the stylesheet, so a React app does not need a separate CSS package. If migrating from an earlier release, switch the import to `@kbui/react/styles.css` and remove a separate `@kbui/css` dependency unless your app uses its individual CSS entry points. Update optional `@kbui/tokens` to the same release. kbui does not support mixed installed package versions. Run the installed-version guard after installing and before building:

```bash
bun node_modules/@kbui/react/dist/check-versions.js
```

Add this command to the consumer build or check script. It requires `@kbui/react`, treats separate CSS and tokens packages as optional, compares every top-level `node_modules/@kbui/*/package.json` (including optional tokens), and exits nonzero on mismatches, missing required packages, unreadable files or malformed manifests. It does not inspect nested dependency trees. There are no package exemptions.

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
        patterns: ["@kbui/*"]
```

These tools cannot see a project that installs kbui from a tarball URL; switch it to the command in [Installing](#installing). Without a bot, choose **Watch → Custom → Releases** on [the repository](https://github.com/KhallilB/kbui), or subscribe to [its releases feed](https://github.com/KhallilB/kbui/releases.atom).

## Installing by path while you work on kbui

This setup works only on a machine that has kbui checked out next to the project, so do not commit it to a project that builds in CI.

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
| `Cannot find module '@kbui/react'`, or missing types, with a path install | kbui has not been built | Run `bun run build` in kbui |
| Components render unstyled | The stylesheet is not imported | Import `@kbui/react/styles.css` once at the root |
| Dark mode never applies | `data-theme` is on the wrong element | Put it on `<html>` |
| CI or a deploy cannot find `@kbui/*` | The project installs kbui by path, and `../kbui` exists only on this machine | Install from npm instead; see [Installing](#installing) |
| Styles do not match the components | `@kbui/css/styles.css` is imported from a different release than `@kbui/react` | Import `@kbui/react/styles.css` and remove `@kbui/css` |
| `Invalid hook call` in jsdom tests, while the browser build works | Bun symlinks each path-installed file into `../kbui`, so Node resolves kbui's own `react` and `@base-ui/react` next to the project's copies | In the test config set `resolve: { preserveSymlinks: true, dedupe: ["react", "react-dom"] }` and inline `/@kbui\//` for jsdom; the Vite build needs nothing |
| `Element type is invalid` in Vitest browser tests after rebuilding kbui | Vite keeps the previous build of `@kbui/*` in its prebundled dependency cache | Delete `node_modules/.vite` in the project and rerun the tests |
