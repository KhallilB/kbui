# Toast

Use `Toast` for temporary feedback about background work. One provider owns the message list, timers and focus. Keep essential results available in the page or a notification history.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-toast--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, Toast, useToastManager } from "@kb.ui/react";

function SaveButton() {
  const { add } = useToastManager();
  return (
    <Button onClick={() => add({ title: "Changes saved", description: "Your project is up to date.", type: "success" })}>
      Save changes
    </Button>
  );
}

export function Example() {
  return (
    <Toast.Provider timeout={5000} limit={3}>
      <SaveButton />
      <Toast.Viewport aria-label="Notifications" />
    </Toast.Provider>
  );
}
```

Mount one `Toast.Viewport` inside each provider. Fixed placements portal to `document.body`; `placement="inline"` renders in normal layout without a portal. Choose a logical corner with `top-start`, `top-end`, `bottom-start` or `bottom-end`. For a nested theme, pass a mounted themed element or ref through `container`; otherwise the document theme applies. The provider and hook are scoped, so nested providers maintain independent messages.

## Queue and timing

Messages display newest first. `limit` defaults to `3`; older overflow messages remain mounted, hidden and inert. Dismissing a newer message reveals an older message if it has not expired. Timers continue for overflow messages. This is a temporary notification stack, not a FIFO delivery queue or durable history.

`timeout` defaults to `5000` milliseconds; a per-message timeout overrides the provider. Set `timeout: 0` to keep a message until dismissed. Hover, keyboard focus in the viewport and window blur pause timers; leaving resumes the remaining duration. New messages added while paused also wait. Unmounting the provider clears its timers and subscriptions.

Use `timeout: 0` for essential information or time-sensitive actions. Supply an application preference to disable or adjust time limits where the task requires it; hover/focus pause alone does not meet every requirement of [WCAG 2.2.1 Timing Adjustable, Level A](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html).

F6 moves focus into the viewport without notifications interrupting the current task. Tab reaches messages and actions. Escape dismisses the focused message. Dismissal keeps focus within remaining messages or returns it to the previous working control when the last message closes. Close buttons provide a pointer and keyboard alternative to swipe dismissal.

## More examples

- [Overflow and dismissal](https://kbui.kcb.pro/storybook/?path=/story/components-toast--queue): Hide older messages and reveal persistent messages as capacity returns.
- [Undo action](https://kbui.kcb.pro/storybook/?path=/story/components-toast--with-action): Update an existing notification after an action.
- [Timed dismissal](https://kbui.kcb.pro/storybook/?path=/story/components-toast--timed): Enter notifications with F6, dismiss with Escape and return to work.
- [Promise states](https://kbui.kcb.pro/storybook/?path=/story/components-toast--promise-state): Keep message identity through loading and success.
- [Custom composition](https://kbui.kcb.pro/storybook/?path=/story/components-toast--custom-composition): Render typed message data and a real navigation link.
- [Positioned urgent message](https://kbui.kcb.pro/storybook/?path=/story/components-toast--positioned): Use a portaled corner viewport and a high-priority announcement.
- [Long content](https://kbui.kcb.pro/storybook/?path=/story/components-toast--long-content): Check wrapping, actions and dismissal at narrow widths.

## Reference

### Toast.Provider

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `ReactNode` | unset | Application content and one viewport |
| `timeout` | `number` | `5000` | Milliseconds before dismissal; `0` disables automatic dismissal |
| `limit` | `number` | `3` | Maximum visible active messages; use a positive integer |
| `toastManager` | `ToastManager` | unset | Optional external manager created once per application or request |

### Toast.Viewport

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `placement` | `ToastPlacement` | `bottom-end` | Four logical corners or `inline` |
| `container` | `HTMLElement` or ref | `document.body` | Portal host for fixed placements; unused for inline |
| `aria-label` | `string` | `Notifications` | Localize and distinguish the notification region |
| `renderToast` | `(toast: ToastObject<Data>) => ReactNode` | complete `Toast` | Custom renderer; give each returned root `key={toast.id}` |
| `children` | `ReactNode` | managed messages | Explicit children replace automatic rendering |
| `className`, `ref`, DOM props | native `div` props | unset | Reach the viewport; Base UI `render` composition is supported |

### Toast and parts

| Prop or part | Type | Default | Notes |
| --- | --- | --- | --- |
| `toast` | `ToastObject<Data>` | required | Message from the matching provider |
| `tone` | `neutral`, `info`, `success`, `warning`, `danger` | from type | `error` maps to danger; loading maps to info; other types fall back to neutral |
| `closeLabel` | `string` | `Dismiss notification` | Localized name for default close control |
| `classNames` | content, title, description, action, close | unset | Extra classes for default slots |
| `children` | `ReactNode` | complete message | Overrides default content and close control |
| `swipeDirection` | Base UI swipe directions | down and right | Configure or disable with an empty array |
| `Toast.Content` | content wrapper | div | Groups message content |
| `Toast.Title` | heading | message title | Supplies the root accessible name |
| `Toast.Description` | paragraph | message description | Supplies the root accessible description |
| `Toast.Action` | button | message `actionProps` | Does not close automatically; explicitly call close or update |
| `Toast.Close` | button | caller children | Dismisses its message; supply visible text or an accessible name |
| `className`, `ref`, DOM props | part element props | unset | Every part supports a plain class string, ref and Base UI render composition |

Custom children own their own slot classes and close control. For a link action, use `render={<a href="…" />}`, `nativeButton={false}` and `role="link"`. Default parts render title, description and action only when the message supplies them. Description-only messages, including shorthand promise text, become the title so the default dialog stays named. Give every message meaningful title text; an icon or color cannot replace it. Keep `title` and `description` on the message even when custom parts render them, because urgent announcements use the stored message content.

### Managers and messages

`useToastManager<Data>()` returns reactive `toasts`, `add`, `update`, `close` and `promise` from the nearest provider. `createToastManager<Data>()` supplies the same methods outside React; pass it to `toastManager`. Create a stable instance per application or server request. Calls made before provider subscription or after unmount are not buffered. Do not share a module-level manager between server requests.

| Method or option | Type | Behavior |
| --- | --- | --- |
| `add(options)` | `ToastAddOptions<Data>` | Returns string ID; adding the same ID updates in place and refreshes its timer |
| `update(id, options)` | `ToastUpdateOptions<Data>` or updater | Changes existing content; an explicit timeout restarts timing |
| `close(id?)` | optional string ID | Closes one message or all messages; callbacks fire once |
| `promise(value, options)` | promise and loading/success/error options | Persistent loading message becomes success/error using same ID; resolves or rejects with original result |
| `title`, `description` | `ReactNode` | Stored message and announcement text |
| `type` | `string` | Visual type; use words in content to explain status |
| `priority` | `low` or `high` | Low is polite; high uses a separate urgent alert announcement |
| `timeout` | `number` | Per-message duration; `0` disables automatic dismissal |
| `id` | `string` | Optional stable key for upsert |
| `actionProps` | native `button` props | Includes action text, handler, disabled state and accessible name |
| `onClose`, `onRemove` | `() => void` | Close intent and final removal after exit transition |
| `data` | caller-defined object | Typed custom data for `renderToast` |

Promise options accept `loading`, `success` and `error` as text or update options; success/error also accept functions of the result/error. Handle rejected returned promises in application code. `ToastObject`, `ToastManager`, `ToastAddOptions`, `ToastUpdateOptions`, `ToastPromiseOptions`, component prop types, `ToastTone` and `ToastPlacement` are public exports.

Base UI owns interaction and lifecycle semantics; see its [`Toast` reference](https://base-ui.com/react/components/toast). CSS-only consumers must implement queueing, announcements, timing and focus themselves. Component tokens use the `--kb-toast-*` namespace; importing a standalone `toast.css` also requires tokens and reset.

## Motion

Messages enter with a short slide and soft scale settle; dismissal fades and collapses the space before removal. `Stack` spacing opens as a new message enters, and swipe dismissal continues in the gesture direction. Reduced motion removes transitions and geometric movement.

Tune `--kb-toast-motion-duration`, `--kb-toast-exit-duration`, `--kb-toast-motion-easing`, `--kb-toast-enter-offset` and `--kb-toast-enter-scale` to match the application. Keep exits brief so notifications do not obstruct work.

## Accessibility evidence and limits

Component tests cover lifecycle, announcements in the DOM, provider isolation, callbacks and portal composition. Browser stories exercise keyboard/focus, live-region structure, queue visibility, actions and real timing in both themes and motion preferences. These checks do not prove spoken delivery. Test relevant initial/update/urgent messages with supported screen readers and confirm no duplicate announcements. Manual screen-reader interoperability remains unverified; follow the [shared accessibility procedure](../../../../docs/guides/accessibility.md).

## Related components

Use [`Status`](Status.md) for state beside its content, [`Callout`](Callout.md) for an inline message with fuller context, and [`Dialog`](Dialog.md) when a decision must interrupt work.
