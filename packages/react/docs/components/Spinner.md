# Spinner

Signal an indeterminate wait when completion percentage is unknown. Pair standalone indicators with a clear status label, or mark the spinner decorative inside a button that already names its busy action.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-spinner--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Spinner } from "@kb.ui/react";

export function Example() {
  return <Spinner label="Loading workspace" showLabel />;
}
```

## More examples

- [Visible status label](https://kbui.kcb.pro/storybook/?path=/story/components-spinner--with-visible-label): Pair the animated arc with explicit text describing what is loading.
- [Busy button submission](https://kbui.kcb.pro/storybook/?path=/story/components-spinner--busy-button): Render a decorative spinner inside a disabled button during asynchronous submission.
- [Sizes and tones](https://kbui.kcb.pro/storybook/?path=/story/components-spinner--sizes-and-tones): Match compact controls, inline status rows, or section-level waits.

## Reference

| Prop         | Type                                                                                | Default     | Notes                                                                                |
| ------------ | ----------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------ |
| `label`      | `ReactNode`                                                                         | `"Loading"` | Accessible status text announced by `role="status"`                                  |
| `showLabel`  | `boolean`                                                                           | `false`     | Renders `label` visibly beside the spinner instead of `.kb-sr-only`                  |
| `decorative` | `boolean`                                                                           | `false`     | Omits `role="status"` and sets `aria-hidden="true"` inside already-labeled controls  |
| `size`       | `sm` / `md` / `lg`                                                                  | `md`        | Scales the SVG indicator and accompanying label                                      |
| `tone`       | `current` / `accent` / `neutral` / `info` / `success` / `warning` / `danger`        | `accent`    | Stroke ink; use `current` inside buttons or badges to inherit text color             |
| `classNames` | keyed classes                                                                       | unset       | Style `icon`, `track`, `arc`, or `label`                                             |

## Related components

Use [Progress](Progress.md) when a numeric completion ratio exists, [Skeleton](Skeleton.md) to preserve layout geometry while loading content, and [Status](Status.md) for persistent state labels.
