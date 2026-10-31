# ListDetail recipe

Find a site request, inspect its details and context, then edit its title, owner or status. This application-owned recipe composes public `@kb.ui/react` exports with native HTML and local CSS. Prepared locally; unreleased. It adds no package export. Use a package build that contains the documented component dependencies.

## Copy the complete flow

Put these files in one directory:

<!-- generated:files -->

- [`ListDetail.tsx`](../../apps/storybook/recipes/ListDetail.tsx)
- [`flow-router.ts`](../../apps/storybook/recipes/flow-router.ts)
- [`list-detail.css`](../../apps/storybook/recipes/list-detail.css)

<!-- /generated -->

Import `@kb.ui/react/styles.css` once at your application entry and render ListDetail in a browser. The recipe reads the current URL and requires a browser environment; integrate your router before using server rendering.

The website recipe page and Storybook expose the exact source files and runnable interaction examples. The live `requests` prop replaces the fictional queue; an empty array shows the empty-queue state. Optional `initialRequestId` selects a record on mount when the URL has no request parameter. Each record needs a unique ID, title, owner, status, summary, site, requester and activity. Status is Open, In progress or Resolved. The demo permits any of these choices; it implements no business transition policy.

| Prop | Use |
| --- | --- |
| `requests` | Current request records; defaults to the sample collection. |
| `initialRequestId` | Open a record on mount when the router reads `null`. |
| `router` | Preview application-owned `FlowRouter`; defaults to the `request` URL parameter. |
| `commit` | Async saving function receiving the record ID and trimmed `RequestDraft`. |
| `validate` | Return field errors before saving; defaults to required title and owner. |
| `copy` | Override visible text and announcements from `listDetailCopy`. |

Pass updated records through `requests`; matching IDs retain selection and drafts. A new record object replaces that record's local saved overlay, so supply confirmed server data when acknowledging an update. A removed selected record shows the unavailable state.

A custom router implements `read`, `write` and `subscribe` from [`flow-router.ts`](../../apps/storybook/recipes/flow-router.ts). Return `null` for an empty selection and return an unsubscribe function from `subscribe`. Keep the router object stable. This router seam may change before 1.0. With a supplied router, selection uses its methods rather than writing the URL directly.

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

Selecting a row writes `request=<id>` to the current browser URL, preserves other URL parameters and focuses the detail heading. Selecting the open row again focuses the heading without adding a history entry. Browser Back and Forward read that parameter; Back to the list focuses the row of the record you left, or search if that row is filtered out. Missing IDs show Request unavailable with a return action. In an embedded preview, selection belongs to the iframe URL; use the direct Storybook canvas URL to share a selected record. Production applications should replace this small history adapter with their router and accessible navigation contract.

Below 48rem of available recipe width, the selected detail replaces the list. If resizing hides the focused list control, focus moves to the selected detail heading. Resizing keeps visible edit-field focus and draft values intact. Back to requests restores the originating row or search. At larger widths, list and detail share the screen. The recipe sets Split’s small collapse token to 38rem, stacking context below the task when its available width is narrower. The dividing rule moves above context when stacked. Hide context removes that aside; Show context restores it. Hiding context leaves the detail and edit form available.

## Editing and recovery

Edit request opens a prefilled form and focuses Request title. Title and owner reject empty or whitespace-only values. A rejected save keeps every draft value, describes the invalid fields and focuses the first error. Errors clear on the next valid submission. A successful save trims title and owner, updates list, detail and context together, announces the result (again, even when it repeats) and restores Edit request focus.

Drafts belong to record IDs. Switching records, returning to the list and changing themes retain unsaved values during the mounted session. The list marks records with an unsaved draft. Cancel editing discards only that record's draft, leaves saved data intact and restores Edit request focus. Context shows saved information while a draft is open.

Records and drafts live in memory. Reload retains default URL selection but restores supplied records and discards unsaved changes. The default `commit` settles locally. Your application owns persistence, authentication, data loading and durable storage.

### Connect saving

Pass `commit` with this signature. `RequestDraft` and `CommitResult` are exported from the copied source:

```ts
import type { CommitResult, RequestDraft } from "./ListDetail";

type CommitRequest = (id: string, draft: RequestDraft) => Promise<CommitResult<keyof RequestDraft>>;
```

