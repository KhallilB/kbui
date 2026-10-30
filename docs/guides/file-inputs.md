# Retained file selection

Use `FileInput` when people need to choose files, review the selection, and remove individual items. For native selection alone, use `Input type="file"`. `FileInput` handles the picker, list, and focus after removal. Your app keeps the `File` objects, validates them, and handles parsing or uploading.

Install the [React adapter](using-kbui.md#installing), import `FileInput` and `FileInputItem` from `@kb.ui/react`, and load its bundled `@kb.ui/react/styles.css` once. Native file dialogs differ across browsers and operating systems; the picker has been exercised in Chromium.

```tsx
import { useState } from "react";
import { FileInput } from "@kb.ui/react";

export function DeliveryEvidence() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  return <FileInput label="Optional delivery evidence" multiple accept="image/jpeg,image/png"
    items={files.map(file => ({ id: file.name, name: file.name,
      description: `${(file.size / 1_000_000).toFixed(1)} MB` }))}
    onFiles={incoming => {
      const accepted = [...files];
      const rejected: string[] = [];
      for (const file of incoming) {
        if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 5_000_000)
          rejected.push(`${file.name}: choose JPEG/PNG up to 5 MB.`);
        else if (accepted.some(item => item.name === file.name))
          rejected.push(`${file.name}: already added.`);
        else if (accepted.length >= 3) rejected.push(`${file.name}: maximum 3 files.`);
        else accepted.push(file);
      }
      setFiles(accepted);
      setError(rejected.join(" "));
    }}
    onRemove={id => setFiles(current => current.filter(file => file.name !== id))}
    description="JPEG or PNG · up to 3 files · 5 MB each" error={error} />;
}
```

This example rejects duplicate filenames, so it also uses filenames as item IDs. If your app allows duplicate names, give each item a separate stable ID. The Storybook document example shows the same API with DOCX/CSV files, word-count metadata supplied by the app, and custom list content. `FileInput` does not read file contents or calculate word counts.

## Choosing and removing files

Pass the selected list through `items`, and update it when `onRemove(id)` is called. Each item needs a unique, stable `id`, a visible `name`, and an optional `description: ReactNode`. `onFiles(File[])` gives your app the original `File` objects without reading or filtering them. The `accept` prop helps the picker suggest file types; it does not validate them. Check every file in your app, then decide which items and errors to show.

After a selection, `FileInput` clears the native `input` so the same file can be chosen again. Canceling the picker or choosing no files leaves the list unchanged and does not call `onFiles`. The labelled picker button opens the hidden native `input`.

Because the native `input` is cleared, a normal form submission does not include the selected list. Keep the `File` objects in your app’s state and build `FormData` when uploading. `FileInput` does not provide `name`, `form`, or `required` props for file submission.

When someone removes a file with the keyboard, focus moves after your app removes that item from `items`: to the next file, the previous file if there is no next file, or the picker if the list is empty. If your app keeps the item, focus stays where it is. A delayed update does not pull focus back after someone has moved elsewhere. Unrelated list updates do not move focus.

`FileInput` announces file selections and confirmed removals. A selection announcement means files were chosen, not that your app accepted them. Pass rejection messages through `error`; they are announced as alerts.

`disabled` and `readOnly` prevent choosing or removing files and keep the list readable. Both disable the picker and remove buttons because native file inputs have no read-only selection mode. Keep item IDs stable between renders so focus can follow the right file. `FileInput` does not use global listeners, polling, or timers.

## API

See the [`FileInput` API](../../packages/react/docs/components/FileInput.md) for props, defaults, and events.

## Styling and themes

Style the `.kb-fileinput` root and its parts: `-label`, `-native`, `-trigger`, `-description`, `-error`, `-list`, `-item`, `-content`, `-name`, `-metadata`, `-remove`, and `-empty`. The root exposes `data-disabled`, `data-readonly`, and `data-invalid`. The picker and remove actions use KBUI `Button` styles and focus behavior. Filenames wrap rather than being truncated.

The full stylesheet, `@kb.ui/react/styles.css` or `@kb.ui/css/styles.css`, includes everything `FileInput` needs. If you import individual stylesheets, include `@kb.ui/css/components/button.css` with `fileinput.css`, tokens, and reset styles.

Use `--kb-fileinput-radius`, `--kb-fileinput-action-height` (48px by default), and `--kb-fileinput-border-width` to adjust the layout. Semantic foreground, muted, border, and danger colors, along with `Button` tokens, control the remaining colors. Apply theme variables to the field’s container, then check contrast for filenames, metadata, and errors. `FileInput` adds no animation; its buttons respect reduced motion and forced colors.

Storybook includes document and image selections, custom content, long filenames, empty and rejected selections, disabled and read-only fields, and both themes. In your app, check choosing the same file again, canceling, rejected removals, keyboard focus after removal, and narrow layouts. `FileInput` covers file selection; add previews, drag and drop, upload progress, or storage in your app when needed.
