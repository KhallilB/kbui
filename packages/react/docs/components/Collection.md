# Collection

Work through record sets using search, facet filters, sortable columns, page selection, pagination and bulk actions. `Collection` composes a native table and kbui controls. `useCollection` provides the same state contract for custom cards or lists. `Collection.Pagination` and `Collection.BulkActions` also work independently.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-collection--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Collection } from "@kb.ui/react";
import { useState } from "react";

type Project = { id: string; name: string; status: string };
const initial: Project[] = [
  { id: "web", name: "Website refresh", status: "Active" },
  { id: "help", name: "Help center", status: "Paused" },
];

export function Projects() {
  const [items, setItems] = useState(initial);
  return (
    <Collection
      label="Projects"
      items={items}
      getKey={item => item.id}
      getItemLabel={item => item.name}
      columns={[
        { key: "name", header: "Project", cell: item => item.name,
          compare: (a, b) => a.name.localeCompare(b.name) },
        { key: "status", header: "Status", cell: item => item.status },
      ]}
      matches={(item, query, filters) =>
        item.name.toLowerCase().includes(query.toLowerCase()) &&
        (!filters.status || item.status === filters.status)}
      filters={[{ key: "status", label: "Status", options: [
        { value: "Active", label: "Active" },
        { value: "Paused", label: "Paused" },
      ] }]}
      bulkActions={[{ key: "archive", label: "Archive", onAction: async keys => {
        setItems(current => current.filter(item => !keys.includes(item.id)));
      } }]}
    />
  );
}
```

## More examples

- [Large collection](https://kbui.kcb.pro/storybook/?path=/story/components-collection--large-collection): Search and filter 120 records; paused records cannot be selected.
- [Server pagination](https://kbui.kcb.pro/storybook/?path=/story/components-collection--server-pagination): Controlled state with application-owned data processing.
- [Empty](https://kbui.kcb.pro/storybook/?path=/story/components-collection--empty), [loading](https://kbui.kcb.pro/storybook/?path=/story/components-collection--loading), and [fetch error](https://kbui.kcb.pro/storybook/?path=/story/components-collection--fetch-error): Explicit result states.
- [Bulk failure](https://kbui.kcb.pro/storybook/?path=/story/components-collection--bulk-failure): Selection survives rejection so users can retry.

## Reference

### Collection props

| Prop | Type | Default | Contract |
| --- | --- | --- | --- |
| `label` | `string` | required | Visible caption and accessible region name |
| `items` | `readonly T[]` | required | Complete dataset in client mode; current response page in server mode |
| `getKey` | `(item: T) => string` | required | Unique stable record ID; duplicates in supplied rows throw |
| `getItemLabel` | `(item: T) => string` | required | Meaningful accessible checkbox name |
| `columns` | `readonly CollectionColumn<T>[]` | required | Ordered unique keys, string headers and cell renderers |
| `mode` | `client` / `server` | `client` | Server mode skips all local filtering, sorting and slicing |
| `totalItems` | `number` | client derives it | Required in server mode; known filtered total, non-negative safe integer |
| `matches` | `(item, query, filters) => boolean` | unset | Client predicate; also enables client search UI |
| `compare` | `(a, b, sort) => number` | column comparator | Optional hook-level comparison override; return ascending order |
| `filters` | `readonly CollectionFilter[]` | `[]` | Facet key, visible label and nonempty option values; empty string means All |
| `isItemDisabled` | `(item: T) => boolean` | unset | Prevent individual and page selection of ineligible supplied records |
| `state` / `onStateChange` | `CollectionState` / `(next) => void` | uncontrolled | Parent applies complete next state; suitable for URL or server ownership |
| `defaultState` | `Partial<CollectionState>` | see state table | Initial uncontrolled state; later changes do not reinitialize it |
| `selectable` | `boolean` | `true` | Show row/page checkboxes and selection actions |
| `bulkActions` | `readonly CollectionBulkAction[]` | `[]` | Unique key, label, `onAction(keys)`, optional disabled flag |
| `loading` | `boolean` | `false` | Mark busy, suppress stale rows and disable workflow controls |
| `error` | `ReactNode` | unset | Fetch failure alert, suppress rows and disable workflow controls |
| `empty` | `ReactNode` | `No matching records` | Zero-result content; include a useful next step |
| `toolbar` | `ReactNode` | unset | Extra application-owned controls, retry or creation actions |
| `className`, `style`, `ref` | native section props | unset | Root customization and element reference |
| `classNames` | slot classes | unset | `toolbar`, `filters`, `viewport`, `table`, `caption`, `head`, `cell`, `row`, `empty`, `status`, `bulk`, `pagination` |

A column has `key`, `header`, `cell(item)`, optional ascending `compare(a, b)`, and optional `sortable` for server-only sort requests. Sorting cycles ascending, descending, input order. Ties preserve supplied order. Sorting never mutates the supplied array. Search and facet interpretation belong to `matches`; kbui does not guess text from rendered React nodes. Server mode always exposes search and emits its value unchanged.

### State and transitions

| State field | Default | Transition contract |
| --- | --- | --- |
| `query` | `""` | `setQuery` resets page to one and clears selection |
| `filters` | `{}` | `setFilter(key, value)` preserves other facets, resets page and clears selection |
| `sort` | `null` | `{ key, direction: "ascending" or "descending" }`; `setSort` resets page, preserves selection |
| `page` | `1` | One-based positive safe integer; effective page clamps when results shrink |
| `pageSize` | `10` | Positive safe integer; `setPageSize` resets page and preserves selection |
| `selectedKeys` | `[]` | Explicit unique IDs; never an implicit selection of every remote result |

Client mode processes records in this order: predicate, stable comparison, page slice. Removed or newly disabled IDs disappear from effective selection. Server mode preserves off-page IDs; eligibility for unseen records remains the application’s responsibility. Both modes remove disabled IDs present in the current response. Zero results have one empty page. Invalid counts, pages and sizes throw `RangeError` rather than emitting broken navigation.

`state` is controlled when supplied. Each controlled proposal starts from the latest accepted props; a rejected proposal cannot affect a later interaction. Combine coordinated controlled changes in the parent before applying one next state. Uncontrolled commands in one event compose sequentially, including derived page bounds and page selection. Retained methods consult the latest committed dataset, eligibility rules, callbacks and accepted state, so asynchronous completion removes only its submitted IDs. Rendered state remains owned by the parent until it accepts `onStateChange`. Normalized selection and clamped page never trigger `onStateChange` during data refresh; the next user transition emits normalized state. Uncontrolled state retains those corrections so deleted/reintroduced IDs stay deselected and growing datasets do not restore an obsolete page. Controlled parent stores should reconcile their canonical state when external data changes. Use immutable arrays/objects and stable IDs across refreshes.

### useCollection

Accepts `items`, `getKey`, `isItemDisabled`, `matches`, `compare`, `mode`, `totalItems`, `state`, `defaultState`, and `onStateChange`. It renders no DOM and performs no fetching or mutations.

| Result | Contract |
| --- | --- |
| `state`, `items`, `totalItems`, `pageCount` | Effective normalized state, visible rows and derived page metadata |
| `pageSelection` | `none`, `some`, or `all` among eligible current-page records |
| `selectableCount` | Eligible current-page record count |
| `setQuery`, `setFilter`, `setSort`, `setPage`, `setPageSize` | Apply transitions described above |
| `toggle(key, checked)` | Change selection for a supplied eligible record; unknown or disabled IDs are ignored |
| `selectPage(checked)` | Add/remove eligible page IDs while preserving off-page IDs |
| `clearSelection()` | Clear all selected IDs |
| `removeSelection(keys)` | Remove only specified IDs, suitable for successful submitted snapshots |

For a custom list, reuse the controller and compound controls:

```tsx
import "@kb.ui/react/styles.css";
import { Checkbox, Collection, useCollection } from "@kb.ui/react";
import { useState } from "react";

