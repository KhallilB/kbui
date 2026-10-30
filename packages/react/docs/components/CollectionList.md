# CollectionList

Group records in a native list when people scan names, summaries, status and actions. Use Table when column-by-column comparison is the main task.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-collectionlist--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { CollectionList, CollectionRow, Link, Status } from "@kb.ui/react";

export function Example() {
  return (
    <CollectionList aria-label="Projects">
      <CollectionRow title={<Link href="/projects/portal">Customer portal</Link>} description="Owned by Ada Chen" metadata={<Status tone="success">Ready for review</Status>} />
      <CollectionRow title={<Link href="/projects/search">Search improvements</Link>} description="Owned by Lin Patel" metadata={<Status tone="warning">Needs changes</Status>} />
    </CollectionList>
  );
}
```

## More examples

- [Ordered sequence](https://kbui.kcb.pro/storybook/?path=/story/components-collectionlist--ordered): Native `ol` markers, alphabetic `type` and `start`.
- [Filtering](https://kbui.kcb.pro/storybook/?path=/story/components-collectionlist--filterable): App-owned search, result announcement, empty recovery and stable search focus.

## Reference

| Prop | Default | Behavior |
|---|---|---|
| `as` | `ul` | `ul` for records without a required order; `ol` for an ordered sequence |
| `density` | `comfortable` | `comfortable` or `dense`; affects immediate CollectionRow children |
| `dividers` | true | Rules between immediate CollectionRow children |

The root accepts native attributes, `className`, `style` and the correct list ref. With `as="ol"`, native `start`, `reversed`, `type` and numbering behavior remain available. Public types are `CollectionListElement` and generic `CollectionListProps`. A default `role="list"` preserves list semantics where list-style removal affects accessibility exposure; the native element still supplies the structure. See the [W3C list styling guidance](https://design-system.w3.org/styles/lists.html#considerations) for marker removal and list semantics. This is an ordinary list with normal Tab navigation, without listbox selection or arrow-key item navigation.

Use CollectionRow or native `li` children. A non-row `li` retains native semantics but does not receive row slot styling. If a record has leading content or an aside, the list reserves matching minimum columns across its immediate rows; missing optional content does not shift record titles. Metadata and actions share one end-aligned line, and stack beneath content, still end-aligned, when a row is narrower than 48rem. Nested lists keep their own sizing and density. Ordered markers remain visible in both directions.

Your app owns stable keys, data ordering, filtering, selection policy, pagination and requests. Keep filters mounted while results update so drafts and keyboard focus survive. Put useful empty/error guidance and a named retry action outside an empty list. Use `aria-busy` for pending content and a concise status message outside the busy subtree. Pagination or virtualization is app-owned; CollectionList renders the children you provide.

## Related components

[CollectionRow](CollectionRow.md) supplies record slots; [DescriptionList](DescriptionList.md) presents individual record facts; [Table](Table.md) supports aligned column comparison. See [Structured data](../../../../docs/guides/structured-data.md) for composition guidance.
