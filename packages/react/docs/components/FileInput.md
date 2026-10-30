# FileInput

Use `FileInput` to choose files, review the selected list, and remove items. Your app decides which files to accept, keeps the `File` objects, and handles uploads. See [Retained file selection](https://github.com/KhallilB/kbui/blob/main/docs/guides/file-inputs.md) for examples, keyboard behavior, and styling. Available since v0.6.0.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-fileinput--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { FileInput, type FileInputItem } from "@kb.ui/react";
import { useState } from "react";

type Attachment = FileInputItem & { file: File };

export function Example() {
  const [items, setItems] = useState<Attachment[]>([]);
  return (
    <FileInput
      label="Attachments"
      items={items}
      onFiles={(files) =>
        setItems((current) => [
          ...current,
          ...files.map((file) => ({
            id: crypto.randomUUID(),
            name: file.name,
            file,
          })),
        ])
      }
      onRemove={(id) =>
        setItems((current) => current.filter((item) => item.id !== id))
      }
    />
  );
}
```

The example retains each original `File` alongside its display metadata. Your app chooses acceptance rules and builds `FormData` for uploads; see [retained file selection](https://github.com/KhallilB/kbui/blob/main/docs/guides/file-inputs.md#choosing-and-removing-files).

## More examples

- [Rejected selection feedback](https://kbui.kcb.pro/storybook/?path=/story/components-fileinput--rejected): Keep accepted items visible while explaining a rejection.
- [Image-picker hints](https://kbui.kcb.pro/storybook/?path=/story/components-fileinput--evidence): Compare image acceptance hints and helper text.
- [Item metadata](https://kbui.kcb.pro/storybook/?path=/story/components-fileinput--custom-content): Customize retained-file content without losing its identity.

## Reference

| Prop                                                 | Type                                 | Default                 | Notes                                                                |
| ---------------------------------------------------- | ------------------------------------ | ----------------------- | -------------------------------------------------------------------- |
| `label`                                              | `string`                             | required                | Visible field name and accessible picker context                     |
| `items`                                              | `readonly FileInputItem[]`           | required                | Retained files with stable ids, names, and optional descriptions     |
| `onFiles`                                            | `(files: File[]) => void`            | required                | Check the selection and update retained files in your app            |
| `onRemove`                                           | `(id: string) => void`               | required                | Request removal; update items to confirm it                          |
| `accept`                                             | `string`                             | unset                   | Native picker hint, such as image/*; does not validate files         |
| `multiple`                                           | `boolean`                            | `true`                  | Allow multiple selection; use a singular `chooseLabel` for single mode |
| `disabled`, `readOnly`                               | `boolean`                            | `false`                 | Prevent edits while keeping the retained list visible                |
| `description`, `error`                               | `string`                             | unset                   | Help or actionable rejection text associated with the field          |
| `visuallyHidden`                                     | `boolean`                            | `false`                 | Hide the visual label while preserving its accessible name           |
| `chooseLabel`                                        | `string`                             | Choose files            | Localized visible picker action                                      |
| `emptyMessage`                                       | `string`                             | No files added.         | Localized empty-state text                                           |
| `removeLabel`                                        | `(item: FileInputItem) => string`    | Remove + filename       | Accessible remove action; keep the filename in the name              |
| `removedMessage`                                     | `(item: FileInputItem) => string`    | filename + removed.     | Announcement after removal is confirmed                              |
| `selectionMessage`                                   | `(count: number) => string`          | count + files selected. | Announcement after native selection                                  |
| `renderItem`                                         | `(item: FileInputItem) => ReactNode` | name + description      | Custom item content; keep visible file identity                      |
| `inputRef`, `triggerRef`                             | element refs                         | unset                   | Hidden native `input` and visible picker access                        |
| `triggerClassName`, `listClassName`, `itemClassName` | `string`                             | unset                   | Classes for picker, retained list, and items                         |

Native `<div>` props, `ref` and `className` apply to the root. Root `aria-describedby` IDs follow the help and error IDs. Item button refs stay internal so removal can restore focus. Customize items through the item/content classes and `renderItem`; avoid changing individual item buttons. The `×` is decorative, and each removal button is named with the full filename.

## Related components

Use [`Progress`](Progress.md) to show upload progress supplied by your app. File selection and uploading are separate steps.
