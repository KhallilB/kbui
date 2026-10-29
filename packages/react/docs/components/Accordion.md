# Accordion

Group related disclosures under headings. Single expansion is the default; enable `multiple` when several answers or sections should remain visible together.

[All components](../../README.md#components) · [Usage](#usage) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-accordion--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Accordion } from "@kb.ui/react";

export function DeliveryQuestions() {
  return (
    <Accordion multiple defaultValue={["delivery"]}>
      <Accordion.Item value="delivery">
        <Accordion.Header render={<h2 />}>
          <Accordion.Trigger>When will my order arrive?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Orders dispatch within two working days.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="returns">
        <Accordion.Header render={<h2 />}>
          <Accordion.Trigger>Can I return an item?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Contact support with your order number.</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
```

## More examples

- [Multiple](https://kbui.kcb.pro/storybook/?path=/story/components-accordion--multiple): independent expanded sections.
- [Controlled](https://kbui.kcb.pro/storybook/?path=/story/components-accordion--controlled): application-owned values.
- [Nested](https://kbui.kcb.pro/storybook/?path=/story/components-accordion--nested): independent groups with contextual heading ranks.
- [Disabled](https://kbui.kcb.pro/storybook/?path=/story/components-accordion--disabled): unavailable controls with readable expanded details.

## Reference

| Part / prop | Type | Default | Purpose |
|---|---|---|---|
| `Accordion<Value>` | Base UI Accordion root props | `div` | Groups items; generic values preserve callback types. |
| `value` / `defaultValue` | `Value[]` | `[]` | Controlled or initial expanded item values. Use arrays in both modes. |
| `onValueChange` | `(values, details) => void` | — | Requests expansion changes; `details.cancel()` rejects them. |
| `multiple` | `boolean` | `false` | Allows independent expanded items. |
| `disabled` | `boolean` | `false` | Disables all triggers; does not conceal already open content. |
| `keepMounted` / `hiddenUntilFound` | `boolean` | `false` | Root defaults for panel retention or supported browser search reveal. |
| `Accordion.Item` | Base UI Accordion item props | `div` | Requires a stable unique `value` for controlled usage; accepts item `disabled`. |
| `Accordion.Header` | Base UI Accordion heading props | `h3` | Contains the trigger; use `render={<h2 />}` or another heading for document hierarchy. |
| `Accordion.Trigger` | Base UI Accordion trigger props | `button` | Visible section label and expansion control. |
| `Accordion.Panel` | Base UI Accordion panel props | Named `region` | Owns content; accepts per-panel retention options. |
| `className` / `render` / `ref` | Part-specific native props | — | Customize each part; class names accept strings. |

Tab and Shift+Tab visit enabled triggers and expanded controls in DOM order. Enter/Space toggle the focused item. Base UI 1.9 uses normal Tab navigation; its deprecated orientation and loopFocus props do not add arrow-key navigation. Closing the last open item is allowed. No business validation is inferred from expansion.

Keep essential information discoverable and interactive actions outside the heading button. Avoid an excessive number of region landmarks: keep groups focused and split large documents into meaningful sections. Hidden/unmounted content does not supply persistent form state: use keepMounted or caller-owned values. Nested groups own separate state.

Style `--kb-accordion-padding`, `-radius`, `-background`, `-color`, `-border` and `-trigger-height`; classes cover root, item, header, trigger and panel. Preserve expanded/disabled attributes and native focus outlines when composing custom renderers.

Panels expand and collapse through measured height transitions; reversing mid-transition follows the latest toggle. Content grows naturally once expanded. `--kb-accordion-motion-duration` and `-motion-easing` control panel and caret motion; reduced motion disables transitions. `.kb-accordion-panel-content` owns inner padding, keeping the outer Panel measurable without clipping collapsed padding. Panel props, className, render and ref still target the outer node.

## Related components

Use [Disclosure](Disclosure.md) for a single optional section or [Panel](Panel.md) for a structured work surface. Use [Popover](Popover.md) for controls anchored outside normal document flow.
