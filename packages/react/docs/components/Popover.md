# Popover

Reveal supporting controls or details in an anchored popup while retaining page context. Base UI owns positioning, focus management and dismissal. Non-modal interaction is the default.

[All components](../../README.md#components) · [Usage](#usage) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-popover--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, Input, Popover } from "@kb.ui/react";

export function ViewOptions() {
  return (
    <Popover>
      <Popover.Trigger render={<Button variant="secondary" />}>View options</Popover.Trigger>
      <Popover.Content title="View options">
        <Popover.Body><Input label="Contains text" /></Popover.Body>
        <Popover.Footer>
          <Popover.Close render={<Button />}>Done</Popover.Close>
        </Popover.Footer>
      </Popover.Content>
    </Popover>
  );
}
```

## More examples

- [Display preferences](https://kbui.kcb.pro/storybook/?path=/story/components-popover--default): immediate, reversible changes to the activity list, with Reset and Done.
- [Controlled editing](https://kbui.kcb.pro/storybook/?path=/story/components-popover--controlled): drafts, Cancel, validation and native Enter submission; only Save commits the new name.
- [Nested theme](https://kbui.kcb.pro/storybook/?path=/story/components-popover--scoped-portal): portal inside a local theme host.
- [Inside Dialog](https://kbui.kcb.pro/storybook/?path=/story/components-popover--inside-dialog): nested Escape dismissal and focus recovery.
- [Scrolling workspace](https://kbui.kcb.pro/storybook/?path=/story/components-popover--scrolling): keep a compact form and its Done action visible while the surrounding workspace scrolls.

## Reference

| Part / prop | Type | Default | Purpose |
|---|---|---|---|
| `Popover` | Base UI Popover root props | — | Groups parts without adding a DOM element. |
| `open` / `defaultOpen` | `boolean` | `false` | Controlled or initial open state. |
| `onOpenChange` | `(open, details) => void` | — | Requests opening/dismissal; supports `details.cancel()`. |
| `modal` | `boolean` or `"trap-focus"` | `false` | Configures interaction containment. Include Close for modal focus containment and touch-screen-reader escape. |
| `Popover.Trigger` | Base UI Popover trigger props | `button` | Supports Button composition, refs and native disabled. |
| `Popover.Content` | Base UI Popover popup props | `div` | Portaled interactive popup with ref and native attributes. |
| `Content.title` / `description` | `ReactNode` | — | Adds associated Title and Description inside Header; omit when composing those parts. |
| `Content.container` | Base UI portal container | `document.body` | Targets a stable theme host, including refs. |
| `Content.side` / `align` | Base UI positioner values | `bottom` / `start` | Preferred placement; collision handling may adjust it. |
| `Content.sideOffset` | Base UI side offset | `6` | Gap from trigger in CSS pixels. |
| `Content.positionerProps` | Base UI positioner props | — | Advanced collision boundary/padding, offsets, custom anchor, styles and ref; excludes children, className, side, align and sideOffset. |
| `Content.initialFocus` / `finalFocus` | Base UI focus target | Primitive defaults | Customize entry and return focus; supports refs and callbacks. |
| `Content.className` | `string` | — | Additional popup class. |
| `Content.classNames` | `{ positioner?: string }` | — | Additional class on positioning wrapper. |
| `Popover.Title` / `Description` | Base UI naming part props | — | Compose accessible names and descriptions; accepts string className and refs. |
| `Popover.Header` / `Body` / `Footer` | Native `div` props and refs | `div` | Header and Footer stay outside Body scrolling. Body must be a direct Content child; Footer holds visible actions. |
| `Popover.Close` | Base UI close props | `button` | Dismisses without performing an application action. |

Name every popup with title, Title or aria-label. Include a visible Close action, especially for touch and modal usage. Escape closes the popup and restores focus; a non-modal outside press dismisses while allowing outside interaction. Default keyboard opening focuses the first tabbable control or the popup; touch opening can focus the popup to avoid launching a virtual keyboard. Keep required instructions available outside temporary content.

Keep popovers short: show the relevant controls and a visible Done/Close action together. Avoid artificial height caps, large descriptions or long lists of secondary content. Use Dialog, Drawer or inline Disclosure when a task needs more room.

For constrained viewports, compose direct Header, Body and Footer children. Content title/description props create Header automatically. Only Body shrinks and scrolls; Footer actions and the heading stay visible. A long scrollable Body needs a name and `tabIndex={0}` for keyboard scrolling; keep essential instructions and actions outside it. The outer popup can still scroll as a fallback when enlarged header/footer content alone exceeds available space. The popup fits the positioning engine's available width/height. `positionerProps` retains Base UI collision and anchor configuration. Set `container` for nested themes and keep the host outside clipping/transformed ancestors when needed. See [theme hosts and portals](../../../../docs/guides/forms-and-overlays.md#theme-hosts-and-portals).

Style `--kb-popover-width`, `-padding`, `-background`, `-color`, `-border`, `-radius` and `-shadow`. `--kb-popover-motion-duration`, `-motion-easing`, `-enter-scale` and `-enter-offset` control anchored motion; reduced motion disables transitions and movement. Position changes track scrolling immediately. Change theme-dependent aliases on the appropriate portal host.

## Interaction patterns

Use an explicit button with a descriptive label. A decorative chevron can show that it reveals controls; preserve the trigger's expanded state and native Enter/Space handling. Open by click, tap or keyboard activation. Keep non-modal controls in normal Tab order and provide a visible dismissal action. Escape returns focus to the trigger; outside press dismisses without blocking the surrounding page. Base UI owns these behaviors and adapts touch focus to avoid opening a virtual keyboard unnecessarily.

Choose one update model and explain it:

| Task | Update model | Actions and dismissal |
|---|---|---|
| View preferences | Apply immediately; show the effect in surrounding content. | Reset restores defaults; Done, Escape and outside press retain the chosen settings. |
| Edit a value | Keep a separate draft until valid submission. | Save/Enter commits; Cancel, Escape and outside press discard the draft. Reopening starts from the saved value. |

The Default and Controlled stories implement these two models. Do not label a dismiss-only button Save, and do not silently commit a draft on outside dismissal. Keep asynchronous operations and error recovery application-owned.

Test the actual embedding viewport. A portal escapes DOM clipping but cannot escape an iframe's viewport. Leave space around the trigger for the complete panel and its actions; a tiny host must offer a larger preview or compose Dialog/Drawer. Do not accept a Body that collapses to zero height while a field technically remains in the accessibility tree. Catalog previews reserve the popup footprint and open the real panel at mobile/desktop widths, including paired themes.

Follow the [Base UI focus/positioning contract](https://base-ui.com/react/components/popover) and [WAI non-modal dialog guidance](https://www.w3.org/TR/wai-aria-1.2/#dialog). For complex tasks on compact screens, use an explicit sheet/dialog composition and preserve its modal semantics rather than changing modes during an open interaction.

## Verification limits

Run `bun run test:overlays` for Chromium, Firefox and WebKit checks in both themes and motion preferences. Scans exclude only Base UI’s implementation focus guards, following maintainer guidance; real controls retain naming checks. Native keyboard and scanner negative-control regressions protect that boundary. See [overlay verification](../../../../docs/guides/accessibility.md#overlay-compatibility) for the policy and manual screen-reader assessment limits.

## Related components

Use [Tooltip](Tooltip.md) for brief non-interactive hints, [Menu](Menu.md) for action lists, [Disclosure](Disclosure.md) for inline details, and [Dialog](Dialog.md) for modal tasks and the documented drawer/confirmation patterns.
