# Using kbui in a project

Projects install kbui directly from its folder on disk. There is no registry and no version number: when kbui is rebuilt, every project using it receives the change.

## Installing

1. Build kbui. Package exports point at `dist/` folders, which are not committed.

   ```bash
   cd ~/proj/kbui && bun run build
   ```

2. Add the packages from your project folder. The paths assume the project sits next to kbui, as in `~/proj/<your-app>`.

   ```bash
   bun add ../kbui/packages/react ../kbui/packages/css
   ```

   Add `../kbui/packages/tokens` as well if you need the typed `tokens` object in TypeScript.

3. Install `react` and `react-dom` 19 if the project does not have them. They are peer dependencies, so kbui does not install them.

4. Import the stylesheet once, near the root of the app. The components can then be used anywhere.

   ```tsx
   import "@kbui/css/styles.css";
   import { Button, Dialog, Input } from "@kbui/react";
   ```

If TypeScript rejects the `.css` import, add this declaration to the project. Vite projects usually have it already through `vite/client`.

```ts
declare module "*.css";
```

## Themes

Set the theme on the `<html>` element:

```html
<html data-theme="dark">
```

The attribute accepts `"light"` or `"dark"`. Without it, kbui follows the visitor's system setting. Themes switch through CSS variables, so no provider component is needed.

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

## Picking up changes

| After you | Run |
|---|---|
| Change a token, a style or an existing component | `bun run build` in kbui. Bun links each built file individually, so the project sees the change immediately. |
| Add a component | `bun run build` in kbui, then `bun install` once in the project, so Bun links the new files. |
| Pull kbui from git | `bun install && bun run build` in kbui |

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `failed to resolve` after `bun add link:../kbui/...` | In Bun, `link:` refers to a package registered with `bun link`, not a folder | Drop the prefix: `bun add ../kbui/packages/react` |
| `has a dependency loop` | `bun add` was run inside kbui | Run it from the project folder |
| `Cannot find module '@kbui/react'`, or missing types | kbui has not been built | Run `bun run build` in kbui |
| Components render unstyled | The stylesheet is not imported | Import `@kbui/css/styles.css` once at the root |
| Dark mode never applies | `data-theme` is on the wrong element | Put it on `<html>` |
| CI or a deploy cannot find `@kbui/*` | `../kbui` exists only on this machine | Known limitation; see [decision 0003](../decisions/0003-local-path-installs.md) |
