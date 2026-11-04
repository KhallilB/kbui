# Inbox recipe

Read a contributor's message, check sender details and write a reply. This recipe uses public `@kb.ui/react` components, including [`Textarea`](https://kbui.kcb.pro/components/?component=textarea), and local CSS.

Copy it into your app; it is not a package export.

## Use when

- People read one message or thread at a time, chosen from a list, and add a reply to it.
- Reading comes first: details about the sender are available but start hidden.
- Sending can fail or be rejected, and people must keep their reply and see why.

## Use instead

| Need | Use | What separates it |
| --- | --- | --- |
| Change a record's saved fields rather than add to it | [ListDetail](https://kbui.kcb.pro/recipes/?recipe=listdetail) | ListDetail replaces fields; Inbox appends a reply. |
| Compare, sort, filter or bulk-act on many messages | [`Collection`](https://kbui.kcb.pro/components/?component=collection) | The work happens across rows, not inside one open message. |
| One message with context beside it, and no list to choose from | [`SupportingPane`](https://kbui.kcb.pro/components/?component=supportingpane) | No selection, routing or per-message drafts. |
| A short confirmation after an action elsewhere | [`Toast`](https://kbui.kcb.pro/components/?component=toast) | No thread, draft or reply history. |

## Copy the files

Put these files in one folder. ListDetail uses the same `flow-router.ts` and `list-detail-controller.ts`; copy each once.

<!-- generated:files -->

- [`Inbox.tsx`](https://kbui.kcb.pro/recipes/?recipe=inbox#recipe-source)
- [`flow-router.ts`](https://kbui.kcb.pro/recipes/?recipe=inbox#recipe-source)
- [`list-detail-controller.ts`](https://kbui.kcb.pro/recipes/?recipe=inbox#recipe-source)
- [`inbox.css`](https://kbui.kcb.pro/recipes/?recipe=inbox#recipe-source)

<!-- /generated -->

Import `@kb.ui/react/styles.css` once at your app entry and render `<Inbox />` in a browser. With no props it shows sample messages, keeps the open message in the `message` URL parameter and adds replies to memory for the session.

Each source file starts with a comment naming the recipe, or every recipe that shares it, the oldest `@kb.ui/react` it works with and this guide; `needs @kb.ui/react ≥ 0.12.0` means install 0.12.0 or later. Keep it. The version is the oldest npm release that has every package export the recipe uses. It is a requirement, not a record of when you copied the file: copies taken at different times can name the same version. To compare your copy with upstream, diff it against the same file at a release's Git tag, such as `v0.12.0`, or on `main`.

`list-detail-controller.ts` holds the flow that Inbox and ListDetail share: selection, history, drafts, sending and focus. `Inbox.tsx` configures it through options and keeps the messages, reply field, wording and markup. Leave the controller unedited and you can take an upstream fix by replacing the file whole; only `Inbox.tsx` then needs comparing by hand.

**Copied before 0.12.2?** Your copy keeps working; nothing changes it. From 0.12.2 the flow lives in `list-detail-controller.ts` and `Inbox.tsx` holds your messages, fields and markup. Props are unchanged, with one fix: `initialThreadId=""` now reads as no selection and shows the list, where earlier copies showed Message unavailable. To move over, copy `list-detail-controller.ts`, then reapply your domain edits to the new `Inbox.tsx`. Flow code you changed in the old file has no direct equivalent, so check focus, history and error recovery afterwards with the list under Check your changes. To stay on the single-file shape, compare your copy against the `v0.12.1` tag.

## What you supply

Every prop is optional. A seam marked preview works and is documented, but its name or shape may change in a release before 1.0, without the old name kept as an alias. Release notes name every such change.

| Prop | Default | Use |
| --- | --- | --- |
| `threads` | Sample messages | Your messages. Pass `[]` for an empty inbox. Changes after mount are matched by `id`. |
| `loading` (preview) | `false` | Pass `true` while messages are still arriving. |
| `initialThreadId` | `null` | Opens a message on mount when the router has none. |
| `router` (preview) | `searchParamRouter("message")` | Reads, writes and watches the open message id. |
| `commit` (preview) | Adds the reply in memory | Sends a reply for one message. |
| `validate` (preview) | A reply is required | Checks a reply before `commit`. |
| `copy` (preview) | `inboxCopy` | Replaces any visible string or announcement. |
| `landmark` (preview) | `true` | Pass `false` when your app shell already renders `<main>`. |
| `header` (preview) | `true` | Pass `false` when your app shell already renders the page `<h1>`. |

Each thread needs a unique `id` and values for `sender`, `address`, `subject`, `date`, `excerpt`, `paragraphs` and `context`. `date` is display text and `paragraphs` is an array of message paragraphs. Search matches sender, subject and excerpt, ignoring case.

`replies` is optional: the replies your server has saved for that message, in the order to show them after it. Each reply needs its own `id` and a `body`. `author` labels it; a reply without one is labelled with `copy.sentHeading`, which reads "You" once you pass `commit`.

The seams share one shape across list-and-detail recipes. `Inbox.tsx` exports `InboxThread`, `InboxReply`, `ReplyDraft`, `CommitResult` and `inboxCopy`; `flow-router.ts` exports `FlowRouter` and `searchParamRouter`, plus the commit, announcement and focus helpers both flow recipes share.

```ts
type InboxReply = { id: string; body: string; author?: string };
type ReplyDraft = { body: string };
// `form` carries an error no field owns, such as a refused permission.
type CommitResult<Field extends string> = void | { errors: Partial<Record<Field | "form", string>> };

type FlowRouter = {
  read(): string | null; // an empty value reads as null
  write(id: string | null): void; // pushes one history entry
  subscribe(onChange: () => void): () => void;
};
```

Connect delivery through `commit`. Resolve with nothing on success, resolve with `{ errors }` when your server rejects the reply, and reject when sending fails. Put an error that no field owns under `form`:

```tsx
import { Inbox, type InboxThread } from "./Inbox";
import type { FlowRouter } from "./flow-router";

function Correspondence({ threads, router }: { threads: InboxThread[]; router: FlowRouter }) {
  return (
    <Inbox
      threads={threads}
      router={router}
      commit={async (id, draft) => {
        const response = await fetch(`/api/threads/${id}/replies`, {
          method: "POST",
          body: JSON.stringify(draft),
        });
        if (response.status === 403) return { errors: { form: "You can't reply to this message." } };
        if (response.status === 422) return { errors: await response.json() };
        if (!response.ok) throw new Error(`Send failed: ${response.status}`);
      }}
      copy={{ title: "Messages" }}
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

`copy` is merged over `inboxCopy`, so pass only the strings you change; functions such as `failedNotice(sender)` build announcements.

Without `commit`, the defaults describe the in-memory demo: a note that replies stay in this session, "for this session" in the sent announcement and a "Session reply" label. Once you pass `commit` they are neutral, and `sessionNote` is empty, which hides it. `invalidNotice(sender, errors)` receives the errors: by default it says the reply needs changes when `body` has an error, and that it was not sent otherwise. `loading` labels the list and a waiting message.

### Reusing the flow for another record type (preview)

To build a list-and-detail screen for another record type, write a new component that calls `useListDetailFlow` from `list-detail-controller.ts`, and configure the controller rather than edit it. `Inbox.tsx` is the worked example for a task that appends to the record. The options and what the hook returns are preview: their names or shape may change before 1.0, and release notes name each change.

The options describe your records and task:

- `records`, `loading`, `initialId` and `router` take the same data and routing as the props above. Records are matched by `id`, and an empty `initialId` reads as no selection.
- `fields` lists the draft fields your form renders, in focus order. The first takes focus when a draft begins and after a failed send.
- `begin` starts a draft from a record, `normalize` tidies it, `validate` checks it and `commit` sends it, with the same outcomes as Business logic below.
- `view` shows sends your records have not echoed yet; Inbox uses it to append the reply after the message.
- `matches` and `defaultFilter` decide which rows search and any filter show. Inbox has search only.
- `notices` builds the announcements, keyed `saving`, `saved`, `failed`, `invalid` and `discarded`.

The hook returns the records with sends applied, the visible rows, the open record with its draft, errors and pending state, whether a deep link is still waiting for its record, and the announcement to show. Its actions open a record, go back, begin, change, discard and submit a draft, and set the search and filter. Spread `root` on the outer element, and attach `refs` to search, the record heading, the begin and submit controls, each field and each row, so the controller can move focus after every step. Your component keeps markup, wording and domain rules, with no history, focus or send code of its own.

## Business logic

The reply is trimmed before `validate` and `commit` see it.

| Outcome | Meaning | What the recipe does |
| --- | --- | --- |
| `validate` returns errors | Client validation failed | Keeps the reply, describes the error on the `<textarea>` and focuses it. `commit` is not called. |
| `commit` resolves `{ errors: { body } }` | Server validation failed | Same as client validation, and announces that the reply needs changes. |
| `commit` resolves `{ errors: { form } }` | Refused for a reason no field owns, such as permissions | Keeps the reply, shows the error in a danger callout beside Send reply, announces that the reply was not sent with the error, and focuses Send reply. Any other key the form does not render is handled the same way. |
| `commit` rejects | Transport or server failure | Keeps the reply, shows a danger callout above Send reply, announces the failure with the sender's name and focuses the `<textarea>`. |
| `commit` resolves | Success | Adds the reply below the message, clears the draft, announces it and focuses Reply if the message is still open. |
| Success after the user left the message | — | Adds the reply to that message without moving focus. |
| Failure after the user left the message | — | Keeps that message's reply and error, announces once with the sender's name and shows the error when the message is reopened. Focus never moves. |

The `<textarea>` description holds validation errors only; a failed send never appears there. While a reply is sending, the composer is disabled, a second send for the same message is ignored and focus moves to the message heading. Discard draft clears only that message's reply and error, announces it and returns focus to Reply.

Pass `loading` while the first fetch, or a refetch, is in flight. While it is true and no messages have arrived, the list shows `copy.loading` instead of a count or an empty state. A deep-linked message that has not arrived shows a loading placeholder instead of Message unavailable, and focus moves to its heading when it arrives.

Messages can change after the recipe mounts. The recipe matches them by `id`: the open message stays open, drafts and pending sends stay with their message, and the list follows your order. A sent reply is held locally until `threads` delivers a new object for that id; then your data wins. Include the saved reply in that thread's `replies`, so it shows once and stays after a reload. If the open message is removed, the detail shows Message unavailable, its draft is discarded, and focus moves to that heading only if it was inside the removed content.

Keep a message that has not changed as the same object between updates. The recipe reads a new object for an id as your confirmed data and drops the reply it holds for that message. If you rebuild every thread on each update, for example with a plain `.map()` over server records, a reply just sent disappears when an unrelated message changes, until your data includes it. Reuse the previous object for an unchanged record, for example by caching mapped threads per server record.

Your `commit` owns delivery, sign-in, storage and duplicate protection. If a failure leaves delivery unknown, check whether the reply was sent before retrying.

## Task policy you can change

These task choices are constants in the copied source, not props. The width is the stylesheet's `@container` query; sender visibility and commit mode live in `Inbox.tsx`.

<!-- generated:policy -->

| Policy | Value |
| --- | --- |
| List and detail share the row from | `42rem` of recipe width |
| Context on first open | Hidden |
| A commit | Appends to the record |

<!-- /generated -->

List-and-detail recipes share their flow guarantees and differ only in policy. Choose the width at which your list and message stop sharing the row, whether context helps people act on first open, and whether a commit edits the record or appends to it. [ListDetail](https://kbui.kcb.pro/recipes/?recipe=listdetail) makes the other choices for an editing task.

## Flow guarantees

The [flow contract stories](https://github.com/KhallilB/kbui/blob/main/apps/storybook/stories/list-detail-flow/Inbox.stories.tsx) check these rules in a browser against kbui's copy. After you change flow code in your copy, check them yourself with the list under Check your changes.

<!-- generated:flow-guarantees -->

### Focus

- Opening a record focuses its heading
- An unknown record id focuses the unavailable heading
- Reselecting the open record focuses its heading without a history entry
- Back returns focus to the row that opened the record
- Back focuses search when the opening row is filtered out
- Reopening a record with a draft focuses its heading, not the draft, and the field keeps its text

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
- Beginning a draft focuses its first field; discarding announces the discard and focuses the begin control

### Lists

- Only the open record's row carries aria-current
- Filters persist, keep the open record open, and Clear focuses search
- The current-row cue stays distinct from focus in forced colors
- Only the row of a record with an unsaved draft marks it, until the draft closes

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

Restyle with tokens before changing rules. `inbox.css` reads spacing from `--kb-space-*`, rules from `--kb-color-border`, the selected row from `--kb-color-accent` and `--kb-panel-background-active`, and errors from `--kb-color-danger`. Set a token on `.inbox-flow` to change it for this recipe only.

The recipe composes package components: [`PageHeader`](https://kbui.kcb.pro/components/?component=pageheader) for the page introduction, `Panel`, `Split`, `Grid` and [`Inline`](https://kbui.kcb.pro/components/?component=inline) for the regions, and `Callout` for a failed send. `Inline` takes `as`, `gap`, `align` and `justify`; it always wraps, so it has no `wrap` prop. Their own tokens and props restyle them.

The reply field is the package [`Textarea`](https://kbui.kcb.pro/components/?component=textarea). The recipe sets none of its tokens, so Textarea's own padding and its focus, invalid, disabled and forced-colour states apply. To change the padding, set `--kb-textarea-padding-block` and `--kb-textarea-padding-inline` on `.inbox-reply-field`, its root. The `.inbox-reply-label`, `.inbox-reply` and `.inbox-error` classes still reach its label, control and error.

Every list-and-detail recipe names the same five region parts, so a restyle written for one carries over to the other:

| Part | Class | Element |
| --- | --- | --- |
| List | `.inbox-list` | Message index panel |
| Detail | `.inbox-detail` | Open message panel |
| Context | `.inbox-context` | Sender details aside |
| Status | `.inbox-status` | Visible send failure |
| Composer | `.inbox-composer` | Reply form |

Line 1 of `inbox.css` lists every class the stylesheet uses, and its `region:` entry names the five parts. Keep that comment current when you add classes. Sender details are a named `<aside>` built with `Panel` and `Split`. They stack below the message when space is tight, and the toggle stays outside the pane without trapping focus.

This standalone example arranges a message and sender details with package components:

```tsx
import "@kb.ui/react/styles.css";
import { Heading, Panel, Split, Text } from "@kb.ui/react";

export function CorrespondenceRegions() {
  return (
    <Split ratio="wide-start" collapse="md" align="start">
      <Panel aria-labelledby="letter-subject">
        <Panel.Header>
          <Heading level={2} id="letter-subject">Notes from the coast</Heading>
        </Panel.Header>
        <Panel.Body>
          <Text>Mara has twelve photographs for the winter issue.</Text>
        </Panel.Body>
      </Panel>
      <aside aria-label="Sender details">
        <Panel tone="quiet">
          <Panel.Header>
            <Heading level={2}>About the sender</Heading>
          </Panel.Header>
          <Panel.Body>
            <Text>Mara Ellis · Photographer</Text>
          </Panel.Body>
        </Panel>
      </aside>
    </Split>
  );
}
```

## Check your changes

Changing only `Inbox.tsx`, such as its messages, reply field, wording or markup, leaves flow behaviour with the controller. If you edit `list-detail-controller.ts`, run the list below again, and merge later upstream fixes into it by hand.

In your app, check these by hand after you change flow code, with keyboard alone:

- Open a message from the list. Focus lands on its heading, and only its row is marked current.
- Choose the open message again. Focus returns to its heading, and no history entry is added.
- Go Back. Focus returns to the row you opened, or to search if a filter hides that row.
- Open the URL of a message that does not exist. Message unavailable shows and has focus.
- With `loading` true, open the URL of a message that has not arrived. A loading placeholder shows, then the message heading takes focus when it arrives.
- Send a blank reply. The error shows on the field, the field has focus and `commit` is not called.
- Make `commit` return a `body` error, return a `form` error and reject. Each matches its Business logic row.
- While a reply sends, focus is on the message heading and Send reply is disabled. Open another message before it settles: focus stays where you are.
- Narrow the page below the policy width with search focused. Focus moves to the message heading.
- In forced colors, the current row stays distinct from focus.
- Inside your app shell with `landmark={false}` and `header={false}`, the page has one `<main>` and one `<h1>`.

In the kbui repository, the [workflow stories](https://kbui.kcb.pro/storybook/?path=/docs/recipes-inbox--docs) cover selection, replies and drafts, failed and pending sends, search and history, missing messages, empty data, long text, each business-logic outcome above and replaced copy. The [flow contract stories](https://github.com/KhallilB/kbui/blob/main/apps/storybook/stories/list-detail-flow/Inbox.stories.tsx) check the rules above, and the [source check](https://github.com/KhallilB/kbui/blob/main/apps/storybook/stories/inbox-source.test.ts) checks the copyable files. From the repository root:

```sh
bun run --cwd apps/storybook test recipes/Inbox.stories.tsx stories/list-detail-flow/Inbox.stories.tsx
bun run --cwd apps/storybook verify:code
```

`verify:code` compiles the source and the complete example above.

Check light and dark at 320, 768 and 1280 CSS pixels, including the website preview. With keyboard alone, open Mara's message, show and hide sender details, reply, submit whitespace, correct it and send. Go back and check focus. In a wide view, focus search with a message open, then narrow the preview: focus should move to the message heading. Also check long translation notes, forced colors, larger text and browser zoom.

## Known limits

- By default, drafts and replies live in memory. Reload keeps the selected message but clears drafts and replies. The recipe does not sync incoming mail, archive messages or paginate.
- The locally held reply depends on unchanged messages keeping the same object; see Business logic.
- When the browser throttles a background window, focus can take about a second to reach the message heading after the layout narrows, because the move runs from a `ResizeObserver` callback.
- The default router reads `window.location`, so it needs a browser. Pass a `router` before rendering on a server.
- In an embedded preview, selection belongs to the iframe URL; use the direct Storybook canvas URL to share a selected message.
- Automated checks include accessibility scans. Screen-reader speech, physical devices, browser zoom and real mail delivery remain unverified, and a scan does not establish whole-page conformance. With a screen reader, check row names, the current row, heading focus, sender details, `<textarea>` errors and send feedback.
