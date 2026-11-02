# RequestIntake

Prepare a request with a title, optional description, one owner and optional reviewers. Review the selected values, edit the retained draft or start another request. This application-owned recipe composes public kbui components; it adds no package export. Implemented locally, unreleased.

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
| `validate` | `RequestValidation` | No application errors | Return synchronous field errors for `title`, `description`, `ownerId` or `reviewerIds`; return an empty object for success. |

`people` is a readonly directory of unique, stable `{ id, name }` records. Omit it for the three-person preview directory; pass an empty array for an unavailable directory. Loading, authentication and fetching remain application responsibilities. A changed directory does not erase selected IDs or the draft; submission reports stale selections for correction. Keep IDs unique and names meaningful.

Optional synchronous `validate(draft)` adds field errors keyed by `title`, `description`, `ownerId` or `reviewerIds`. Keep it pure and return an empty object for success. Built-in required/directory checks still apply. Field errors are validation feedback, never transport failures. Text shown by this copied recipe belongs to your app and can be edited in its source.

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

The [stories](https://github.com/KhallilB/kbui/blob/main/apps/storybook/recipes/RequestIntake.stories.tsx) cover preparation/edit/reset, linked validation recovery, keyboard assignment/no-match/clear, empty directory and app validation. The registered guide example and copied modules compile through `verify:code`. Built recipe journeys check discoverability and source links in both themes at narrow and wide sizes. Check your own data, long text, keyboard focus and containing pane; a standalone component story does not establish whole-page accessibility.

## Known limits

No network, uploads, server validation, autosave, routing, permission model or durable request ID. This recipe does not change ListDetail, Inbox, PageHeader or FormSection. Manual screen-reader speech, browser zoom and your application's service integration remain unverified.
