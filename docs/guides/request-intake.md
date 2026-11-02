# RequestIntake

Prepare a request with a title, optional description, one owner, optional reviewers, quantity and optional supporting files. Review the selected values, edit the retained draft or start another request. This application-owned recipe composes public kbui components; it adds no package export. Implemented locally, unreleased.

## Use when

Use for a single intake task before connecting your own service.

## Use instead

Use [Form](https://github.com/KhallilB/kbui/blob/main/packages/react/docs/components/Form.md) directly for different fields or submission rules. Use [ListDetail](https://github.com/KhallilB/kbui/blob/main/docs/guides/list-detail.md) when people browse and edit existing records, or [Inbox](https://github.com/KhallilB/kbui/blob/main/docs/guides/inbox.md) for correspondence. Those recipes remain independent.

## Copy the files

Copy these files into the same folder, keeping their relative imports:

<!-- generated:files -->

- [`RequestIntake.tsx`](https://kbui.kcb.pro/recipes/?recipe=requestintake#recipe-source)
- [`request-intake-model.ts`](https://kbui.kcb.pro/recipes/?recipe=requestintake#recipe-source)
- [`request-intake.css`](https://kbui.kcb.pro/recipes/?recipe=requestintake#recipe-source)

<!-- /generated -->

Each source file starts with a comment naming the recipe, the kbui release it belongs to and this guide. Keep it, so you can compare your copy with a later version: diff it against the same file at the named release's Git tag, such as `v0.12.0`, then at the tag you are moving to. The site shows the source on `main`, and a release candidate already names its coming release, so a copy taken between releases can include changes its named release lacks. For an exact base, copy the files from the release tag on GitHub.

Import the package stylesheet once. This repository example imports the registered source; after copying, adjust the recipe import to your folder.

```tsx
import "@kb.ui/react/styles.css";
import { RequestIntake } from "./apps/storybook/recipes/RequestIntake";

export function Example() {
  return <RequestIntake people={[
    { id: "ada", name: "Ada Chen" },
    { id: "luis", name: "Luis Rivera" },
  ]} validate={(draft) => draft.description.trim()
    ? {} : { description: "Explain why this request is needed." }} />;
}
```

## What you supply

Keep directory IDs stable and unique. Loading, authentication, fetching and service delivery remain application responsibilities.

| Prop | Type | Default | Responsibility |
| --- | --- | --- | --- |
| `people` | `readonly RequestPerson[]` | Three-person preview directory | Supply stable `{ id, name }` records; an empty array exposes unavailable-directory recovery. |
| `validate` | `RequestValidation` | No application errors | Return synchronous field errors for `title`, `description`, `ownerId`, `reviewerIds`, `quantity` or `attachments`; return an empty object for success. |

`people` is a readonly directory of unique, stable `{ id, name }` records. Omit it for the three-person preview directory; pass an empty array for an unavailable directory. Loading, authentication and fetching remain application responsibilities. A changed directory does not erase selected IDs or the draft; submission reports stale selections for correction. Keep IDs unique and names meaningful.

Optional synchronous `validate(draft)` adds field errors keyed by `title`, `description`, `ownerId`, `reviewerIds`, `quantity` or `attachments`. Keep it pure and return an empty object for success. Built-in required/directory and demo quantity/file checks still apply. Field errors are validation feedback, never transport failures. Text shown by this copied recipe belongs to your app and can be edited in its source.

## Business logic

The local model requires a non-whitespace title and an owner from the current directory. Reviewers are optional and must still exist in that directory; the owner may also review. Preparation trims outer title/description whitespace, preserving interior newlines and Unicode. It snapshots the selected names for review.

Invalid submission retains every field, shows linked ErrorSummary items and focuses the summary. Each link focuses its actual input, including composite controls. Editing clears that field's old error without moving focus. Every submission validates again. The owner search supports no-match recovery and clearing; optional reviewer chips support selection, removal and clear. An empty directory explains what your app needs to supply rather than choosing a fallback owner.

Successful preparation focuses the result heading and shows DescriptionList facts plus Callout feedback. **Nothing was sent or saved to a server.** Edit draft restores all values and title focus; Start another request clears the draft and returns title focus. There is no asynchronous save, pending state, server record or persistence. Reload discards local state. Add explicit saving/failure handling when you integrate a real service.

## Task policy you can change

These choices describe the copied source, not configurable props. Change the model and its checks together when your application's policy differs.

<!-- generated:policy -->

| Policy | Value |
| --- | --- |
| Preparation | Local summary; no server record |
| Draft | In-memory until reset or reload |
| Required fields | Non-whitespace title and a current directory owner |
| Reviewers | Optional, from the current directory |

<!-- /generated -->

### Quantity and attachments

These are **demo application rules, not NumberField or FileInput package promises**. `requestIntakePolicy` in the copied model owns the bounds; update its messages, helper text and tests together when your policy changes.

- Quantity starts at 1 and must be an integer from 1 through 100. Empty, fractional, non-finite and out-of-range drafts fail submission. NumberField retains typed drafts for app validation; linked errors focus its visible input rather than a stepper.
- Attachments are optional. Accept at most 3 files total, each no larger than 5 MiB (5 × 1024 × 1024 bytes), with reported MIME `application/pdf`, `image/png` or `image/jpeg`. Exactly 5 MiB is accepted. Missing/other MIME is rejected even when the extension looks correct. MIME and size checks are demonstration policy, not content inspection; a real service must validate its own inputs.
- FileInput's `accept` is only a picker hint. `addAttachments` checks every incoming File and retains valid files in selection order while capacity remains. Unsupported, oversize and excess files produce filename-specific reasons without discarding previously accepted files, new accepted files or other fields.

The draft keeps original `File` objects under stable generated item IDs. Duplicate filenames and repeat selection are allowed as independent items; removal uses the item ID, never the filename. FileInput restores focus to the next removal action or Choose files when the list empties. The browser picker clears after selection so the same file can be chosen again. No file contents are read or uploaded.

Rejected selections appear in a live Callout. They never enter the draft and do not prevent preparing the retained, valid selection. Choose corrected files, remove an accepted file to free capacity, or continue without the rejected files. A new selection or removal replaces/clears this notice; Start another request clears all retained files and resets quantity to 1. Edit draft retains the original files and quantity. Preparation rechecks retained files; an app validation error on `attachments` links to the visible Choose files action.

## Flow guarantees

The shared intake contract runs against the recipe in [stories/intake-flow/RequestIntake.stories.tsx](https://github.com/KhallilB/kbui/blob/main/apps/storybook/stories/intake-flow/RequestIntake.stories.tsx). Its facts supply this generated list; a missing rule fails coverage rather than disappearing from the guide.

<!-- generated:flow-guarantees -->

### Focus

- Preparation shows the selected values and focuses the result heading
- Invalid preparation retains the draft and links errors to their inputs
- Application validation retains the draft and supports linked field recovery

### Editing and commits

- Directory search recovers from no match and reviewer removal keeps other fields
- Editing the prepared request restores every core field and title focus
- Starting another request clears the core draft and focuses its title
- An empty directory explains the missing owner and retains the draft

<!-- /generated -->

## Customising the look

Form owns the bounded field width and responsive FormActions; Fieldset owns native groups. The recipe stylesheet exposes `.request-intake`, `.request-intake-result` and `.request-intake-description` for local layout and multiline wrapping. Use existing spacing tokens and public component parts. Combobox and MultiSelect retain the field's theme/portal boundary. Avoid fixed heights and clipped popups.

## Check your changes

Run from the repository root:

```sh
bun test apps/storybook/stories/request-intake-model.test.ts
bun run --cwd apps/storybook test recipes/RequestIntake.stories.tsx stories/intake-flow/RequestIntake.stories.tsx
bun run docs:recipes
bun run --cwd apps/storybook verify:code
```

The [stories](https://github.com/KhallilB/kbui/blob/main/apps/storybook/recipes/RequestIntake.stories.tsx) cover preparation/edit/reset, linked validation recovery, keyboard assignment/no-match/clear, empty directory, quantity bounds/stepping, mixed file rejection, repeated selection, identity-based removal/focus and app validation. Pure model tests check original File identity, MIME/size/count boundaries and retained-file revalidation. The registered guide example and copied modules compile through `verify:code`. Built recipe journeys check discoverability and source links in both themes at narrow and wide sizes. Check your own data, long text, keyboard focus and containing pane; a standalone component story does not establish whole-page accessibility.

## Known limits

No network, uploads, server validation, autosave, routing, permission model or durable request ID. This recipe does not change ListDetail, Inbox, PageHeader or FormSection. Manual screen-reader speech, browser zoom and your application's service integration remain unverified.
