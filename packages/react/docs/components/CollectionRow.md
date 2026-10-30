# CollectionRow

Make one record easy to scan inside CollectionList. Compose its primary name, supporting detail, optional selection, metadata and independent actions.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-collectionrow--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, Checkbox, CollectionList, CollectionRow, Link, Status } from "@kb.ui/react";
import { useState } from "react";

export function Example() {
  const [selected, setSelected] = useState(false);
  const [message, setMessage] = useState("No action taken");
  return (
    <>
      <p role="status">{message}</p>
      <CollectionList aria-label="Projects">
        <CollectionRow
          title={<Link href="/projects/portal">Customer portal</Link>}
          description="Owned by Ada Chen"
          leading={<Checkbox label="Select Customer portal" visuallyHidden checked={selected} onCheckedChange={setSelected} />}
          metadata={<Status tone="success">Ready for review</Status>}
          actions={<Button variant="secondary" onClick={() => setMessage("Editing Customer portal")}>Edit portal</Button>}
          selected={selected}
        />
      </CollectionList>
    </>
  );
}
```

## More examples

- [Selection and actions](https://kbui.kcb.pro/storybook/?path=/story/components-collectionrow--selection-and-actions): Checkbox, primary navigation, independent Buttons, Menu focus return and disabled actions.
- [Long content](https://kbui.kcb.pro/storybook/?path=/story/components-collectionrow--long-content): Wrapping identifiers, metadata and action text.

## Reference

| Prop | Default | Behavior |
|---|---|---|
| `title` | required | Record name as a ReactNode; compose a Link or correctly ranked Heading when appropriate |
| `description` | unset | Supporting ReactNode, including DescriptionList or zero values |
| `leading` | unset | Avatar, decorative icon or a separately named selection control |
| `metadata` | unset | Status, formatted number, timestamp or other concise ReactNode |
| `actions` | unset | Named Buttons, links or Menu composition; controls keep their own semantics |
| `selected` | false | Visual state; a selection control owns accessible checked state |
| `classNames` | unset | Extra classes for `layout`, `leading`, `content`, `title`, `description`, `aside`, `metadata` and `actions` |

CollectionRow renders native `li`; place it inside CollectionList or another native list. Optional null, boolean and empty-string content omits its slot; numeric zero remains visible. Native list-item attributes, `className`, `style` and ref pass through. `CollectionRowProps` replaces the native title tooltip attribute with the required record title; use a Tooltip composition for contextual help. CollectionRow has no whole-row click handler, navigation destination or automatic focus stop. A link in title handles navigation; an action Button handles its own workflow. Independent actions do not toggle selection implicitly.

Keep a persistent, record-specific name on selection controls and actions. Hide decorative icons yourself, and supply meaningful alternative text for informative images. When content can be selected, keep `selected` consistent with Checkbox checked state; use stable IDs when filtering or sorting. Disable actual controls for unavailable operations rather than treating the whole row as disabled. A selected row is an ordinary list item, so CollectionRow does not emit grid/listbox `aria-selected` semantics.

CollectionList aligns optional leading and aside columns across rows. The defaults reserve at least 3rem for leading content and 12rem for an aside; wider leading media, or an aside that needs more room to keep metadata and actions on one line, widens its own row, so set `--kb-collectionrow-leading-width` and `--kb-collectionrow-aside-width` to your widest content to keep every title aligned. Set padding and gap with component tokens. Metadata and actions share one end-aligned line; when the row itself is narrower than 48rem, inside or outside a list, they stack beneath content in DOM order and stay end-aligned. Long labels and composed Status text wrap, including chips with decorative icons. Action Buttons retain size-based minimum heights while expanding for text. Dense list spacing does not shrink control targets. Standalone native lists do not provide CollectionList's shared responsive alignment; use the paired components for this behavior.

Your app owns loading, error text, formatting, focus after a removed record, and selection scope. Avoid nesting interactive controls inside the title link or making the whole list item act as another button. Verify keyboard order, responsive wrapping and focus in your actual composition; automated stories do not establish screen-reader interoperability or complete-page accessibility.

## Related components

Use [CollectionList](CollectionList.md) for a native record list, [DescriptionList](DescriptionList.md) for key/value details, [Table](Table.md) for comparison across columns, and [Menu](Menu.md) for overflow actions. See [Structured data](../../../../docs/guides/structured-data.md) for the shared decision guide.
