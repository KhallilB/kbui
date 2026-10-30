# Status

Use `Status` for a state such as running, blocked, or complete. Always include text so the meaning is clear without relying on color or an icon.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-status--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Status } from "@kb.ui/react";

export function Example() {
  return (
    <Status tone="running" live>
      Build running
    </Status>
  );
}
```

## More examples

- [Changing state](https://kbui.kcb.pro/storybook/?path=/story/components-status--live): Check how status updates are announced.
- [Supporting iconography](https://kbui.kcb.pro/storybook/?path=/story/components-status--with-icon): Keep meaning in text when an icon is present.
- [A compact state label](https://kbui.kcb.pro/storybook/?path=/story/components-status--chip): Compare a contained appearance; the icon leads the chip.
- [A chip without an icon](https://kbui.kcb.pro/storybook/?path=/story/components-status--chip-without-icon): The chip leads with a dot in the tone's color.

## Reference

```tsx
<Status tone="running" appearance="chip" icon={<PlayIcon />} live>
  Running
</Status>
```

| Prop         | Values                                                             | Default   | Notes                                                                   |
| ------------ | ------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------- |
| `children`   | `ReactNode`                                                        | unset     | State text such as Running or Blocked; keep it meaningful without color |
| `tone`       | `neutral` / `info` / `running` / `success` / `warning` / `blocked` | `neutral` | Reinforces the written state                                            |
| `appearance` | `plain` / `chip`                                                   | `plain`   | Plain stays inline; chip adds separation with a tinted surface          |
| `icon`       | `ReactNode`                                                        | unset     | Decorative; the text still names the state. Replaces a chip's dot       |
| `live`       | `boolean`                                                          | `false`   | Adds `role=status` for changing text; does not move focus                 |
| `compact`    | `boolean`                                                          | `false`   | Tighter spacing and smaller text for dense layouts                      |

## Related components

Use [`Badge`](Badge.md) for static metadata, [`Progress`](Progress.md) for completion, and [`Callout`](Callout.md) for a fuller message.
