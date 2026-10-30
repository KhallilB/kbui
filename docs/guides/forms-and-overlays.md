# Forms and overlays

Field and form APIs (`Input`, `Textarea`, `Fieldset`, `FormActions`, `ErrorSummary`, `Select`, `Combobox`, `MultiSelect`, `Checkbox`, `RadioGroup`, `Switch`, `NumberField`, `FileInput`) live in the [React API](../../packages/react/README.md). This guide covers what spans components: form grouping and error recovery, theme hosts for portaled popups, structured dialogs, surface tokens and the accessibility contracts the shared suite checks.

Start with the [React installation guide](using-kbui.md#installing). The adapter includes all styles and CSS tokens; import `@kb.ui/react/styles.css` once at your app entry.

## Form grouping and validation recovery

Group related fields with `Fieldset` so native `fieldset` and `legend` semantics stay intact for assistive technology and group-level `disabled` states propagate automatically. Place `FormActions` at the end of a form or section to align submit, reset and secondary buttons in natural Tab order without toolbar arrow-key navigation.

When submission fails, render `ErrorSummary` at the top of the form and focus its container ref so keyboard and screen-reader users hear the summary immediately. Pair each summary link (`href="#field-id"`) with the matching `id` and inline `error` message on the invalid control.

## Form and settings layout

Pick the layout by how the page saves. [Form](../../packages/react/docs/components/Form.md) holds one task with one submit, such as booking or sign-up: a header, the fields, then the actions. [Settings](../../packages/react/docs/components/Settings.md) holds sections that save on their own, and managed lists such as members or API keys. Group the fields of either with [FormSection](../../packages/react/docs/components/FormSection.md), a native fieldset named by its section heading.

| Width | Form | Settings |
| --- | --- | --- |
| Section at least 40rem wide | Sections stack; the form stops at 40rem (`md`) or 32rem (`sm`) | Each section heading sits in the first third, fields in the other two |
| Section narrower than 40rem | Same | Heading above its fields |
| Actions row narrower than 30rem | Each action fills its own row, submit first | Same for section actions |

Neither layout reorders content: reading order, Tab order and visual order match at every width. Wrap each independently saved Settings section in its own `form`, and keep destructive row actions behind a confirmation. kbui controls keep pointer targets at least 24 by 24 CSS pixels; the layouts never shrink them. Your app owns validation, saving and announcing results.

## Theme hosts and portals

Set tokens on a stable theme wrapper. `Select`, `Combobox` and `MultiSelect` mount their popups inside their own root, so nested themes reach them. Dialog, `Popover.Content`, `Menu.Content` and Tooltip mount on `document.body` by default; pass the wrapper as `container` when colors or timing live on a nested element:

```tsx
import { useRef } from "react";
import { Button, Menu } from "@kb.ui/react";

export function ThemedActions() {
  const host = useRef<HTMLDivElement>(null);
  return (
    <div ref={host} data-theme="dark">
      <Menu>
        <Menu.Trigger render={<Button />}>Actions</Menu.Trigger>
        <Menu.Content container={host}>
          <Menu.Item>Inspect</Menu.Item>
        </Menu.Content>
      </Menu>
    </div>
  );
}
```

Keep the host outside overflow clipping and transformed ancestors when a popup must escape them. A Select inside a scrolling Dialog should target an unclipped outer host.

Aliases resolve where they are declared. Inside a nested surface, set component tokens such as `--kb-popup-background` or `--kb-dialog-background` directly rather than expecting a parent alias to recompute.

## Structured dialogs

Use `Dialog.Content` `title` and `description` for simple prompts. For a structured review, compose `Dialog.Header`, `Dialog.Title`, `Dialog.Description`, `Dialog.Body`, `Dialog.Footer` and `Dialog.Actions`. Sections are neutral `div`s with native props and refs; add `role="region"` and a name only when the content deserves a landmark. Use the props or the composed parts, not both, or the dialog gets two names. Always include a visible Close or Cancel action.

## Surface tokens

[Surface theming](../tokens.md#surface-theming) lists the Dialog, Button and popup tokens. Defaults reproduce the shipped design: Button transitions take 140ms with a 1px press offset, Dialog 150ms with a 0.96 entry scale, Menu, Select and Tooltip use `--kb-motion-duration-fast`. Popover uses a 160ms anchored scale/offset transition; Disclosure and Accordion expand to their measured content height over 240ms. Drawer slides from the logical inline end over 240ms. These durations and easing curves have component tokens. Set duration and easing on the theme host; a popup-only inline style cannot reach the sibling Dialog backdrop.

Reduced motion removes component transitions, drawer/popover movement and the Button press offset. Consumer animations must honor the same preference. Transitions use Base UI’s [interruptible lifecycle states](https://base-ui.com/react/handbook/animation), so reversing a reveal follows the latest action. Panel content returns to automatic height after expansion, allowing async content and text reflow to grow naturally. Keep positioning wrappers free of movement transitions: scroll and resize updates must track the anchor immediately.

## Accessibility contracts

`apps/storybook/stories/Accessibility.stories.tsx` checks these in normal and reduced-motion Chromium (`bun run test:stories`) and under forced colors (`bun run --cwd apps/storybook test:a11y`):

- Selected radio indicators stay distinguishable from their control under forced colors.
- A read-only mixed Checkbox keeps its mixed state, exposes `aria-readonly` and ignores activation.
- Select merges caller `aria-describedby` after its own helper. An empty Select's "No options available" helper comes first.
- Buttons use system colors under forced colors, so text stays legible on every variant; disabled buttons use `GrayText`.
- A Select inside a scrolling, nested-theme Dialog keeps its options in the viewport at 320px, returns focus to the trigger, and Escape closes the listbox before the dialog.

Those shared accessibility fixtures run in Chromium. Overlay-specific three-engine coverage is described below; automated checks do not replace screen-reader or physical-device assessment.


## Choose a disclosure or overlay

Use Disclosure for optional inline details or advanced controls. Accordion groups related disclosures with headings and supports one or several expanded panels. Popover anchors supporting controls to their trigger and allows interaction with the surrounding page by default. Tooltip supplies a short, non-interactive hint; Menu groups actions. Use Dialog when a task needs modal focus containment.

The component references own APIs and complete modules: [Disclosure](../../packages/react/docs/components/Disclosure.md), [Accordion](../../packages/react/docs/components/Accordion.md), [Popover](../../packages/react/docs/components/Popover.md), and [Dialog](../../packages/react/docs/components/Dialog.md). Keep essential instructions, errors and required steps discoverable outside collapsed or temporary content. Store persistent drafts in the application or keep disclosure panels mounted.

## Drawer pattern

A side sheet uses `Dialog.Content layout="drawer"` with direct Header, Body and Footer children. It retains modal semantics, focus containment, page scroll locking, Escape dismissal and trigger focus return. Content title/description props also generate a persistent Header. The sheet slides from the logical inline end, fills the dynamic viewport and respects device safe areas. Header and Footer stay visible while Body scrolls; overscroll stays inside the sheet. Reduced motion removes the slide. This pattern provides no swipe gesture or snap points.

```tsx
import "@kb.ui/react/styles.css";
import { useRef } from "react";
import { Button, Dialog } from "@kb.ui/react";

export function ProjectDrawer() {
  const title = useRef<HTMLHeadingElement>(null);
  return (
    <Dialog>
      <Dialog.Trigger render={<Button />}>Project details</Dialog.Trigger>
      <Dialog.Content layout="drawer" initialFocus={title}>
        <Dialog.Header>
          <Dialog.Title ref={title} tabIndex={-1}>Project details</Dialog.Title>
          <Dialog.Description>Supporting details in a side sheet.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Body role="region" aria-label="Project review" tabIndex={0}>
          <p>Review the current project details.</p>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Actions>
            <Dialog.Close render={<Button />}>Close details</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
```

For long content, focus the heading initially so opening does not jump to the bottom action. A named, focusable Body supports Page Up/Down and Home/End without adding a nested focus trap. Use one Body scroll region, keep header/footer concise and place actions in Footer. If enlarged header/footer content exceeds the viewport, the outer popup remains scrollable as a fallback. Use the `--kb-dialog-width` token to tune the maximum width, and drawer motion tokens for duration/easing. Section padding can be customized with existing native style/className props.

Keep a visible close action reachable at short viewport heights and after text enlargement. Use an unclipped portal host for nested themes. If closing removes the trigger, set Content.finalFocus to the next useful control. [Live drawer](https://kbui.kcb.pro/storybook/?path=/story/components-dialog--drawer) exercises body scrolling, persistent heading/actions, bounds, Escape and focus return.

## Scrolling supporting controls

Popover keeps Base UI anchor tracking enabled for ancestor scrolling, resizing and layout changes. Collision handling fits the popup to available space. Keep the normal task compact enough to show controls and Done/Close together. Use direct Popover.Body and Popover.Footer children so constrained fields scroll without hiding actions; Content title/description props generate a persistent Header. A composed Header supports custom naming and close controls. Give a long scrollable Body a name and tabIndex=0 for native keyboard scrolling. Avoid artificial small height caps and long supporting prose in popovers; use Dialog, Drawer or inline Disclosure for those tasks. Avoid animating the positioner or using smooth scrolling on every positioning update. The popup’s small transform/opacity transition runs only on open/close. For a different clipping boundary or sticky placement, pass `positionerProps`; keep the default tracking enabled. [Scrolling example](https://kbui.kcb.pro/storybook/?path=/story/components-popover--scrolling) keeps working view preferences and their Done action visible while the surrounding workspace scrolls. Use a drawer or inline disclosure when content needs more room than an anchored popup.

## Confirmation pattern

The application owns the operation, pending state, retry and successful close. Put the least destructive action first and focus it initially. Do not wrap an asynchronous commit action in Dialog.Close: close only after success, retain context on failure, and announce errors. Keep the pending action focusable with aria-disabled while its handler rejects repeated requests; this prevents focus loss when a focused native button becomes disabled. Prevent Escape, outside dismissal and duplicate submissions while an operation is pending. Once it settles, cancellation is available again.

```tsx
import "@kb.ui/react/styles.css";
import { useRef, useState } from "react";
import { Button, Dialog } from "@kb.ui/react";

export function ArchiveConfirmation({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const cancel = useRef<HTMLButtonElement>(null);
  const submitting = useRef(false);

  async function confirm() {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      setError("Could not archive the project. Try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <Dialog open={open} disablePointerDismissal onOpenChange={(next, details) => {
      if (submitting.current) { details.cancel(); return; }
      setError("");
      setOpen(next);
    }}>
      <Dialog.Trigger render={<Button variant="danger" />}>Archive project</Dialog.Trigger>
      <Dialog.Content title="Archive project?" description="Members will lose access until you restore it." initialFocus={cancel} aria-busy={pending}>
        {error ? <p role="alert">{error}</p> : null}
        <Dialog.Actions>
          <Dialog.Close ref={cancel} render={<Button variant="ghost" />} disabled={pending}>Cancel</Dialog.Close>
          <Button variant="danger" aria-disabled={pending} onClick={() => void confirm()}>
            {pending ? "Archiving…" : "Archive project"}
          </Button>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  );
}
```

`onConfirm` must settle and reject on failure; provide application-owned timeouts and recovery for stalled requests. The ref guards repeated activation before React commits pending state. Real authorization and idempotency belong to the application/server. Announce success in the retained page and choose a useful finalFocus target if the successful action removes the trigger. For urgent alerts requiring alertdialog semantics, use an appropriate alert-dialog primitive; this recipe remains a named modal Dialog.

[Live confirmation](https://kbui.kcb.pro/storybook/?path=/story/components-dialog--confirm) and [failure/retry](https://kbui.kcb.pro/storybook/?path=/story/components-dialog--confirmation-recovery) use local demonstration callbacks. They perform no persistent operation.

Verify each pattern by keyboard: open, inspect the name and description, Tab/Shift+Tab within modal bounds, cancel, and confirm useful focus return. For confirmation, test rejection followed by retry, pending Escape/outside press, and repeated activation. For drawer and popover, check viewport edges at 320 CSS pixels, long content, zoom, RTL, nested themes, forced colors and reduced motion. Automated Chromium stories supplement the [manual task pass](accessibility.md#run-a-manual-task-pass); screen-reader and physical-device assessment remain application responsibilities.


Run `bun run test:overlays` for the maintained three-engine, theme and motion matrix. The [overlay verification procedure](accessibility.md#overlay-compatibility) explains the narrow Base UI focus-guard exclusion, native keyboard coverage, scanner negative controls and separate manual screen-reader assessment.

## Popover update models and embedding

Use immediate changes for reversible display preferences: show the result beside the trigger, offer Reset and dismiss with Done. Use a separate draft for edits: Save or native Enter commits, while Cancel, Escape and outside dismissal discard. The Popover [Default and Controlled examples](../../packages/react/docs/components/Popover.md#interaction-patterns) demonstrate both models.

Verify the actual host dimensions, including iframe previews. A portal cannot escape an iframe viewport. Reserve enough space around its trigger for fields, labels and actions; use a larger host or Dialog/Drawer for complex work in compact space. A technically mounted field inside a zero-height Body is not a usable task. The catalog's built regression opens the panel in both theme panes and checks descendant control bounds rather than relying on dialog visibility alone.
