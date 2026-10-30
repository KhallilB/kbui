# PageHeader

Open a screen with its title, short context, status and page-level actions. Use one per screen, at the top of `main`.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-pageheader--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Badge, Button, Link, PageHeader } from "@kb.ui/react";

export function Example() {
  return (
    <main>
      <PageHeader
        navigation={<Link href="/orders">← All orders</Link>}
        eyebrow="Order"
        title="#10482"
        meta={<Badge tone="success">Paid</Badge>}
        description="Placed on 12 October 2026 by Ana Ruiz · 3 items · €184.00"
        actions={
          <>
            <Button variant="secondary">Refund</Button>
            <Button>Fulfil order</Button>
          </>
        }
      />
    </main>
  );
}
```

The title renders as an `h1`. Actions sit at the end of the title row and wrap below the heading when the header is narrower than the heading's minimum width, so no width needs a media query.

## More examples

- [Detail with status](https://kbui.kcb.pro/storybook/?path=/story/components-pageheader--detail-with-status): Add a back link, an object-type eyebrow and status badges to a record screen.
- [Breadcrumbs](https://kbui.kcb.pro/storybook/?path=/story/components-pageheader--breadcrumbs): Place a labelled breadcrumb `nav` in `navigation` for nested settings.
- [With tabs](https://kbui.kcb.pro/storybook/?path=/story/components-pageheader--with-tabs): Put a `Tabs.List` in the body and draw a divider above the panels.
- [Sizes](https://kbui.kcb.pro/storybook/?path=/story/components-pageheader--sizes): Choose `sm` for dense app shells and `lg` for landing screens.
- [Narrow wrap](https://kbui.kcb.pro/storybook/?path=/story/components-pageheader--narrow-wrap): See long titles wrap and actions move below the heading at 320 pixels.

## Reference

| Prop           | Type            | Default  | Notes                                                                                                                 |
| -------------- | --------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `title`        | `ReactNode`     | required | Page name, rendered as the heading                                                                                    |
| `description`  | `ReactNode`     | unset    | One or two sentences of context below the title                                                                       |
| `eyebrow`      | `ReactNode`     | unset    | Short section or object-type label above the title                                                                    |
| `navigation`   | `ReactNode`     | unset    | Back link or breadcrumb `nav` above the heading                                                                       |
| `meta`         | `ReactNode`     | unset    | Status badges or metadata beside the title; kept out of the heading's accessible name                                 |
| `actions`      | `ReactNode`     | unset    | Page-level buttons or links; end-aligned, wrapping below the heading when narrow                                      |
| `headingLevel` | `1` / `2` / `3` | `1`      | Heading rank; lower it only when the header introduces a region below an existing `h1`                                |
| `size`         | `sm` / `md` / `lg` | `md`  | Title scale: `sm` uses the `h2` size, `md` the `h1` size, `lg` the display size                                       |
| `divider`      | `boolean`       | `false`  | Draws a rule below the header                                                                                         |
| `children`     | `ReactNode`     | unset    | Header body below the title row, such as a `Tabs.List` or filters                                                     |
| `classNames`   | keyed classes   | unset    | Style `navigation`, `main`, `heading`, `eyebrow`, `headline`, `title`, `meta`, `description`, `actions`, `body`       |

The root is a `div`, not `header`. A `header` outside `main` or a sectioning element becomes a banner landmark and would compete with the site header. Other native `div` props pass through to the root.

Keep one primary action. Put secondary actions before it and move rarely used actions into a [Menu](Menu.md).

## Related components

Use [Heading](Heading.md) for section titles inside the page, [EmptyState](EmptyState.md) when the page has no content yet, [Toolbar](Toolbar.md) for a dense group of controls that act on the content below, and [Container](Container.md) to set the page width the header shares with its content.
