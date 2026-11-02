# Inbox recipe

Read a contributor's message, check sender details and write a reply. This recipe uses public `@kb.ui/react` components, including [`Textarea`](../../packages/react/docs/components/Textarea.md), and local CSS.

Copy it into your app; it is not a package export. This recipe is not released yet. Use a package build that includes its layout components.

## Use when

- People read one message or thread at a time, chosen from a list, and add a reply to it.
- Reading comes first: details about the sender are available but start hidden.
- Sending can fail or be rejected, and people must keep their reply and see why.

## Use instead

| Need | Use | What separates it |
| --- | --- | --- |
| Change a record's saved fields rather than add to it | [ListDetail](list-detail.md) | ListDetail replaces fields; Inbox appends a reply. |
| Compare, sort, filter or bulk-act on many messages | [`Collection`](../../packages/react/docs/components/Collection.md) | The work happens across rows, not inside one open message. |
| One message with context beside it, and no list to choose from | [`SupportingPane`](../../packages/react/docs/components/SupportingPane.md) | No selection, routing or per-message drafts. |
| A short confirmation after an action elsewhere | [`Toast`](../../packages/react/docs/components/Toast.md) | No thread, draft or reply history. |

## Copy the files

Put these files in one folder. ListDetail uses the same `flow-router.ts`; copy it once.

<!-- generated:files -->

- [`Inbox.tsx`](../../apps/storybook/recipes/Inbox.tsx)
- [`flow-router.ts`](../../apps/storybook/recipes/flow-router.ts)
- [`inbox.css`](../../apps/storybook/recipes/inbox.css)

<!-- /generated -->

Import `@kb.ui/react/styles.css` once at your app entry and render `<Inbox />` in a browser. With no props it shows sample messages, keeps the open message in the `message` URL parameter and adds replies to memory for the session.

Each source file starts with a comment naming the recipe, the kbui version it came from and this guide. Keep it, so you can compare your copy with a later version.

## What you supply

Every prop is optional. A seam marked preview works and is documented, but its name or shape may change in a release before 1.0, without the old name kept as an alias. Release notes name every such change.

| Prop | Default | Use |
| --- | --- | --- |
| `threads` | Sample messages | Your messages. Pass `[]` for an empty inbox. Changes after mount are matched by `id`. |
| `initialThreadId` | `null` | Opens a message on mount when the router has none. |
| `router` (preview) | `searchParamRouter("message")` | Reads, writes and watches the open message id. |
| `commit` (preview) | Resolves at once | Sends a reply for one message. |
| `validate` (preview) | A reply is required | Checks a reply before `commit`. |
| `copy` (preview) | `inboxCopy` | Replaces any visible string or announcement. |

Each thread needs a unique `id` and values for `sender`, `address`, `subject`, `date`, `excerpt`, `paragraphs` and `context`. `date` is display text and `paragraphs` is an array of message paragraphs. Search matches sender, subject and excerpt, ignoring case.

The seams share one shape across list-and-detail recipes. `Inbox.tsx` exports `InboxThread`, `ReplyDraft`, `CommitResult` and `inboxCopy`; `flow-router.ts` exports `FlowRouter` and `searchParamRouter`.

```ts
type ReplyDraft = { body: string };
type CommitResult<Field extends string> = void | { errors: Partial<Record<Field, string>> };

type FlowRouter = {
  read(): string | null; // an empty value reads as null
  write(id: string | null): void; // pushes one history entry
  subscribe(onChange: () => void): () => void;
};
```

