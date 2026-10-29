# Toast

Confirm asynchronous completion, surface background progress, or offer an immediate retry when a non-blocking action fails.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-toast--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, Toast, useToastManager } from "@kb.ui/react";

function SaveTrigger() {
  const toastManager = useToastManager();
  return (
    <Button
      onClick={() =>
        toastManager.add({
          type: "success",
          title: "Configuration saved",
          description: "Edge routing rules were propagated to all regions.",
        })
      }
    >
      Save configuration
    </Button>
  );
}

export function Example() {
  return (
    <Toast.Provider>
      <SaveTrigger />
    </Toast.Provider>
  );
}
```

## More examples

- [Recoverable action failure](https://kbui.kcb.pro/storybook/?path=/story/components-toast--with-recovery-action): Pair an error notification with an inline retry button so people can recover without losing context.
- [Semantic tones](https://kbui.kcb.pro/storybook/?path=/story/components-toast--tones): Compare `neutral`, `info`, `success`, `warning`, `danger`, and `loading` notifications.
- [Asynchronous submission and retry](https://kbui.kcb.pro/storybook/?path=/story/components-toast--async-submission-and-retry): Transition a queued toast from `loading` to `success` or `error` with a retry callback.

## Reference

| Prop          | Type                                                                 | Default                  | Notes                                                                                  |
| ------------- | -------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------- |
| `title`       | `ReactNode`                                                          | unset                    | Primary notification summary                                                           |
| `description` | `ReactNode`                                                          | unset                    | Supporting detail or remediation hint                                                  |
| `tone`        | `neutral` / `info` / `success` / `warning` / `danger` / `loading`    | `neutral`                | Sets border and icon ink; `loading` renders a decorative spinner by default            |
| `icon`        | `ReactNode`                                                          | spinner when `loading`   | Decorative icon rendered beside the title and description                              |
| `actionLabel` | `ReactNode`                                                          | unset                    | Label for the built-in recovery or undo button                                         |
| `onAction`    | `(event: MouseEvent<HTMLButtonElement>) => void`                     | unset                    | Click handler for the built-in action button                                           |
| `action`      | `ReactNode`                                                          | unset                    | Custom action element rendered in `.kb-toast-actions`                                  |
| `closable`    | `boolean`                                                            | `true` (`false` loading) | Shows the dismiss button                                                               |
| `closeLabel`  | `string`                                                             | `"Dismiss notification"` | Accessible label for the dismiss button                                                |
| `toast`       | `ToastObject<ToastData>`                                             | unset                    | Managed toast item when rendering custom children inside `Toast.Viewport`              |
| `classNames`  | keyed classes                                                        | unset                    | Style `viewport`, `content`, `icon`, `body`, `title`, `description`, `actions`, `action`, `close` |

## Related components

Use [Spinner](Spinner.md) inside the triggering button while a request is in flight, [Callout](Callout.md) for persistent page-level messages, and [ErrorSummary](ErrorSummary.md) for form validation failures.
