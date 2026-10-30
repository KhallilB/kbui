# ConfirmAction

`ConfirmAction` puts a destructive action behind a modal confirmation built on [`Dialog`](Dialog.md). The trigger only opens the confirmation; `onConfirm` runs after a second, explicit choice. It owns Cancel-first focus, the pending guard, blocked dismissal while pending, the failure alert with retry, and closing only after success.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-confirmaction--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { useState } from "react";
import { ConfirmAction } from "@kb.ui/react";

async function deleteProject(): Promise<void> {
  const response = await fetch("/api/projects/portal", { method: "DELETE" });
  if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
}

export function Example() {
  const [deleted, setDeleted] = useState(false);
  return (
    <>
      <p role="status">{deleted ? "Project deleted." : ""}</p>
      <ConfirmAction
        title="Delete project?"
        description="This permanently removes the project and its data."
        pendingLabel="Deleting…"
        errorMessage="Could not delete the project. Try again."
        onConfirm={deleteProject}
        onConfirmed={() => setDeleted(true)}
      >
        Delete project
      </ConfirmAction>
    </>
  );
}
```

## More examples

- [Default](https://kbui.kcb.pro/storybook/?path=/story/components-confirmaction--default): A danger-zone deletion with consequence details and a pending state.
- [Failure and retry](https://kbui.kcb.pro/storybook/?path=/story/components-confirmaction--failure-and-retry): The first attempt fails, the dialog stays open with an alert, and the retry succeeds.
- [Row action](https://kbui.kcb.pro/storybook/?path=/story/components-confirmaction--row-action): A quiet row trigger whose success removes the row and moves focus to the list heading.

## Reference

| Part or behavior | Purpose |
| --- | --- |
| Trigger | A `danger` [`Button`](Button.md) by default. Native button props, `ref`, `className` and `disabled` reach it. Replace its look with `render`, such as `render={<Button variant="ghost" size="sm" />}`. |
| Popup | A `Dialog.Content` with `.kb-confirmaction`. `title` names it and `description` describes it; `details` adds further consequence content. |
| Actions | Cancel first, focused on open, then a `danger` confirm button. |
| Pending | While `onConfirm` runs, the popup has `aria-busy` and `data-pending`, Escape is ignored, and both buttons stay focusable with `aria-disabled` and ignore presses, so focus is never dropped. |
| Failure | A throw or rejection keeps the dialog open and shows `errorMessage` in a `role="alert"` danger [`Callout`](Callout.md). Confirming again retries. Closing or reopening clears the error. |
| Success | The dialog closes, focus returns to the trigger or `finalFocus`, then `onConfirmed` runs. |
| Outside press | Never dismisses, pending or not. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `ReactNode` | required | Trigger text; also the confirm button text unless `confirmLabel` is set |
| `title` | `ReactNode` | required | `Dialog` heading and accessible name; ask the question the action settles |
| `description` | `ReactNode` | unset | The consequence; the dialog's accessible description |
| `details` | `ReactNode` | unset | Further consequence content, such as what else is removed |
| `onConfirm` | `() => unknown` | required | Runs the action. Return a promise for asynchronous work; throw or reject on failure |
| `onConfirmed` | `() => void` | unset | Runs once per success, after the popup has unmounted; remove the trigger here. Also runs when success lands after a controlled close |
| `confirmLabel` | `ReactNode` | `children` | Confirm button text; repeat the action's verb |
| `pendingLabel` | `ReactNode` | `confirmLabel` | Confirm button text while the action runs |
| `cancelLabel` | `ReactNode` | `"Cancel"` | Cancel button text |
| `errorMessage` | `ReactNode \| (error: unknown) => ReactNode` | `"The action did not complete. Try again."` | Alert text after a failure; a function receives the thrown reason |
| `open` | `boolean` | uncontrolled | Controlled visibility |
| `defaultOpen` | `boolean` | `false` | Initial visibility when uncontrolled |
| `onOpenChange` | `(open: boolean) => void` | unset | Each visibility change, including the close after success; pending dismissals never reach it |
| `finalFocus` | `Dialog` `finalFocus` | trigger | Focus target after closing; set it when success removes the trigger |
| `container` | portal container | document body | Themed host for the popup |
| `classNames` | `{ popup?, backdrop?, details?, error? }` | unset | Classes for inner parts |
| `render` | Base UI `render` | `<Button variant="danger" />` | Trigger element |

```tsx
<ConfirmAction
  render={<Button variant="ghost" size="sm" />}
  aria-label="Revoke Laptop"
  title="Revoke Laptop?"
  description="Requests signed with this key fail immediately."
  confirmLabel="Revoke key"
  finalFocus={listHeading}
  onConfirm={() => revokeKey("laptop")}
  onConfirmed={() => removeRow("laptop")}
>
  Revoke
</ConfirmAction>
```

## Responsibilities

The application owns the operation: authorization, idempotency, timeouts and what the server deletes. `onConfirm` must settle; a promise that never settles leaves the dialog pending. Announce success in the page, because the dialog is gone when it completes. Remove the trigger's row in `onConfirmed`, not inside `onConfirm`: a data layer that removes the row while the action is still settling unmounts the dialog mid-close and loses focus. Do not attach the same action anywhere else on the trigger; the confirmation is its one route.

For an urgent interruption that needs `alertdialog` semantics, use an alert-dialog primitive. `ConfirmAction` remains a named modal dialog, as the [confirmation pattern](../../../../docs/guides/forms-and-overlays.md#confirmation-pattern) describes.

## Related components

Use [`Dialog`](Dialog.md) to compose a confirmation that needs fields or a different action layout. Use [`Button`](Button.md) `variant="danger"` alone only when the action is reversible, such as one with undo.