Connect delivery through `commit`. Resolve with nothing on success, resolve with `{ errors }` when your server rejects the reply, and reject when sending fails:

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
        if (response.status === 422) return { errors: await response.json() };
        if (!response.ok) throw new Error(`Send failed: ${response.status}`);
      }}
      copy={{ title: "Messages" }}
    />
  );
}
```

To use your app's router, pass a `FlowRouter` that maps the open id to your route, and keep the same router object across renders. `subscribe` returns an unsubscribe function. The recipe writes once per change and never writes the id that is already open. `copy` is merged over `inboxCopy`, so pass only the strings you change; functions such as `failedNotice(sender)` build announcements.

## Business logic

The reply is trimmed before `validate` and `commit` see it.

| Outcome | Meaning | What the recipe does |
| --- | --- | --- |
| `validate` returns errors | Client validation failed | Keeps the reply, describes the error on the `<textarea>` and focuses it. `commit` is not called. |
| `commit` resolves `{ errors }` | Server validation failed | Same as client validation, and announces that the reply needs changes. An error for a field the form does not render shows in a danger callout, is announced, and focus moves to Send reply. |
| `commit` rejects | Transport or server failure | Keeps the reply, shows a danger callout above Send reply, announces the failure with the sender's name and focuses the `<textarea>`. |
| `commit` resolves | Success | Adds the reply below the message, clears the draft, announces it and focuses Reply if the message is still open. |
| Success after the user left the message | — | Adds the reply to that message without moving focus. |
| Failure after the user left the message | — | Keeps that message's reply and error, announces once with the sender's name and shows the error when the message is reopened. Focus never moves. |

The `<textarea>` description holds validation errors only; a failed send never appears there. While a reply is sending, the composer is disabled, a second send for the same message is ignored and focus moves to the message heading. Discard draft clears only that message's reply and error, announces it and returns focus to Reply.

Messages can change after the recipe mounts. The recipe matches them by `id`: the open message stays open, drafts and pending sends stay with their message, and the list follows your order. A sent reply is held locally until `threads` delivers a new object for that id; then your data wins, so a server echo of the reply never shows twice and replies need no ids of their own. If the open message is removed, the detail shows Message unavailable, its draft is discarded, and focus moves to that heading only if it was inside the removed content.

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

List-and-detail recipes share their flow guarantees and differ only in policy. Choose the width at which your list and message stop sharing the row, whether context helps people act on first open, and whether a commit edits the record or appends to it. [ListDetail](list-detail.md) makes the other choices for an editing task.

## Flow guarantees

The [flow contract stories](../../apps/storybook/stories/list-detail-flow/Inbox.stories.tsx) check these rules in a browser against kbui's copy. After you change flow code in your copy, check them yourself.

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

<!-- /generated -->

## Customising the look

Restyle with tokens before changing rules. `inbox.css` reads spacing from `--kb-space-*`, rules from `--kb-color-border`, the selected row from `--kb-color-accent` and `--kb-panel-background-active`, and errors from `--kb-color-danger`. Set a token on `.inbox-flow` to change it for this recipe only.

The reply field is the package [`Textarea`](../../packages/react/docs/components/Textarea.md). `.inbox-reply-field` sets its `--kb-textarea-padding-block` and `--kb-textarea-padding-inline`; Textarea's own styles handle focus, invalid, disabled and forced-colour states. The `.inbox-reply-label`, `.inbox-reply` and `.inbox-error` classes still reach its label, control and error.

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

Run the recipe checks from the repository root:

```sh
bun run --cwd apps/storybook test recipes/Inbox.stories.tsx stories/list-detail-flow/Inbox.stories.tsx
bun run --cwd apps/storybook verify:code
```

The [workflow stories](../../apps/storybook/recipes/Inbox.stories.tsx) cover selection, replies and drafts, failed and pending sends, search and history, missing messages, empty data, long text, each business-logic outcome above and replaced copy. The [flow contract stories](../../apps/storybook/stories/list-detail-flow/Inbox.stories.tsx) check the rules above, and the [source check](../../apps/storybook/stories/inbox-source.test.ts) checks the copyable files. `verify:code` compiles the source and the complete example above.

Check light and dark at 320, 768 and 1280 CSS pixels, including the website preview. With keyboard alone, open Mara's message, show and hide sender details, reply, submit whitespace, correct it and send. Go back and check focus. In a wide view, focus search with a message open, then narrow the preview: focus should move to the message heading. Also check long translation notes, forced colors, larger text and browser zoom.

## Known limits

- By default, drafts and replies live in memory. Reload keeps the selected message but clears drafts and replies. The recipe does not sync incoming mail, archive messages or paginate.
- The default router reads `window.location`, so it needs a browser. Pass a `router` before rendering on a server.
- In an embedded preview, selection belongs to the iframe URL; use the direct Storybook canvas URL to share a selected message.
- Automated checks include accessibility scans. Screen-reader speech, physical devices, browser zoom and real mail delivery remain unverified, and a scan does not establish whole-page conformance. With a screen reader, check row names, the current row, heading focus, sender details, `<textarea>` errors and send feedback.
