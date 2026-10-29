# Table

Present related records with native table semantics, optional controlled sorting and selection, and independent row actions. Your app owns records, stable IDs, ordering, selection and requests.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-table--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Table, type TableSortDirection } from "@kb.ui/react";
import { useState } from "react";

const records = [{ id: "ada", name: "Ada Chen" }, { id: "lin", name: "Lin Patel" }];

export function Example() {
  const [direction, setDirection] = useState<TableSortDirection>("ascending");
  const [selected, setSelected] = useState<string[]>([]);
  const ordered = [...records].sort((a, b) => a.name.localeCompare(b.name) * (direction === "descending" ? -1 : 1));
  const selectedCount = records.filter((record) => selected.includes(record.id)).length;
  return (
    <>
      <p role="status">{selectedCount} people selected</p>
      <Table.ScrollContainer label="People scroll area" maxHeight="20rem">
        <Table density="dense" stickyHeader>
          <Table.Caption>People</Table.Caption>
          <Table.Head><Table.Row>
            <Table.ColumnHeader>
              <Table.SelectionCheckbox visuallyHidden label="Select all people" checked={selectedCount === records.length} indeterminate={selectedCount > 0 && selectedCount < records.length} onCheckedChange={(checked) => setSelected(checked ? records.map((record) => record.id) : [])} />
            </Table.ColumnHeader>
            <Table.ColumnHeader sortDirection={direction} onSortChange={setDirection}>Name</Table.ColumnHeader>
            <Table.ColumnHeader align="end">Actions</Table.ColumnHeader>
          </Table.Row></Table.Head>
          <Table.Body>{ordered.map((record) => (
            <Table.Row key={record.id} selected={selected.includes(record.id)}>
              <Table.Cell><Table.SelectionCheckbox visuallyHidden label={`Select ${record.name}`} checked={selected.includes(record.id)} onCheckedChange={(checked) => setSelected(checked ? [...selected, record.id] : selected.filter((id) => id !== record.id))} /></Table.Cell>
              <Table.RowHeader>{record.name}</Table.RowHeader>
              <Table.Cell><Table.RowActions><a href={`/people/${record.id}`}>View {record.name}</a></Table.RowActions></Table.Cell>
            </Table.Row>
          ))}</Table.Body>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}
```

## More examples

- [Sorting and selection](https://kbui.kcb.pro/storybook/?path=/story/components-table--sorting-and-selection): Numeric and text ordering, stable selected IDs, mixed selection and excluded rows.
- [Row actions](https://kbui.kcb.pro/storybook/?path=/story/components-table--sorting-and-selection): Named Buttons and Menu composition with focus return.
- [Dense and sticky](https://kbui.kcb.pro/storybook/?path=/story/components-table--dense-sticky): Bounded scrolling, sticky headers and a pinned first column.
- [Empty and loading](https://kbui.kcb.pro/storybook/?path=/story/components-table--empty-and-loading): Spanning feedback cells, busy body and separate status announcement.

## Reference

| Part | Native element | Purpose |
|---|---|---|
| `Table` | `table` | Named data table; forwards table attributes, children and ref |
| `Table.ScrollContainer` | `section` | Named focusable scroll region; `label` required, `maxHeight` optional CSS length |
| `Table.Caption` | `caption` | Visible table name; use a caption or native `aria-label`/`aria-labelledby` |
| `Table.Head`, `Table.Body`, `Table.Foot` | `thead`, `tbody`, `tfoot` | Native row groups; `aria-busy` may mark pending rows |
| `Table.Row` | `tr` | `selected` projects visual selection; checkbox communicates checked state |
| `Table.ColumnHeader` | `th`, optional `button` | Defaults `scope="col"`; controlled sorting and logical alignment |
| `Table.RowHeader` | `th` | Defaults `scope="row"`; supports grouped header scope override |
| `Table.Cell` | `td` | Native data cell; supports `colSpan`, `rowSpan`, children and ref |
| `Table.SelectionCheckbox` | Checkbox | Same required `label`, `checked`, `onCheckedChange`, optional `indeterminate`, `disabled`, `readOnly`, ref and slots as Checkbox |
| `Table.RowActions` | `div` | Wrapping, end-aligned actions; compose named Buttons, links or Menu |

| Prop | Applies to | Default | Behavior |
|---|---|---|---|
| `density` | Table | `comfortable` | `comfortable` or `dense`; controls cell spacing, preserves control targets |
| `layout` | Table | `auto` | `auto` or `fixed`; with fixed layout supply widths through native `colgroup`/`col` or styles |
| `stickyHeader` | Table | false | Pins the complete head, including grouped header rows, to the scroll boundary |
| `align` | Cell, ColumnHeader, RowHeader | `start` | Logical `start`, `center`, `end`; works with `dir="rtl"` |
| `sticky` | Cell, ColumnHeader, RowHeader | unset | Pins one `start` or `end` edge cell; match the same edge across rows |
| `sortDirection` | ColumnHeader | `none` | `none`, `ascending`, `descending`; explicit direction owns `aria-sort`, otherwise native `aria-sort` passes through |
| `onSortChange` | ColumnHeader | unset | Enables sort button; requests ascending from none, then toggles ascending/descending |
| `sortDisabled` | ColumnHeader | false | Disables sort button, preserves announced order |
| `classNames` | ColumnHeader | unset | Adds `sortButton`, `sortIcon` slot classes; root uses `className` |

Every part accepts its native element attributes, `style`, `className` and ref. The checkbox forwards its ref to the input. Public prop types follow `Table<Part>Props`; root uses `TableProps`, sorting uses `TableSortDirection`, shared cell options use `TableCellOptions`. The sort button is `type="button"`; sorting inside forms does not submit them. Put text and decorative content in sortable headers; nested interactive children would create invalid nested controls.

### Sorting and selection ownership

Sort a copy of your data or request server ordering. Keep the column and direction together; reset other headers to `none` so only one header announces an active sort. For server requests, handle stale responses in your app, keep applied order authoritative, set `sortDisabled` while pending, and announce progress through a status message outside an `aria-busy` body. Table does not mutate or fetch records. It does not implement multiple simultaneous sort keys.

Keep selection by stable ID rather than visible row index. Define whether select-all covers the current page, filtered results or all records; label that scope explicitly. Compute mixed/all state from eligible rows only, exclude disabled rows, and disable select-all when no rows are eligible. Decide how removed records and page changes affect selection. `Table.Row selected` provides styling; selection controls own the accessible state. Row actions have their own names and normal Tab order, and do not toggle selection implicitly.

### Layout and feedback

Place the table inside `Table.ScrollContainer` for horizontal overflow or a bounded vertical viewport. Its region is keyboard focusable; `maxHeight` limits height. On focus, the React container reveals controls hidden beneath sticky headers or pinned edges without moving keyboard focus. Keep enough free viewport space for the action; a pinned column wider than the viewport cannot expose adjacent cells. Supply a readable minimum table width with `style` when columns should scroll rather than wrap. A table can also render directly when page scrolling is sufficient. To keep the table title fixed on both scroll axes, render a Heading outside ScrollContainer and name the table through `aria-labelledby`, as in Dense and sticky. Native Table.Caption remains part of the scrollable table. Column headings stay fixed vertically with stickyHeader and scroll horizontally with their data columns.

Sticky edges support one cell on each edge. For several pinned columns, calculate non-overlapping offsets in your own styles; Table does not assign column offsets. Keep sufficient viewport space for unpinned cells. Header/body column widths must match. Set `dir="rtl"` on the application or ScrollContainer as well as the table when the scroll direction should follow RTL; the stories expose a direction control. Nested tables keep their own density and section surfaces. Native `colSpan`, `rowSpan`, `scope="colgroup"` and explicit `id`/`headers` relationships support grouped headers. Sticky and selected cell backgrounds stay opaque in both themes; restyled background tokens must remain opaque.

Render empty or error feedback in a row containing a `Table.Cell colSpan={columnCount}`; supply retry as a named Button if appropriate. Use a separate status for asynchronous updates. Table preserves semantic HTML and ordinary Tab navigation; arrow-key cell navigation, pagination, filtering, virtualization and record management remain app-owned. For very large sets, paginate in your app rather than assuming all rows are virtualized.

Adjust `--kb-table-cell-padding-block`, `--kb-table-cell-padding-inline`, `--kb-table-dense-padding-block`, `--kb-table-background`, `--kb-table-header-background`, `--kb-table-selected-background`, `--kb-table-border`, `--kb-table-radius` and `--kb-table-sort-target` through normal CSS. Keep focus visible and dense action targets usable. See [accessibility verification](../../../../docs/guides/accessibility.md) for manual keyboard, screen-reader, zoom, spacing and contrast checks. Automated stories do not establish screen-reader interoperability or page conformance.

## Related components

Use [DescriptionList](DescriptionList.md) for labeled facts about one record and [CollectionList](CollectionList.md) with [CollectionRow](CollectionRow.md) for records with variable details. The [Structured data guide](../../../../docs/guides/structured-data.md) compares these choices.

Use [Checkbox](Checkbox.md) for independent selection, [Menu](Menu.md) for overflow actions, [Button](Button.md) for immediate actions, and [Status](Status.md) for meaningful asynchronous feedback. Use [Grid](Grid.md) for visual page layout rather than tabular relationships.
