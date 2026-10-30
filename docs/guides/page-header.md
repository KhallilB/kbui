# PageHeader recipe

Add a title, supporting text and actions to a page. `PageHeader` combines [`Heading`](../../packages/react/docs/components/Heading.md), [`Text`](../../packages/react/docs/components/Text.md) and [`Inline`](../../packages/react/docs/components/Inline.md).

This page covers a recipe you copy into your app. The package also exports [`PageHeader`](../../packages/react/docs/components/PageHeader.md) with its own API; use that component when it fits. The recipe below is a separate source module.

## Start with primitives

```tsx
import "@kb.ui/react/styles.css";
import { Button, Grid, Heading, Inline, Text } from "@kb.ui/react";

export function ProjectPage() {
  return (
    <main>
      <header>
        <Inline align="start" justify="between" gap="lg">
          <Grid layout="stack">
            <Heading level={1}>Projects</Heading>
            <Text tone="muted">Plan work and track delivery.</Text>
            <Text size="sm" tone="muted">12 projects · Updated today</Text>
          </Grid>
          <Inline gap="sm">
            <Button variant="secondary" onClick={() => window.print()}>
              Print
            </Button>
            <Button
              render={<a href="/projects/new" />}
              nativeButton={false}
              role="link"
            >
              New project
            </Button>
          </Inline>
        </Inline>
      </header>
    </main>
  );
}
```

To use the recipe with named props, copy [`PageHeader.tsx`](../../apps/storybook/recipes/PageHeader.tsx) and [`recipes.css`](../../apps/storybook/recipes/recipes.css) into the same folder. Keep the local CSS import and import `@kb.ui/react/styles.css` once in your app. The [Storybook guide](https://kbui.kcb.pro/storybook/?path=/docs/recipes-pageheader--docs) shows the source and examples.

## Regions and ownership

| Prop | Use |
| --- | --- |
| `title` | Required page or section title |
| `level` | Heading rank; defaults to `1` |
| `description` | Optional supporting text |
| `metadata` | Optional status, owner, timestamp or breadcrumbs |
| `actions` | Buttons, links or a related group of controls |
| Native `<header>` props | Pass `ref`, `className`, `style`, `dir` and other header attributes |

Empty props leave no empty wrappers. Long text wraps, and actions move below the text when space runs out. Reading order stays `title`, `description`, `metadata`, then `actions`. Put secondary actions before the main action. Move less-used actions into a `Menu` if the header gets crowded.

Use `Inline` for separate actions reached with Tab. Use a named [`Toolbar`](../../packages/react/docs/components/Toolbar.md) when related controls need arrow-key navigation and one Tab entry. `Button` links need `nativeButton={false}` and `role="link"`, as shown above.

Place the header inside the main page content. Use `level={2}` for a section below the page title. Heading rank describes the [document outline](https://www.w3.org/WAI/tutorials/page-structure/headings/); it does not set visual size.

## State and customization

Your app handles navigation, permissions, pending actions and feedback. Give unavailable actions a clear explanation. Show progress or errors near the action, or use your app's status message area. `PageHeader` does not announce updates automatically.

Adjust spacing tokens or `.page-header-copy` in your CSS. Keep text readable, actions reachable and focus visible. See [Restyling kbui](restyling.md) for color and theme changes.

## Verification

Run the example checks from the repository root:

```sh
bun run --cwd apps/storybook test recipes/PageHeader.stories.tsx
bun run --cwd apps/storybook verify:code
```

The [stories](../../apps/storybook/recipes/PageHeader.stories.tsx) cover page actions, `Toolbar` navigation, title-only content, pending actions, long text and an embedded right-to-left header.

Check light and dark at 320, 768 and 1280 CSS pixels. Tab through separate actions; use arrow keys inside a `Toolbar`, then Tab out. Try long translated text, forced colors, larger text and browser zoom. With a screen reader, check heading rank and action names.

Automated checks include accessibility scans. Screen-reader speech and browser zoom still need human checks; passing a scan does not verify the whole page.

See [`FormSection`](form-section.md) for grouped fields below the header.