The recipe trims title and owner before calling `validate`. A custom validator returns errors keyed by `title`, `owner` or `status`, or `{}` for valid input. Invalid input keeps the draft, describes each rendered field and focuses the first invalid field without committing.

While `commit` is pending, duplicate submission is blocked and focus moves to the detail heading as controls lock. Resolve without errors to apply the local edit, clear its draft and focus Edit request. Resolve with `{ errors: { title: message } }` to retain the draft and use the same validation recovery as client errors. Errors for unrendered fields appear separately and focus Save changes. Reject to retain the draft, show and announce a failure Callout separately from field descriptions, and focus Request title.

If a commit settles after navigation, it updates its original record without moving focus. Failed drafts and errors remain available when you return. Pass confirmed data through `requests`; a new record object replaces the local saved overlay. Use `copy` to replace the recipe's labels and announcements.

## Task policy you can change

These task choices are constants in the copied source, not props. Change them in your copy.

<!-- generated:policy -->

| Policy | Value |
| --- | --- |
| List and detail share the row from | `48rem` of recipe width |
| Context on first open | Shown |
| A commit | Edits the record |

<!-- /generated -->

## Flow guarantees

The [flow contract stories](../../apps/storybook/stories/list-detail-flow/ListDetail.stories.tsx) check these rules in a browser against kbui's copy. After you change flow code in your copy, check them yourself.

<!-- generated:flow-guarantees -->

### Focus

- Opening a record focuses its heading
- An unknown record id focuses the unavailable heading
- Reselecting the open record focuses its heading without a history entry
- Back returns focus to the row that opened the record
- Back focuses search when the opening row is filtered out

### Navigation and history

- Browser Back and Forward restore the row and heading of the latest record
- Narrowing to one pane moves focus from the hidden list to the heading
- The selection parameter follows the open record and keeps other parameters
- An empty selection parameter shows the list, not an unavailable record
- A resize that leaves the focused field visible keeps its focus and draft
- The context aside shows on first open exactly when the policy says open
- Navigation goes only through the router seam: one write per change, none for the open id, and the URL is untouched

### Editing and commits

- Drafts stay with their record across navigation; discard restores the original
- An invalid commit keeps the value, focuses the field and describes the error
- A repeated identical outcome is announced again
- A validation error describes the field and makes no commit; a commit failure shows visibly and never in the field's description

### Lists

- Only the open record's row carries aria-current
- Filters persist, keep the open record open, and Clear focuses search
- The current-row cue stays distinct from focus in forced colors

### Pending commits

- A commit settling after navigation sends once and leaves focus where the user is
- Focus stays on an enabled control while a commit is pending
- Unmounting while a commit is pending causes no error, and a remount shows no stale pending state

### Live data

- Records that change after mount are matched by id: the open record and drafts survive, a server echo shows once, and removing the open record shows it unavailable

<!-- /generated -->

## Verify the workflow

Run the [recipe stories](../../apps/storybook/recipes/ListDetail.stories.tsx) for keyboard selection and return focus, context visibility, validation, committed updates, retained drafts, cancellation, search/filter recovery, unavailable selection and empty data. Verify generated recipe source with the [source contract](../../apps/storybook/stories/list-detail-source.test.ts). The [flow contract stories](../../apps/storybook/stories/list-detail-flow/ListDetail.stories.tsx) check the rules shared with other list-and-detail recipes. Run the [responsive focus stories](../../apps/storybook/stories/RequestLayout.stories.tsx) for wide-to-narrow focus recovery, draft retention and filtered-row return focus.

Check 320, 768 and 1280 CSS pixels in light and dark. Open the long international-shipment record and confirm all content wraps without horizontal page scrolling. Use keyboard alone to select, edit, reject a blank field, correct it and save; inspect focus after every step. Check history and reload through a direct canvas URL. In forced colors, selected rows retain a visible border and controls retain their focus indicators. Enlarge text and browser zoom, and confirm list/detail switching follows available space.

Automated stories include accessibility scans. Human screen-reader speech, physical devices and browser-chrome zoom remain unverified. With a screen reader, check queue names, selected-row state, heading focus, supporting-region name, field errors and save announcements. Automated scans do not establish complete-page conformance.
