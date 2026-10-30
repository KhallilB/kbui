# ListDetail recipe

Find a site request, inspect its details and context, then edit its title, owner or status. This application-owned recipe composes public `@kb.ui/react` exports with native HTML and local CSS. Prepared locally; unreleased. It adds no package export. Use a package build that contains the documented component dependencies.

## Copy the complete flow

Copy [ListDetail.tsx](../../apps/storybook/recipes/ListDetail.tsx) and [list-detail.css](../../apps/storybook/recipes/list-detail.css) into one directory. Import `@kb.ui/react/styles.css` once at your application entry and render ListDetail in a browser. The recipe reads the current URL and requires a browser environment; integrate your router before using server rendering.

The website recipe page and Storybook expose the exact source files and runnable interaction examples. Optional `initialRequests` replaces the fictional queue; an empty array shows the empty-queue state. Optional `initialRequestId` selects a record on mount when the URL has no request parameter. Each record needs a unique ID, title, owner, status, summary, site, requester and activity. Status is Open, In progress or Resolved. The demo permits any of these choices; it implements no business transition policy.

## Composition and ownership

| Part | Composition and responsibility |
| --- | --- |
| Page introduction | [PageHeader](../../packages/react/docs/components/PageHeader.md) supplies the title, description and metadata |
| Request list | Panel, Input, Select and ordinary Button controls for application-owned selection; every row is a separate tab stop |
| Detail and supporting pane | One named Panel holds the request header, task and native aside; Split separates primary content from saved-record context |
| Edit form | Native form, [FormSection](../../packages/react/docs/components/FormSection.md), Input, Select and Button; labelled fields and first-error focus |
| Layout | Container, Grid, Inline, Split and local container-query CSS; source order remains list, detail, context |
| Feedback | Status includes visible status text; a separate polite status region announces saves and cancellations |

The application owns records, filters, URL selection, drafts and submission. Component implementations own their control behavior. This recipe imports only public package exports and its listed local files.

The queue stays compact while the selected request has the strongest title. One detail surface spans the request header, task and context rail; owner, site and requester appear once in that rail, with the latest activity below. Context uses smaller labels and a quiet dividing rule rather than another raised panel.

Spacing follows the shared token scale: 24px between major regions, 20px between form fields, 16px between queue controls, and 4px within queue metadata. Queue gutters use 16px; detail gutters use 24px on wider layouts and 16px on narrow layouts. The full-width header pairs the request ID and status with navigation, followed by the title and Edit action. In narrow headers, Edit moves below the title. Header and body content retain matching space around dividers. At the narrowest widths, form actions stack at full width in source order.

## Selection, navigation and narrow layouts

This standalone structural example uses public components for the detail and supporting regions. Copy the complete recipe above for selection, forms and application state.

```tsx
import "@kb.ui/react/styles.css";
import { Heading, Panel, Split, Text } from "@kb.ui/react";

export function RequestRegions() {
  return (
    <Panel aria-labelledby="request-title">
      <Panel.Header>
        <Heading level={2} id="request-title">Warehouse access</Heading>
      </Panel.Header>
      <Panel.Body>
        <Split ratio="wide-start" collapse="sm" align="start">
          <Text>Confirm visitor access with the site lead.</Text>
          <aside aria-labelledby="context-title">
            <Heading level={3} size="sm" id="context-title">Request context</Heading>
            <Text>North depot · Maya Chen</Text>
          </aside>
        </Split>
      </Panel.Body>
    </Panel>
  );
}
```

Search matches ID, title, owner and site without case sensitivity; the status filter combines with search. Clear filters resets both and focuses search. Filtering does not change the selected record. If Back returns to a filtered-out row, focus falls back to search. An empty queue has no invented creation action.

Selecting a row writes `request=<id>` to the current browser URL, preserves other URL parameters and focuses the detail heading. Browser Back and Forward read that parameter. Missing IDs show Request unavailable with a return action. In an embedded preview, selection belongs to the iframe URL; use the direct Storybook canvas URL to share a selected record. Production applications should replace this small history adapter with their router and accessible navigation contract.

Below 48rem of available recipe width, the selected detail replaces the list. Back to requests restores the originating row or search. At larger widths, list and detail share the screen. The recipe sets Split’s small collapse token to 38rem, stacking context below the task when its available width is narrower. The dividing rule moves above context when stacked. Hide context removes that aside; Show context restores it. Hiding context leaves the detail and edit form available.

## Editing and recovery

Edit request opens a prefilled form and focuses Request title. Title and owner reject empty or whitespace-only values. A rejected save keeps every draft value, describes the invalid fields and focuses the first error. Errors clear on the next valid submission. A successful save trims title and owner, updates list, detail and context together, announces the result and restores Edit request focus.

Drafts belong to record IDs. Switching records, returning to the list and changing themes retain unsaved values during the mounted session. The list marks records with an unsaved draft. Cancel editing discards only that record's draft, leaves saved data intact and restores Edit request focus. Context shows saved information while a draft is open.

Records and drafts live in memory. Reload retains URL selection but restores initial records and discards unsaved changes. No backend, authentication, durable storage, async loading or simulated network failure is represented. Replace the local save with application-owned persistence, pending/error feedback and server-side validation before using it for real requests.

## Verify the workflow

Run the [recipe stories](../../apps/storybook/recipes/ListDetail.stories.tsx) for keyboard selection and return focus, context visibility, validation, committed updates, retained drafts, cancellation, search/filter recovery, unavailable selection and empty data. Verify generated recipe source with the [source contract](../../apps/storybook/stories/list-detail-source.test.ts).

Check 320, 768 and 1280 CSS pixels in light and dark. Open the long international-shipment record and confirm all content wraps without horizontal page scrolling. Use keyboard alone to select, edit, reject a blank field, correct it and save; inspect focus after every step. Check history and reload through a direct canvas URL. In forced colors, selected rows retain a visible border and controls retain their focus indicators. Enlarge text and browser zoom, and confirm list/detail switching follows available space.

Automated stories include accessibility scans. Human screen-reader speech, physical devices and browser-chrome zoom remain unverified. With a screen reader, check queue names, selected-row state, heading focus, supporting-region name, field errors and save announcements. Automated scans do not establish complete-page conformance.
