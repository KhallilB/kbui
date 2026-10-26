# Retained file selection

Use `FileInput` when people add and remove a retained set of files, including partial rejection. Use plain `Input type="file"` when native selection alone is enough. FileInput owns picker/list interaction and focus continuity; consumers own validation, retained File objects, parsing and uploads.

Import `FileInput` and `FileInputItem` from `@kbui/react`, with matching CSS loaded once. Prepared after 0.5.0, unreleased as of 2026-10-26. No dependency or network service is added. Native file dialogs vary by browser/platform; only Chromium is exercised here.

```tsx
import { useState } from "react";
import { FileInput } from "@kbui/react";

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

This synthetic return-label.jpg example uses unique filenames as IDs because its policy rejects duplicate names. Other products can assign independent stable IDs. The translation story uses the same API with welcome-guide.docx and room-labels.csv, caller-owned word metadata, DOCX/CSV policy and custom content. FileInput never invents word counts.

## Controlled list and native boundary

`items` is the authoritative retained list; `onRemove(id)` requests a change. Each item has unique stable `id`, visible `name` and optional `description: ReactNode`. `onFiles(File[])` receives original native File objects; no spreading, reading or filtering occurs. `accept` is a picker hint, not validation. Consumers must inspect all selected files and enforce policy. Accepted/rejected subsets never replace one another implicitly.

After a nonempty selection callback, native value is cleared so the same file can be selected again. A canceled picker/empty change emits no callback and leaves retained items alone. The native input is hidden; the visible labeled Button opens it. Native form submission cannot serialize this retained subset after clearing. Keep File objects in consumer state and build FormData explicitly when implementing an authorized upload. No name/form/required upload contract is provided.

Keyboard activation of a focused remove action records its identity. Once the controlled item disappears, focus moves to the next item at that position, otherwise the previous item, otherwise the picker. Refused removal leaves focus unchanged. If the user moves focus elsewhere before a delayed list update, FileInput does not steal it. Unrelated external list changes do not trigger focus repair. Announcements describe native selection and confirmed removal; selection does not imply acceptance. Errors are caller text announced as alerts.

Disabled/readOnly block picker, removal and mutation callbacks. Retained items remain readable. Read-only picker/removal actions are disabled because HTML file inputs have no read-only selection behavior. Stable IDs are required; changing IDs during render invalidates focus tracking. No global listeners, polling or timers are used.

## API

See the canonical [FileInput API](../../packages/react/README.md#fileinput) for props, defaults and events.

## Anatomy and theme

Public `.kb-fileinput` root and parts: `-label`, `-native`, `-trigger`, `-description`, `-error`, `-list`, `-item`, `-content`, `-name`, `-metadata`, `-remove`, `-empty`. Root states: `data-disabled`, `data-readonly`, `data-invalid`. Picker/removal use maintained Button behavior and focus styles. If loading standalone styles, include `@kbui/css/components/button.css` alongside fileinput.css, tokens and reset; the complete styles.css bundle already includes it. List content wraps without truncating names.

Variables: `--kb-fileinput-radius`, `action-height` (48px default), `border-width`; semantic foreground/muted/border/danger and Button variables control remaining colors. Set semantic variables at the actual light/dark field boundary. Caller-owned lists/errors/metadata should retain contrast. The component adds no motion; shared Button honors reduced motion and forced colors.

Runnable stories cover linen evidence, translation documents, custom content, long names, empty, rejection, disabled/readOnly and light/dark. Verify native selection/reselection, cancellation, controlled refusal, middle/last/only removal focus and actual host reflow. No drag/drop, previews, upload queue, progress, storage or file validation service is included. Those require separate evidence and scope.
