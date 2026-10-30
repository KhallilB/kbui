# DescriptionList

Present named facts about one record with native description-list relationships. Use `Table` when readers need to compare the same fields across records.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-descriptionlist--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { DescriptionList, Link, Status } from "@kb.ui/react";

export function Example() {
  return (
    <DescriptionList aria-label="Project details">
      <DescriptionList.Item>
        <DescriptionList.Term>Owner</DescriptionList.Term>
        <DescriptionList.Detail><Link href="/people/ada">Ada Chen</Link></DescriptionList.Detail>
      </DescriptionList.Item>
      <DescriptionList.Item>
        <DescriptionList.Term>Status</DescriptionList.Term>
        <DescriptionList.Detail><Status tone="success">Ready for review</Status></DescriptionList.Detail>
      </DescriptionList.Item>
      <DescriptionList.Item>
        <DescriptionList.Term>Open tasks</DescriptionList.Term>
        <DescriptionList.Detail>{0}</DescriptionList.Detail>
      </DescriptionList.Item>
    </DescriptionList>
  );
}
```

## More examples

- [Responsive](https://kbui.kcb.pro/storybook/?path=/story/components-descriptionlist--responsive): Stacks according to its parent width.
- [Nested details](https://kbui.kcb.pro/storybook/?path=/story/components-descriptionlist--nested): Independent density and layout inside another detail value.

## Reference

| Part | Native element | Purpose |
|---|---|---|
| `DescriptionList` | `dl` | Root description list; native naming attributes, children, styles and ref pass through |
| `DescriptionList.Item` | `div` | Groups one Term with one or more Detail elements |
| `DescriptionList.Term` | `dt` | Meaningful label in reading order before its values |
| `DescriptionList.Detail` | `dd` | Text, numbers, links, status or richer content; repeated Details support multiple values |

| Prop | Default | Behavior |
|---|---|---|
| `layout` | `responsive` | `responsive` uses label/value columns, stacking below 32rem of available width; `horizontal` keeps columns; `stacked` always puts values below labels |
| `density` | `comfortable` | `comfortable` or `dense`; changes immediate Item spacing |
| `dividers` | true | Rules between immediate groups |

Every part accepts its native attributes, `className`, `style` and ref. Types are `DescriptionListProps`, `DescriptionListItemProps`, `DescriptionListTermProps` and `DescriptionListDetailProps`. Use a real `dt` before its `dd` values; the description list does not become a table or listbox. Group alternate names inside one Term when they share values. Native IDs and `aria-labelledby` remain available for richer relationships.

Values align to the same column across Items. Long labels, identifiers and composed `Status` text wrap, including chips with decorative icons; native links and controls retain their keyboard behavior. Use a deliberate stacked layout for narrow details, or override `--kb-descriptionlist-term-width` when the default 12rem label cap does not fit your labels. Other tokens control column/row gaps and comfortable/dense block padding. Nested lists keep their own layout and density.

Keep zero values visible. Write a meaningful unavailable value such as Not scheduled rather than silently omitting a required fact. Your app owns formatting, units, timezone, localization, loading, errors and announcements. Do not use term text as an input label; controls still need their own labels and relationships. A description list supplies native relationships, not interactive field validation.

## Related components

Use [`Table`](Table.md) for comparing fields across records, [`CollectionRow`](CollectionRow.md) for summarizing records with actions, and [`Status`](Status.md) for an explicit state. See [Structured data](../../../../docs/guides/structured-data.md) for choosing and composing these patterns.
