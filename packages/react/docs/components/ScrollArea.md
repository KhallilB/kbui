# ScrollArea

Keep logs, activity, or other long content inside a height cap. Let ordinary page content scroll with the page when a separate region is unnecessary.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-scrollarea--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { ScrollArea } from "@kb.ui/react";

export function Example() {
  return (
    <ScrollArea label="Activity log" maxHeight="12rem">
      <p>Project created.</p>
      <p>Review requested.</p>
    </ScrollArea>
  );
}
```

## More examples

- [Keyboard scrolling](https://kbui.kcb.pro/storybook/?path=/story/components-scrollarea--default): Focus the named scrolling region and try the keyboard.

## Reference

| Prop         | Type              | Default  | Notes                                             |
| ------------ | ----------------- | -------- | ------------------------------------------------- |
| `label`      | `string`          | required | Accessible name of the focusable scrolling region |
| `children`   | `ReactNode`       | required | Content inside the viewport                       |
| `maxHeight`  | CSS length string | unset    | Height cap, such as 12rem; longer content scrolls |
| `classNames` | keyed classes     | unset    | Style viewport, scrollbar, or thumb               |

Tab reaches the viewport so keyboard users can scroll it. Keep the focus indicator visible and give the region a specific name such as Build output.

## Related components

Use [Panel](Panel.md) to group the scrolling content with its heading and actions.
