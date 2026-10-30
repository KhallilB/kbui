# Structured data

Choose structure from the task, then keep labels, values and actions consistent across layouts.

| Task | Component | Semantics and behavior |
|---|---|---|
| Compare the same fields across records | [`Table`](../../packages/react/docs/components/Table.md) | Native table with row/column headers, controlled sorting, selection, independent actions and bounded sticky layouts |
| Scan labeled facts about one record | [`DescriptionList`](../../packages/react/docs/components/DescriptionList.md) | Native description list with aligned key/value columns that stack in narrow parents |
| Scan records with different amounts of detail | [`CollectionList`](../../packages/react/docs/components/CollectionList.md) and [`CollectionRow`](../../packages/react/docs/components/CollectionRow.md) | Native list/items with aligned names, leading content, descriptions, metadata and independent actions |

For an integrated search, pagination and bulk-action workflow, use [`Collection`](../../packages/react/docs/components/Collection.md). Its `useCollection` hook can own state for custom `CollectionList`/`CollectionRow` presentations; these primitives retain presentation and native semantics.

Use an explicit table caption or `aria-labelledby` for comparison data. Keep a fixed external title outside `Table.ScrollContainer`; column headers stay visible vertically and move horizontally with their data. Use genuine column comparison instead of styling arbitrary lists as tables.

For record details, group one `DescriptionList.Term` with its `DescriptionList.Detail` values inside an Item. Keep labels before values in DOM order. Show units and useful unavailable values, preserve zero values, and format dates/numbers for the audience. A visible zero means something different from missing data.

For collections, keep each title meaningful and use a `Link` for navigation. Put `Checkbox` selection in leading and Buttons or `Menu` in actions; the row itself adds no competing click behavior. Actions need record-specific names. Selection belongs to stable record IDs, and app policy defines eligibility and select-all scope. Use disabled controls to explain unavailable actions and keep useful status in text.

## Compose comparison and record details

```tsx
import "@kb.ui/react/styles.css";
import { CollectionList, CollectionRow, DescriptionList, Heading, Link, Status, Table } from "@kb.ui/react";

const projects = [
  { id: "portal", name: "Customer portal", owner: "Ada Chen", tasks: 0 },
  { id: "search", name: "Search improvements", owner: "Lin Patel", tasks: 8 },
];

export function Example() {
  return (
    <>
      <Heading level={2}>Compare projects</Heading>
      <Table.ScrollContainer label="Project workload scroll area">
        <Table>
          <Table.Caption>Project workload</Table.Caption>
          <Table.Head><Table.Row><Table.ColumnHeader>Project</Table.ColumnHeader><Table.ColumnHeader>Owner</Table.ColumnHeader><Table.ColumnHeader align="end">Open tasks</Table.ColumnHeader></Table.Row></Table.Head>
          <Table.Body>{projects.map((project) => <Table.Row key={project.id}><Table.RowHeader>{project.name}</Table.RowHeader><Table.Cell>{project.owner}</Table.Cell><Table.Cell align="end">{project.tasks}</Table.Cell></Table.Row>)}</Table.Body>
        </Table>
      </Table.ScrollContainer>
      <Heading level={2}>Scan project details</Heading>
      <CollectionList aria-label="Project records">
        {projects.map((project) => <CollectionRow
          key={project.id}
          title={<Link href={`/projects/${project.id}`}>{project.name}</Link>}
          metadata={<Status>In review</Status>}
          description={<DescriptionList layout="stacked" density="dense" dividers={false}>
            <DescriptionList.Item><DescriptionList.Term>Owner</DescriptionList.Term><DescriptionList.Detail>{project.owner}</DescriptionList.Detail></DescriptionList.Item>
            <DescriptionList.Item><DescriptionList.Term>Open tasks</DescriptionList.Term><DescriptionList.Detail>{project.tasks}</DescriptionList.Detail></DescriptionList.Item>
          </DescriptionList>}
        />)}
      </CollectionList>
    </>
  );
}
```

## Preserve scanning and interaction

`DescriptionList` and `CollectionList` respond to their available parent width. Label/value pairs stack below 32rem; collection metadata/actions stack below 40rem. Long labels and values wrap without changing DOM reading order. Align quantities consistently in `Table`, keep units in headings or visible values, and avoid using color alone for status. Customize slot widths through component tokens when the default label, leading or aside columns do not fit the content.

Apps own records, filtering, requests, pagination and formatting. Keep filter controls mounted during updates, announce result changes through a concise status message, and mark pending content with `aria-busy`. Put the status outside a busy subtree. Empty results need recovery guidance; errors need a useful explanation and a separately named retry action. Neither `CollectionList` nor `Table` fetches data or virtualizes rows.

Verify narrow parents, zoom, long translations, light/dark themes, forced colors and Tab/Shift+Tab through navigation, selection and actions. Keep the table title visible, headers aligned with values, and focus exposed beside sticky surfaces. Use the [accessibility procedure](accessibility.md) for screen-reader and complete-task checks. Automated tests establish the named fixtures, not complete-page conformance.
