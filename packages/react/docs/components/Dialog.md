# Dialog

`Dialog` is composed from parts. Base UI handles focus trapping, closing on Escape and scroll locking.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-dialog--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, Dialog } from "@kb.ui/react";

export function Example() {
  return (
    <Dialog>
      <Dialog.Trigger render={<Button />}>View details</Dialog.Trigger>
      <Dialog.Content
        title="Project details"
        description="Current project status."
      >
        <p>Three tasks remain.</p>
        <Dialog.Actions>
          <Dialog.Close render={<Button />}>Done</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  );
}
```

## More examples

- [A confirmation task](https://kbui.kcb.pro/storybook/?path=/story/components-dialog--confirm): Open and close a modal from its trigger.
- [Structured content](https://kbui.kcb.pro/storybook/?path=/story/components-dialog--sections): Inspect header, body, footer, and actions; opens a modal.
- [A custom layout](https://kbui.kcb.pro/storybook/?path=/story/components-dialog--custom-layout): Inspect composed titles and descriptions; opens a modal.

## Reference

| Part                                            | Purpose                                                                                                                       |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `Dialog`                                        | Root. Accepts `open`, `defaultOpen` and `onOpenChange` for controlled use.                                                    |
| `Dialog.Trigger`                                | Opens the dialog. Use `render={<Button />}` to style it as a button.                                                          |
| `Dialog.Content`                                | The dialog. `title` and `description` set its accessible name and description; `container` changes where it mounts.           |
| `Dialog.Title`, `Dialog.Description`            | For custom layouts. Use these or the `Dialog.Content` props in a given dialog, not both, or it gets two titles.               |
| `Dialog.Header`, `Dialog.Body`, `Dialog.Footer` | Optional structured sections; accept native `div` props and refs. Padding follows `--kb-dialog-{header,body,footer}-padding`. |
| `Dialog.Actions`                                | Aligns buttons along the bottom right.                                                                                        |
| `Dialog.Close`                                  | Closes the dialog.                                                                                                            |

| Prop on root or Content  | Type             | Default       | Notes                                                                         |
| ------------------------ | ---------------- | ------------- | ----------------------------------------------------------------------------- |
| `open` on Dialog         | `boolean`        | uncontrolled  | Current visibility when your app controls the dialog                          |
| `defaultOpen` on Dialog  | `boolean`        | `false`       | Initial visibility; avoid starting open in a reading surface                  |
| `onOpenChange` on Dialog | Base UI callback | unset         | Receives the next visibility and change details                               |
| `title` on Content       | `ReactNode`      | unset         | Visible title and accessible name; use Dialog.Title for custom markup instead |
| `description` on Content | `ReactNode`      | unset         | Supporting description; use Dialog.Description for custom markup instead      |
| `container` on Content   | portal container | document body | Themed host for a nested dialog                                               |

```tsx
<Dialog>
  <Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>
  <Dialog.Content title="Rename file">
    <Input label="Name" />
    <Dialog.Actions>
      <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
      <Button>Save</Button>
    </Dialog.Actions>
  </Dialog.Content>
</Dialog>
```

## Related components

Use [Menu](Menu.md) for a short action list and [Callout](Callout.md) for a message that belongs in the page.
