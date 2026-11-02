# ListDetail recipe

Find a site request, inspect its details and context, then edit its title, owner or status. This recipe composes public `@kb.ui/react` exports with native HTML and local CSS.

Copy it into your app; it is not a package export.

## Use when

- People choose one record from a list and change its saved fields in place.
- The list, the open record, its edit form and its context belong on one screen, and the open record belongs in the URL.
- A save can be rejected or fail, and people must get their draft back with the reason.

## Use instead

| Need | Use | What separates it |
| --- | --- | --- |
| Add a reply or note to a record rather than change its fields | [Inbox](https://kbui.kcb.pro/recipes/?recipe=inbox) | Inbox appends to the open record; ListDetail replaces its fields. |
| Compare, sort, filter or bulk-edit many records | [`Collection`](https://kbui.kcb.pro/components/?component=collection) | The work happens across rows, not inside one open record. |
| One main task with context beside it, and no list to choose from | [`SupportingPane`](https://kbui.kcb.pro/components/?component=supportingpane) | No selection, routing or per-record drafts. |
| Preferences or account settings in sections | [`Settings`](https://kbui.kcb.pro/components/?component=settings) | Each section saves on its own; there is no record list. |

## Copy the files

Put these files in one folder. Inbox uses the same `flow-router.ts`; copy it once.

<!-- generated:files -->

- [`ListDetail.tsx`](https://kbui.kcb.pro/recipes/?recipe=listdetail#recipe-source)
- [`flow-router.ts`](https://kbui.kcb.pro/recipes/?recipe=listdetail#recipe-source)
- [`list-detail.css`](https://kbui.kcb.pro/recipes/?recipe=listdetail#recipe-source)

<!-- /generated -->

Import `@kb.ui/react/styles.css` once at your app entry and render `<ListDetail />` in a browser. With no props it shows sample requests, keeps the open request in the `request` URL parameter and saves to memory for the session.

Each source file starts with a comment naming the recipe, the oldest `@kb.ui/react` it works with and this guide; `needs @kb.ui/react ≥ 0.12.0` means install 0.12.0 or later. Keep it. The version is the oldest npm release that has every package export the recipe uses. It is a requirement, not a record of when you copied the file: copies taken at different times can name the same version. To compare your copy with upstream, diff it against the same file at a release's Git tag, such as `v0.12.0`, or on `main`.

## What you supply

Every prop is optional. A seam marked preview works and is documented, but its name or shape may change in a release before 1.0, without the old name kept as an alias. Release notes name every such change.

| Prop | Default | Use |
| --- | --- | --- |
| `requests` | Sample requests | Your records. Pass `[]` for the empty queue. Changes after mount are matched by `id`. |
| `loading` (preview) | `false` | Pass `true` while records are still arriving. |
| `initialRequestId` | `null` | Opens a record on mount when the router has none. |
| `router` (preview) | `searchParamRouter("request")` | Reads, writes and watches the open record id. |
| `commit` (preview) | Saves the draft in memory | Saves a draft for one record. |
| `validate` (preview) | Title and owner are required | Checks a draft before `commit`. |
| `copy` (preview) | `listDetailCopy` | Replaces any visible string or announcement. |
| `landmark` (preview) | `true` | Pass `false` when your app shell already renders `<main>`. |
| `header` (preview) | `true` | Pass `false` when your app shell already renders the page `<h1>`. Save announcements stay available to screen readers. |

Each record needs a unique `id`, a `title`, `owner`, `status` (`Open`, `In progress` or `Resolved`), `summary`, `site`, `requester` and `activity`. The recipe permits any status change; it has no transition policy. Search matches ID, title, owner and site, ignoring case, and combines with the status filter.

The seams share one shape across list-and-detail recipes. `ListDetail.tsx` exports `RequestRecord`, `RequestDraft`, `CommitResult` and `listDetailCopy`; `flow-router.ts` exports `FlowRouter` and `searchParamRouter`, plus the commit, announcement and focus helpers both flow recipes share.

```ts
type RequestDraft = { title: string; owner: string; status: RequestStatus };
// `form` carries an error no field owns, such as a refused permission.
type CommitResult<Field extends string> = void | { errors: Partial<Record<Field | "form", string>> };

type FlowRouter = {
  read(): string | null; // an empty value reads as null
  write(id: string | null): void; // pushes one history entry
  subscribe(onChange: () => void): () => void;
};
```

Connect your API through `commit`. Resolve with nothing on success, resolve with `{ errors }` when your server rejects fields, and reject when the save fails. Put an error that no field owns under `form`:

```tsx
import { ListDetail, type RequestRecord } from "./ListDetail";
import type { FlowRouter } from "./flow-router";

function RequestQueue({ requests, router }: { requests: RequestRecord[]; router: FlowRouter }) {
  return (
    <ListDetail
      requests={requests}
      router={router}
      commit={async (id, draft) => {
        const response = await fetch(`/api/requests/${id}`, {
          method: "PATCH",
          body: JSON.stringify(draft),
        });
        if (response.status === 403) return { errors: { form: "You can't edit this request." } };
        if (response.status === 422) return { errors: await response.json() };
        if (!response.ok) throw new Error(`Save failed: ${response.status}`);
      }}
      copy={{ title: "Site requests" }}
    />
  );
}
```

To use your app's router, pass a `FlowRouter` that maps the open id to your route, and keep the same router object across renders. `subscribe` returns an unsubscribe function. The recipe writes once per change and never writes the id that is already open. `subscribe` must call `onChange` for changes from outside the recipe, such as Back and Forward. Calling it for the recipe's own `write` is optional: the recipe reads the id on every call and ignores the one already open, so both behave the same. `searchParamRouter` does not notify for its own writes; `stateRouter` below does. When your app has no URL routing, such as a desktop shell or an embedded pane, keep the open id in memory or app state:

```ts
import type { FlowRouter } from "./flow-router";

function stateRouter(initial: string | null = null): FlowRouter {
  let current = initial;
  const listeners = new Set<() => void>();
  return {
    read: () => current || null,
    write(id) {
      current = id || null;
      for (const listener of listeners) listener();
    },
    subscribe(onChange) {
      listeners.add(onChange);
      return () => {
        listeners.delete(onChange);
      };
    },
  };
}
```

`copy` is merged over `listDetailCopy`, so pass only the strings you change; functions such as `savedNotice(id)` build announcements.

Without `commit`, the defaults describe the in-memory demo: a "Local demo · Session only" status, a form hint that changes stay in this browser session and "for this session" in the saved announcement. Once you pass `commit` they are neutral, and `idle` is empty, so no status shows before the first outcome. `invalidNotice(id, errors)` receives the errors: by default it says the request needs changes when a field has an error, and that it was not saved otherwise. `loading` labels the list and a waiting record.

## Business logic

Title and owner are trimmed before `validate` and `commit` see them.

| Outcome | Meaning | What the recipe does |
| --- | --- | --- |
| `validate` returns errors | Client validation failed | Keeps the draft, describes each invalid field and focuses the first one. `commit` is not called. |
| `commit` resolves field errors | Server validation failed | Same as client validation, and announces that the request needs changes. |
| `commit` resolves `{ errors: { form } }` | Refused for a reason no field owns, such as permissions | Keeps the draft, shows the error as the edit section's error, announces that the request was not saved with the error, and focuses Save changes. Any other key the form does not render is handled the same way. |
| `commit` rejects | Transport or server failure | Keeps the draft, shows a danger callout above Save changes, announces the failure with the request ID and focuses Request title. |
| `commit` resolves | Success | Applies the draft, clears it, announces the save and focuses Edit request if the record is still open. |
| Success after the user left the record | — | Updates that record without moving focus. |
| Failure after the user left the record | — | Keeps that record's draft and error, announces once with the request ID and shows the error when the record is reopened. Focus never moves. |

A field's description holds validation errors only; a failed save never appears there. While a save is pending, Save changes and Cancel are disabled, a second save of the same record is ignored and focus moves to the request heading. Cancel discards only that record's draft and error.

Pass `loading` while the first fetch, or a refetch, is in flight. While it is true and no records have arrived, the list shows `copy.loading` instead of a count or an empty state. A deep-linked record that has not arrived shows a loading placeholder instead of Request unavailable, and focus moves to its heading when it arrives.

Records can change after the recipe mounts. The recipe matches them by `id`: the open record stays open, drafts and pending saves stay with their record, and the list follows your order. A successful save is held locally until `requests` delivers a new object for that id; then your data wins, so a server echo never shows twice. If the open record is removed, the detail shows Request unavailable, its draft is discarded, and focus moves to that heading only if it was inside the removed content.

Keep a record that has not changed as the same object between updates. The recipe reads a new object for an id as your confirmed data and drops the save it holds for that record. If you rebuild every record on each update, for example with a plain `.map()` over server records, a save just made shows its old values when an unrelated record changes, until your data includes it. Reuse the previous object for an unchanged record, for example by caching mapped records per server record.

Your `commit` owns persistence, sign-in, permissions and conflicts. If a failure leaves the outcome unknown, check whether the change was saved before retrying.

## Task policy you can change

These task choices are constants in the copied source, not props. The width is the stylesheet's first `@container` query; context visibility and commit mode live in `ListDetail.tsx`.

<!-- generated:policy -->

| Policy | Value |
| --- | --- |
| List and detail share the row from | `48rem` of recipe width |
| Context on first open | Shown |
| A commit | Edits the record |

<!-- /generated -->

List-and-detail recipes share their flow guarantees and differ only in policy. Choose the width at which your list and record stop sharing the row, whether context helps people act on first open, and whether a commit edits the record or appends to it. [Inbox](https://kbui.kcb.pro/recipes/?recipe=inbox) makes the other choices for a reading task.

## Flow guarantees

The [flow contract stories](https://github.com/KhallilB/kbui/blob/main/apps/storybook/stories/list-detail-flow/ListDetail.stories.tsx) check these rules in a browser against kbui's copy. After you change flow code in your copy, check them yourself with the list under Check your changes.

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
- The context aside shows on the session's first open exactly when the policy says open; its toggle then holds for the session
- Navigation goes only through the router seam: one write per change, none for the open id, and the URL is untouched
- Embedded in an app shell, the recipe adds no main landmark or page heading

### Editing and commits

- Drafts stay with their record across navigation; discard restores the original
- An invalid commit keeps the value; an error on a rendered field focuses and describes that field
- A repeated identical outcome is announced again
- A validation error describes the field and makes no commit; a commit failure shows visibly and never in the field's description
- A commit error no field owns keeps the draft, shows beside the submit control and focuses it, and is not announced as needing changes

### Lists

- Only the open record's row carries aria-current
- Filters persist, keep the open record open, and Clear focuses search
- The current-row cue stays distinct from focus in forced colors

### Pending commits

- A commit settling after navigation sends once and leaves focus where the user is
- While a commit is pending, focus moves to the record heading and never rests on a disabled control
- Unmounting while a commit is pending causes no error, and a remount shows no stale pending state

### Live data

- Records that change after mount are matched by id: the open record and drafts survive, a server echo shows once, and removing the open record shows it unavailable
- While records load, a deep link shows neither an unavailable record nor an empty list, then focuses the record once it arrives
- A refetch that omits the open record while loading keeps its draft, errors and focus; still missing once loading ends, it shows unavailable
- A refetch that removes the focused row while loading moves focus to search, where it stays when the rows return
- A refetch announces the record count once, after loading ends

<!-- /generated -->

## Customising the look

The recipe composes package components: [PageHeader](https://kbui.kcb.pro/components/?component=pageheader) for the page introduction, `Panel`, `Split`, `Grid` and [`Inline`](https://kbui.kcb.pro/components/?component=inline) for the regions, and [FormSection](https://kbui.kcb.pro/components/?component=formsection) with `Input` and `Select` for the edit form. `Inline` takes `as`, `gap`, `align` and `justify`; it always wraps, so it has no `wrap` prop. Their own tokens and props restyle them.

Restyle with tokens before changing rules. `list-detail.css` reads spacing from `--kb-space-*`, rules from `--kb-color-border`, secondary text from `--kb-color-muted` and `--kb-text-small-size`, the selected row from `--kb-color-accent` and `--kb-panel-background-active`, and the request ID from `--kb-font-mono`. Set a token on `.list-detail` to change it for this recipe only.

Every list-and-detail recipe names the same five region parts, so a restyle written for one carries over to the other:

| Part | Class | Element |
| --- | --- | --- |
| List | `.list-detail-list` | Request queue panel |
| Detail | `.list-detail-detail` | Open request panel |
| Context | `.list-detail-context` | Request context aside |
| Status | `.list-detail-status` | Visible save failure |
| Composer | `.list-detail-composer` | Edit form |

Line 1 of `list-detail.css` lists every class the stylesheet uses, and its `region:` entry names the five parts. Keep that comment current when you add classes. The detail uses 24px gutters on wide layouts and 16px on narrow ones; context stacks below the task under `38rem`, and form actions stack under `24rem`.

This standalone example arranges a detail and context region with package components:

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

## Check your changes

In your app, check these by hand after you change flow code, with keyboard alone:

- Open a record from the list. Focus lands on its heading, and only its row is marked current.
- Choose the open record again. Focus returns to its heading, and no history entry is added.
- Go Back. Focus returns to the row you opened, or to search if a filter hides that row.
- Open the URL of a record that does not exist. Request unavailable shows and has focus.
- With `loading` true, open the URL of a record that has not arrived. A loading placeholder shows, then the record heading takes focus when it arrives.
- Clear Request title and save. The error shows on the field, the field has focus and `commit` is not called.
- Make `commit` return a field error, return a `form` error and reject. Each matches its Business logic row.
- While a save is pending, focus is on the request heading and Save changes is disabled. Open another record before it settles: focus stays where you are.
- Narrow the page below the policy width with search focused. Focus moves to the request heading.
- In forced colors, the current row stays distinct from focus.
- Inside your app shell with `landmark={false}` and `header={false}`, the page has one `<main>` and one `<h1>`.

In the kbui repository, the [recipe stories](https://kbui.kcb.pro/storybook/?path=/docs/recipes-listdetail--docs) cover selection, editing, drafts, search and recovery, unavailable records, empty data, long content, each business-logic outcome above and replaced copy. The [flow contract stories](https://github.com/KhallilB/kbui/blob/main/apps/storybook/stories/list-detail-flow/ListDetail.stories.tsx) check the rules above. The [source check](https://github.com/KhallilB/kbui/blob/main/apps/storybook/stories/list-detail-source.test.ts) checks the copyable files, and the [responsive focus stories](https://github.com/KhallilB/kbui/blob/main/apps/storybook/stories/RequestLayout.stories.tsx) cover focus and drafts across widths. From the repository root:

```sh
bun run --cwd apps/storybook test recipes/ListDetail.stories.tsx stories/list-detail-flow/ListDetail.stories.tsx
bun run --cwd apps/storybook verify:code
```

`verify:code` compiles the source and the complete example above.

Check 320, 768 and 1280 CSS pixels in light and dark. Open the long international-shipment record and confirm content wraps without horizontal scrolling. With keyboard alone, select, edit, clear a required field, save, correct it and save again; check focus after every step. Check history and reload through a direct canvas URL. In forced colors, the current row keeps a visible border and controls keep their focus indicators.

## Known limits

- By default, records and drafts live in memory. Reload keeps the selected request but restores the sample data and discards drafts and saves.
- The locally held save depends on unchanged records keeping the same object; see Business logic.
- When the browser throttles a background window, focus can take about a second to reach the request heading after the layout narrows, because the move runs from a `ResizeObserver` callback.
- The default router reads `window.location`, so it needs a browser. Pass a `router` before rendering on a server.
- In an embedded preview, selection belongs to the iframe URL; use the direct Storybook canvas URL to share a selected request.
- Automated stories include accessibility scans. Screen-reader speech, physical devices and browser zoom remain unverified, and a scan does not establish whole-page conformance. With a screen reader, check queue names, the current row, heading focus, the context region, field errors and save announcements.
