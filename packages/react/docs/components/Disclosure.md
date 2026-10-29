# Disclosure

Reveal optional details or advanced controls inline. Base UI Collapsible owns the open state, trigger relationship and hidden panel behavior.

[All components](../../README.md#components) · [Usage](#usage) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-disclosure--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Disclosure, Input } from "@kb.ui/react";

export function AdvancedSettings() {
  return (
    <Disclosure>
      <Disclosure.Trigger>Advanced settings</Disclosure.Trigger>
      <Disclosure.Panel keepMounted>
        <Input label="Reply-to address" defaultValue="team@example.com" />
      </Disclosure.Panel>
    </Disclosure>
  );
}
```

## More examples

- [Retained draft](https://kbui.kcb.pro/storybook/?path=/story/components-disclosure--retained-draft): preserve an uncontrolled field through collapse.
- [Controlled](https://kbui.kcb.pro/storybook/?path=/story/components-disclosure--controlled): caller-owned open state.
- [Disabled](https://kbui.kcb.pro/storybook/?path=/story/components-disclosure--disabled): unavailable details.

## Reference

| Part / prop | Type | Default | Purpose |
|---|---|---|---|
| `Disclosure` | Base UI Collapsible root props | `div` | Groups trigger and panel; accepts native props and ref. |
| `open` / `defaultOpen` | `boolean` | `false` | Controlled or initial expansion. |
| `onOpenChange` | `(open, details) => void` | — | Requests a state change; `details.cancel()` rejects it. |
| `disabled` | `boolean` | `false` | Prevents user toggling. |
| `Disclosure.Trigger` | Base UI Collapsible trigger props | `button` | Native Enter/Space activation and expanded/controls relationships. |
| `Disclosure.Panel` | Base UI Collapsible panel props | `div` | Contains optional details and controls. |
| `Panel.keepMounted` | `boolean` | `false` | Retains DOM and uncontrolled draft state while closed. |
| `Panel.hiddenUntilFound` | `boolean` | `false` | Uses browser find-in-page reveal where supported; overrides keepMounted. |
| `className` / `render` / `ref` | Part-specific native props | — | Style, compose and reference each DOM part. Class names accept strings. |

Tab reaches the trigger; Enter and Space toggle it without moving focus into the panel. Collapsed controls leave the accessibility tree and Tab order. No arrow-key navigation or modal behavior is added. Put essential instructions and errors where they remain discoverable. Unmounted content loses uncontrolled state; use keepMounted or store values outside the panel. Browser find-in-page reveal depends on engine support and the caller accepting controlled state changes.

Style `--kb-disclosure-padding`, `-radius`, `-background`, `-color`, `-border` and `-trigger-height`. Preserve visible focus, hidden semantics and disabled state when overriding styles.

Panels expand and collapse through measured height transitions; reversing mid-transition follows the latest toggle. Content grows naturally once expanded. `--kb-disclosure-motion-duration` and `-motion-easing` control panel and caret motion; reduced motion disables transitions. `.kb-disclosure-panel-content` owns inner padding, keeping the outer Panel measurable without clipping collapsed padding. Panel props, className, render and ref still target the outer node.

## Related components

Use [Accordion](Accordion.md) for related sections with headings, [Panel](Panel.md) for a structured work surface, or [Popover](Popover.md) for anchored supporting controls. [Overlay guidance](../../../../docs/guides/forms-and-overlays.md) covers choosing disclosure, popovers and modal patterns.
