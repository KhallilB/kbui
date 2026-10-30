# SupportingPane

Use SupportingPane for a page with one main task and supporting context beside it, such as a cart with its order summary or a record list with an inspector. It renders a main region and a named `aside` landmark. From 48rem of page content width the aside sits beside main at a fixed width while main fills the rest; below that it moves under main. It also frames the page: full width up to 80rem, centred, with 1, 1.5 and 2rem gutters. For two equal columns inside a section, use [Split](Split.md).

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/layout-supportingpane--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, Card, Heading, PageHeader, SupportingPane, Text } from "@kb.ui/react";

export function Example() {
  return (
    <main>
      <SupportingPane
        asideLabelledBy="summary-title"
        aside={
          <Card as="div">
            <Heading level={2} id="summary-title">
              Order summary
            </Heading>
            <Text>Total $245.75</Text>
            <Button>Continue to payment</Button>
          </Card>
        }
      >
        <PageHeader title="Your cart" description="Your sneakers are reserved for 15 minutes." />
        <Text>2 items</Text>
      </SupportingPane>
    </main>
  );
}
```

## More examples

- [Shoe cart](https://kbui.kcb.pro/storybook/?path=/story/layout-supportingpane--shoe-cart): Items, free-shipping progress and help in main; the order summary beside them, or below them on narrow screens.
- [Inspector](https://kbui.kcb.pro/storybook/?path=/story/layout-supportingpane--inspector): An order list with the selected order's details in the aside.

## Reference

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `ReactNode` | unset | Main region content, starting with the page heading |
| `aside` | `ReactNode` | unset | Supporting content; omit it and main fills the page |
| `asideLabelledBy` | `string` | unset | Id of a visible heading inside the aside that names it |
| `asideLabel` | `string` | unset | Accessible name for the aside when it has no visible heading |
| `classNames` | `{ main?, aside? }` | unset | Classes for the regions |

Other native div props and `ref` pass through to the root. Main comes first in source order and the aside second at every width; nothing is reordered. Each region stacks its children with the pane's gap, so main content needs no extra wrapper.

Tokens: `--kb-supportingpane-max-width`, `--kb-supportingpane-gutter-sm`, `-md`, `-lg`, `--kb-supportingpane-gap` and `--kb-supportingpane-aside-width`. Gutters step at 48rem and 64rem of viewport width; the aside moves beside main at 48rem of the pane's own content width, so a pane inside a narrow parent stays stacked.

Place SupportingPane inside your page's `main` and start main content with the page's `h1`, such as a [PageHeader](PageHeader.md). Name the aside, preferably from its visible heading; the complementary landmark is allowed inside main. The aside does not stick or hide; your app owns any show and hide control and its focus.

## Related components

Use [PageHeader](PageHeader.md) to open main, [Card](Card.md) to group the aside, and [Split](Split.md) for proportional columns inside a section.
