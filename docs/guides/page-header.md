# PageHeader recipe

Compose a page title, supporting description, metadata and actions from [Heading](../../packages/react/docs/components/Heading.md), [Text](../../packages/react/docs/components/Text.md), [Inline](../../packages/react/docs/components/Inline.md) and [Toolbar](../../packages/react/docs/components/Toolbar.md). This application-owned recipe demonstrates primitive composition. The package also exports [PageHeader](../../packages/react/docs/components/PageHeader.md) with its own supported API; use that component when it fits. This page documents the separate source module you copy below.

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
            <Button variant="secondary" onClick={() => window.print()}>Print</Button>
            <Button render={<a href="/projects/new" />} nativeButton={false} role="link">New project</Button>
          </Inline>
        </Inline>
      </header>
    </main>
  );
}
```

For the maintained slot-based recipe, copy [PageHeader.tsx](../../apps/storybook/recipes/PageHeader.tsx) and [recipes.css](../../apps/storybook/recipes/recipes.css) into your application. Its [Storybook guide](https://kbui.kcb.pro/storybook/?path=/docs/recipes-pageheader--docs) displays the exact source and runnable examples. Import the package stylesheet once and retain the local CSS import.

## Regions and ownership

| Region | Recipe input | Responsibility |
| --- | --- | --- |
| Title | Required `title`; `level` defaults to 1 | Visible heading; choose rank from the page outline |
| Description | Optional `description` | Supporting phrasing content; omit when unnecessary |
| Metadata | Optional `metadata` | Caller-provided status, owner, timestamp or navigation; use meaningful native markup |
| Actions | Optional `actions` | Buttons, links, Inline or named Toolbar; caller owns handlers and state |
| Root | Native header props, ref, className, style, dir | Page structure and application customization |

Omitted regions leave no empty wrappers. The copy grows; actions wrap below it when space runs out. Text and action labels can wrap without truncation. Native source order stays title, description, metadata, actions. Secondary actions precede the primary action in these examples. Use fewer actions or a Menu when their number obscures the main task.

Use Inline for independent Tab stops. Use a named Toolbar for a related action group with arrow-key movement and one Tab entry. Do not create a toolbar merely for visual alignment. Use native links for navigation; when using Button as a link, preserve `nativeButton={false}` and `role="link"`.

Render the header within the main page content. Set `level={2}` or another suitable rank for an embedded region; size and heading rank remain separate concerns. [WAI heading guidance](https://www.w3.org/WAI/tutorials/page-structure/headings/) explains the document outline.

## State and customization

Callbacks, permissions, pending work, error feedback and navigation stay in the application. The recipe creates no live region or asynchronous state. Provide meaningful text for pending or unavailable actions and keep feedback near the action or in the product's existing status system.

Override `.page-header-copy` flex basis or existing spacing tokens in application CSS when content needs different geometry. The recipe adds no tokens or provider. Preserve logical properties, source order, readable measures, visible focus and wrapping. Keep custom colors within the [restyling contract](restyling.md).

## Verification

The [runnable stories](../../apps/storybook/recipes/PageHeader.stories.tsx) cover project-list actions, a record-detail Toolbar, title-only content, pending actions, narrow long content and an embedded RTL heading. Automated checks exercise action feedback, keyboard flow and represented wrapping with accessibility scans.

At 320, 768 and 1280 CSS pixels, check both themes, long translated titles/metadata and every action. With keyboard, Tab between Inline actions; within Toolbar, use arrow keys, then Tab out. Verify visible focus, forced colors, text enlargement and browser zoom. With a screen reader, inspect heading rank and action names in the actual page. Automated scans do not establish screen-reader speech or complete-page conformance.

Keep this as a recipe until repeated product contexts establish shared geometry that existing primitives cannot express clearly. See [FormSection](form-section.md) for grouped fields below a page header.