export function RecordList() {
  const [items, setItems] = useState([
    { id: "web", name: "Website refresh" },
    { id: "help", name: "Help center" },
  ]);
  const [pending, setPending] = useState(false);
  const collection = useCollection({ items, getKey: item => item.id });
  return (
    <section aria-label="Project list">
      <ul>
        {collection.items.map(item => (
          <li key={item.id}>
            <Checkbox label={item.name} disabled={pending}
              checked={collection.state.selectedKeys.includes(item.id)}
              onCheckedChange={checked => collection.toggle(item.id, checked)} />
          </li>
        ))}
      </ul>
      <Collection.BulkActions selectedKeys={collection.state.selectedKeys}
        onClear={collection.clearSelection} onSuccess={collection.removeSelection}
        onPendingChange={setPending} actions={[{ key: "archive", label: "Archive",
          onAction: keys => setItems(current => current.filter(item => !keys.includes(item.id))) }]} />
      <Collection.Pagination page={collection.state.page}
        pageSize={collection.state.pageSize} totalItems={collection.totalItems}
        onPageChange={collection.setPage} disabled={pending} />
    </section>
  );
}
```

### Standalone controls

| Component | Required props | Optional props and behavior |
| --- | --- | --- |
| `Collection.Pagination` | `page`, `pageSize`, `totalItems`, `onPageChange` | `onPageSizeChange`, `pageSizes` (10, 25, 50), `disabled`, native nav props/ref. Includes current page size, emits bounded page requests; caller resets page when size changes. |
| `Collection.BulkActions` | `selectedKeys`, `actions`, `onClear` | `onSuccess(keys)`, `onPendingChange(boolean)`, `disabled`, native `fieldset` props/ref. Caller owns selection; omitted `onSuccess` preserves it. |

### Bulk-action boundary

Actions receive a copied, deduplicated ID array captured at submission. Selection counts use the same distinct IDs. Buttons remain mounted during selection changes. Empty selections and disabled actions cannot submit; an immediate lock prevents repeated submission before React rerenders. Pending actions disable other workflow controls in `Collection`. Success handlers come from the latest committed render; suspended renders cannot replace an active operation’s handler. A resolved operation removes only submitted IDs; a rejected operation announces a generic failure and retains selection. Clear selection dismisses the displayed failure.

Applications own permission checks, destructive confirmation, server authorization, cancellation, idempotency, optimistic updates, undo, auditing and focus recovery after record removal. A resolved promise means the complete snapshot succeeded. For partial success, reconcile affected records and selection in controlled state and reject or show application-specific detail; kbui does not infer partial outcomes. Do not automatically retry mutations. Avoid changing dataset identity while an action is pending; remount with a different React key when switching collections.

### Server ownership

Supply controlled state, `mode="server"`, the current response’s rows and its filtered `totalItems`. Apply emitted query, facets, sort and page to your request. Keep `loading` true while rows belong to a previous request. Cancel or discard stale responses, reconcile out-of-range pages after deletions, and expose fetch failures with `error` and a retry action through `toolbar`. Map column sort keys to an explicit server allowlist. Validate IDs and permissions again at mutation time, including off-page records.

Offset pagination requires a known total. Cursor paging, unknown totals, all-matching remote selection, virtualization, column resizing, drag ordering and spreadsheet grid navigation are outside this API. Use bounded server pages for large remote datasets; client mode processes the entire supplied array and has no benchmark-backed dataset-size guarantee.

### Styling and accessibility

Override `--kb-collection-gap`, `--kb-collection-cell-padding`, `--kb-collection-radius`, `--kb-collection-border`, `--kb-collection-header-background`, and `--kb-collection-selected-background`, and `--kb-collection-table-min-width` (36rem) on a subtree. Partial CSS imports also need `Button`, `Checkbox`, `Input` and `Select` styles. CSS provides layout and visual states; a non-React renderer owns every state transition and ARIA relationship.

Filters and page-size controls use the shared `Select` theme, keyboard navigation, option indicators and focus recovery. Labels sit above fields; filter fields wrap and pagination buttons stay grouped, with long page counts wrapping within the available width.

Native table semantics, `aria-sort`, mixed checkboxes, named pagination, polite statuses and failure alerts expose workflow state. Tab moves between controls; Space toggles checkboxes; Enter/Space activate buttons. The named table viewport is keyboard focusable for horizontal scrolling. Controls wrap on narrow screens; tabular content can scroll independently. Selection remains explicit in checkbox state in forced colors.

Verify the full search, sort, select-across-pages, submit, failure and retry journey with keyboard and a supported screen reader. Check 320 CSS pixels, enlarged text, both themes and forced colors. Automated stories cover their fixtures; manual screen-reader announcement and complete-page WCAG conformance remain unverified. Follow the [shared accessibility verification procedure](../../../../docs/guides/accessibility.md).

## Related components

Use [`Grid`](Grid.md) for static card layout, [`Checkbox`](Checkbox.md) for independent choices, and [`MultiSelect`](MultiSelect.md) for choosing values rather than operating on records. Use [`Dialog`](Dialog.md) for application-owned confirmation and [`Toast`](Toast.md) for mutation outcomes outside the collection.
