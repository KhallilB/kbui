# Inbox recipe

Read a contributor's message, check sender details and write a reply. This recipe uses public `@kb.ui/react` components, a native `<textarea>` and local CSS.

Copy it into your app; it is not a package export. This recipe is not released yet. Use a package build that includes its layout components.

## Copy the complete flow

Put these files in the same folder:

- [`Inbox.tsx`](../../apps/storybook/recipes/Inbox.tsx)
- [`inbox.css`](../../apps/storybook/recipes/inbox.css)
- [`PageHeader.tsx`](../../apps/storybook/recipes/PageHeader.tsx)
- [`recipes.css`](../../apps/storybook/recipes/recipes.css)

Import the package stylesheet once in your app:

```tsx
import "@kb.ui/react/styles.css";
```

Render `<Inbox />` in a browser. It reads the current URL; connect it to your router before using server rendering. The website and Storybook show the same source files and examples.

## Supply your messages

| Prop | Use |
| --- | --- |
| `initialThreads` | Replace the sample messages. Pass `[]` for an empty inbox. |
| `initialThreadId` | Open a message on mount when the URL has no `message` parameter. |
| `sendReply` | Optional async function that sends a reply; see below. |

Each thread needs a unique `id` and values for `sender`, `address`, `subject`, `date`, `excerpt`, `paragraphs` and `context`. Use `date` for display text and `paragraphs` for an array of message paragraphs. Pass initial data when mounting; remount to replace the collection. Search matches sender, subject and excerpt, ignoring case. Clear search resets it and focuses the search field.

## Arrange the panes

This example shows a message beside sender details. Use the complete recipe for navigation, drafts and replies.

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

Below `42rem` of available recipe width, the selected message replaces the index. Wider layouts show both panes. This uses the recipe's width, so it also works inside a narrow preview on a wide screen.

Sender details start closed. Show sender details opens a named `<aside>` built with `Panel` and `Split`; it stacks below the message when space is tight. The toggle stays outside the pane and reports whether it is expanded. Closing the pane leaves focus on the toggle. It does not open a dialog or trap focus. Sender visibility stays the same when you switch messages. Reading order stays index, message, then sender details.

## Open a message and return

Each row is a `Button` reached with Tab. Use Tab rather than listbox arrow keys. The current row has `aria-current` and a selection rail; focus has its own ring.

Opening a message adds `message=<id>` to the URL, keeps other parameters and focuses the detail heading. Back to inbox removes the parameter and restores focus to the original row. If that row is missing or filtered out, focus goes to search. Browser Back and Forward use the same rules. Unknown IDs show Message unavailable with a way back.

If resizing hides the focused control, focus moves to the visible heading or search. Visible controls keep focus. Reload restores URL selection and clears local drafts and replies. Inside an embedded preview, selection changes the iframe URL; use the direct Storybook canvas URL to share a selected message.

## Write a reply

Reply opens a labelled native `<textarea>` below the message and focuses it. There is no kbui textarea component in this version.

A blank or whitespace-only reply shows an error and focuses the `<textarea>` without clearing it. Drafts are stored by thread ID. Switching messages, using history, filtering or changing themes keeps them while the page is open. Discard draft clears only the current draft and error, announces the discard and returns focus to Reply.

Without `sendReply`, sending adds a reply for this session. It makes no network request. Reload clears drafts and replies. The demo does not connect to a mail service, sync incoming mail, archive messages or paginate results.

## Connect sending

Provide a function with this signature:

```ts
type SendReply = (id: string, body: string) => Promise<void>;
```

The recipe trims the reply, blocks duplicate submissions and disables the composer while sending.

| Result | What happens |
| --- | --- |
| `Promise` resolves | Add a local reply, clear its draft and return focus to Reply. |
| `Promise` rejects | Keep the draft, show and announce the error, and focus the `<textarea>`. |
| User has opened another message | Update the original thread without moving focus. |

Your function handles delivery, sign-in, storage and server validation. A rejected promise means the recipe treats delivery as failed. If a network error leaves delivery uncertain, check whether the message was sent before retrying; your delivery code must prevent duplicates.

## Pane and focus comparison

The [request flow](list-detail.md) and inbox use the same components for different tasks.

| Rule | Request flow | `Inbox` | Keep in mind |
| --- | --- | --- | --- |
| Primary panes | List and detail; switch below `48rem` | Index and message; switch below `42rem` | Choose width and proportions for the task. |
| Focus | `Heading` on open; row or search on return; repair hidden focus on resize | Same | Visible fields keep focus during resize. |
| Supporting pane | Saved request facts; open initially | Sender notes; closed initially | A named aside, `Panel` and `Split` cover both. |
| Drafts | Edit saved fields; Cancel returns to Edit request | Append a reply; Discard returns to Reply | Keep data and validation in the app. |
| Completion | Immediate local save | Optional async send with failure and retry | Only move focus if the user is still on that record. |
| Rows | ID, owner and status | Sender, subject and excerpt | Keep selection distinct from focus. |

Keep both as recipes for now. These two demos alone do not establish a shared pane API. If more apps need the same navigation rules, consider a shared helper that leaves routing, search, drafts and delivery in each app.

## Check your changes

Run the example checks from the repository root:

```sh
bun run --cwd apps/storybook test recipes/Inbox.stories.tsx
bun run --cwd apps/storybook verify:code
```

The [workflow stories](../../apps/storybook/recipes/Inbox.stories.tsx) cover selection, sender details, validation, drafts, discard, failed sends, retry, completion after navigation, search, history, missing messages, empty data and long text. The [source check](../../apps/storybook/stories/inbox-source.test.ts) checks the copyable files. `verify:code` compiles the registered source and React examples.

Check light and dark at 320, 768 and 1280 CSS pixels, including the website preview. With keyboard alone, open Mara's message, show and hide sender details, reply, submit whitespace, correct it and send. Go back and check focus. In a wide view, focus search with a message open, then narrow the preview: focus should move to the message heading. Also check long translation notes, forced colors, larger text and browser zoom.

Automated checks include accessibility scans. Screen-reader speech, physical devices, browser zoom and real mail delivery remain unverified. With a screen reader, check row names, selection, heading focus, sender details, textarea errors and send feedback. A scan does not verify the whole page.
