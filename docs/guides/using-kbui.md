# Using kbui in a project

kbui is consumed from this checkout by path. There is no registry: building kbui is the whole release, and consumers see the new build immediately.

## Install

1. Build kbui. Package exports point at `dist/`, which is not committed.

   ```bash
   cd ~/proj/kbui && bun run build
   ```

2. In the consumer, add the packages by path, relative to the consumer:

   ```bash
   bun add ../kbui/packages/react ../kbui/packages/css
   ```

   Add `../kbui/packages/tokens` as well if you want the typed `tokens` object in TypeScript.

3. Make sure the consumer has `react` and `react-dom` 19; they are peer dependencies.

4. Import the stylesheet once, at the app root, then use components:

   ```tsx
   import "@kbui/css/styles.css";
   import { Button, Dialog, Input } from "@kbui/react";
   ```

If TypeScript rejects the CSS import, declare CSS modules once in the consumer. Vite projects already get this from `vite/client` types.

```ts
declare module "*.css";
```

## Theme

Set the theme on `<html>`:

```html
<html data-theme="dark">
```

Use `"light"` or `"dark"`. Without the attribute, the visitor's system setting decides. All colors switch through CSS variables, so no React provider is needed.

To adjust a value for one app, override the variable after importing `styles.css`:

```css
:root { --kb-button-radius: var(--kb-radius-full); }
```

Override semantic and component tokens, not palette primitives, so dark mode keeps working.

## Components at a glance

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

Every prop is documented in Storybook (`bun run storybook` in kbui, then the **Docs** page of each component) and in [packages/react](../../packages/react/README.md).

## Updating

| You changed in kbui | Do in kbui | Do in the consumer |
|---|---|---|
| A token, CSS or an existing component | `bun run build` | Nothing; the files are symlinked |
| Added a component or a new file in `dist/` | `bun run build` | `bun install` |
| Pulled kbui changes from git | `bun install && bun run build` | Nothing, unless new files appeared |

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `failed to resolve` on `bun add link:../kbui/...` | `link:` in Bun means a name registered with `bun link`, not a path | Use the plain path: `bun add ../kbui/packages/react` |
| `has a dependency loop` | The command ran inside kbui itself | Run it in the consumer's folder |
| `Cannot find module '@kbui/react'` or missing types | kbui was not built | `bun run build` in kbui |
| Components render unstyled | `styles.css` not imported | Import `@kbui/css/styles.css` once at the app root |
| Dark mode never applies | `data-theme` set on an element other than `<html>` | Put it on `<html>` |
| CI or a deploy cannot find `@kbui/*` | The path `../kbui` exists only on this machine | Known limit; see [decision 0003](../decisions/0003-local-path-installs.md) |
