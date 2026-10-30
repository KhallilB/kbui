# Gallery

Use Gallery for a page of image-led items, such as a product catalog, a portfolio or a media library. It is the page frame, up to 80rem wide, with a header region, an optional filters region and the items as a list, with one to four columns as the gallery widens. For records you scan by text, use [CollectionList](CollectionList.md) or [Table](Table.md); for a handful of metrics or links, use [Grid](Grid.md).

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/layout-gallery--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, Card, Gallery, Grid, Heading, Image, Input, PageHeader, Text } from "@kb.ui/react";
import { useState } from "react";

const products = [
  { id: "classic", name: "The Schu Classic", price: 89, src: "/schu-classic.jpg", alt: "Sage knit sneaker with a white sole" },
  { id: "trail", name: "The Schu Trail", price: 99, src: "/schu-trail.jpg", alt: "Charcoal knit sneaker with an amber sole" },
];

export function Example() {
  const [query, setQuery] = useState("");
  const visible = products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <main>
      <Gallery
        header={<PageHeader title="Sneakers" description="Our own model beside the brands you love." />}
        filters={
          <>
            <Input label="Search" type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
            <Text role="status" size="sm" tone="muted">
              {visible.length === 1 ? "1 sneaker" : `${visible.length} sneakers`}
            </Text>
          </>
        }
        itemsLabel="Sneakers"
        empty={<Text>No sneakers match your search.</Text>}
      >
        {visible.map((product, index) => (
          <Gallery.Item key={product.id} featured={index === 0}>
            <Card aria-labelledby={`${product.id}-name`}>
              <Grid layout="stack" gap="sm">
                <Image src={product.src} alt={product.alt} ratio={index === 0 ? "wide" : "landscape"} loading="lazy" />
                <Heading level={2} size="sm" id={`${product.id}-name`}>
                  {product.name}
                </Heading>
                <Text>${product.price}</Text>
                <Button variant="secondary">
                  Add to cart<span className="kb-sr-only">, {product.name}</span>
                </Button>
              </Grid>
            </Card>
          </Gallery.Item>
        ))}
      </Gallery>
    </main>
  );
}
```

## More examples

- [Product catalog](https://kbui.kcb.pro/storybook/?path=/story/layout-gallery--product-catalog): A sneaker shop that features its own model, with search, brand and sort filters.
- [No results](https://kbui.kcb.pro/storybook/?path=/story/layout-gallery--no-results): The empty region replaces the list until the filters are cleared.
- [Inspection](https://kbui.kcb.pro/storybook/?path=/story/layout-gallery--inspection): Square thumbnails that open a full, uncropped preview in a Dialog.

## Reference

| Part / prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `header` | `ReactNode` | unset | Page title, intro and actions; usually a PageHeader |
| `filters` | `ReactNode` | unset | Search, filter and sort controls and a result count |
| `itemsLabel` | `string` | unset | Accessible name for the item list |
| `empty` | `ReactNode` | unset | Shown in place of the list when there are no items |
| `classNames` | `{ header?, filters?, items?, empty? }` | unset | Classes for the regions |
| `Gallery.Item` | native `li` props | `li` | One item; `featured` spans two columns once the list has two |

Other native div props and `ref` pass through to the root; `Gallery.Item` forwards its own. The items region is a [Grid](Grid.md) rendered as `ul`, so wrap every item in `Gallery.Item`.

Placement is fixed in the stylesheet and measured on the gallery's own width, not the viewport: one column below 30rem, two from 30rem, three from 48rem and four from 64rem. Filters share a row, each at least 12rem wide, and wrap below it. Item content stretches to the row height; spacing inside an item belongs to its content, such as a stacked Grid. Pass items directly or inside fragments: a component that renders no items still counts as one, so `empty` cannot replace the list. Put featured items first: the list keeps DOM order and does not backfill gaps. Gallery is also the page frame: it fills its parent up to 80rem, centred, with gutters of 1rem, then 1.5rem from 48rem and 2rem from 64rem of viewport width, so do not wrap it in a [Container](Container.md). Tokens: `--kb-gallery-max-width`, `--kb-gallery-gutter-sm`, `--kb-gallery-gutter-md`, `--kb-gallery-gutter-lg`, `--kb-gallery-gap`, `--kb-gallery-filters-gap` and `--kb-gallery-filter-min-width`.

Give every meaningful image an `alt` that says what differs between items, such as colour or material; repeat nothing the item heading already says. Name each item with its heading and include that name in item actions. Announce result counts after filtering with a status message, and when a recovery action such as "Clear filters" removes the empty region, move focus to the control it reset. Your app owns data, filtering, pagination and cart state.

## Related components

Frame media with [Image](Image.md) or [Thumbnail](Thumbnail.md), open the page with [PageHeader](PageHeader.md), show an empty result with [EmptyState](EmptyState.md) and inspect an item in a [Dialog](Dialog.md).
