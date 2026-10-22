# Using kbui in a project

Projects pick up kbui directly from its folder on disk. There's no registry and no version number: when you rebuild kbui, every project using it sees the change.

## Installing

First, build kbui. The packages point at their `dist/` folders, which aren't committed.

```bash
cd ~/proj/kbui && bun run build
```

Then add the packages from your project's folder. These paths assume your project sits next to kbui, as in `~/proj/<your-app>`:

```bash
bun add ../kbui/packages/react ../kbui/packages/css
```

If you want the typed `tokens` object in TypeScript, add `../kbui/packages/tokens` too. Your project also needs `react` and `react-dom` 19. They're peer dependencies, so kbui doesn't install them for you.

Import the stylesheet once, near the root of your app, and then use the components anywhere:

```tsx
import "@kbui/css/styles.css";
import { Button, Dialog, Input } from "@kbui/react";
```

If TypeScript complains about importing a `.css` file, add this declaration somewhere in your project. Vite projects usually have it already through `vite/client`.

```ts
declare module "*.css";
```

## Light and dark

Set the theme on the `<html>` element:

```html
<html data-theme="dark">
```

It accepts `"light"` or `"dark"`. Without it, kbui follows the visitor's system setting. Everything switches through CSS variables, so you don't need a provider component.

To tweak a value for your app, override its variable after the kbui import. Scale and component tokens are the same in both themes, so one rule is enough:

```css
:root { --kb-button-radius: var(--kb-radius-full); }
```

Semantic colors change between themes, so set them for dark mode too. A plain `:root` override would otherwise win in dark mode as well:

```css
:root { --kb-color-accent: oklch(55% 0.2 150); }
:root[data-theme="dark"] { --kb-color-accent: oklch(72% 0.17 150); }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --kb-color-accent: oklch(72% 0.17 150); }
}
```

## A quick tour of the components

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

Every prop is documented in Storybook (run `bun run storybook` in kbui and open a component's **Docs** page) and in the [React package README](../../packages/react/README.md).

## Picking up changes

Bun links each of kbui's built files into your project one by one. So after changing a token, a style or an existing component, run `bun run build` in kbui and your project sees the change immediately.

A new component adds new files, and those only show up in your project after you run `bun install` there once.

After pulling kbui from git, run `bun install && bun run build` in kbui.

## When things go wrong

| What you see | Why | What to do |
|---|---|---|
| `failed to resolve` after `bun add link:../kbui/...` | In Bun, `link:` refers to a package registered with `bun link`, not a folder | Drop the prefix: `bun add ../kbui/packages/react` |
| `has a dependency loop` | You ran `bun add` inside kbui itself | Run it from your project's folder |
| `Cannot find module '@kbui/react'`, or no types | kbui hasn't been built | Run `bun run build` in kbui |
| Components show up unstyled | The stylesheet isn't imported | Import `@kbui/css/styles.css` once at the root |
| Dark mode never kicks in | `data-theme` is on the wrong element | Put it on `<html>` |
| CI or a deploy can't find `@kbui/*` | `../kbui` only exists on this machine | A known limit for now; see [decision 0003](../decisions/0003-local-path-installs.md) |
