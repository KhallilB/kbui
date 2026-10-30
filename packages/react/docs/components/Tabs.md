# Tabs

Switch between peer panels within one page. Use links for navigation to another URL and `RadioGroup` for a single form choice.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-tabs--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Tabs } from "@kb.ui/react";

export function Example() {
  return (
    <Tabs defaultValue="summary">
      <Tabs.List aria-label="Project sections">
        <Tabs.Tab value="summary">Summary</Tabs.Tab>
        <Tabs.Tab value="activity" badge="3">Activity</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="summary">Project summary</Tabs.Panel>
      <Tabs.Panel value="activity">Recent activity</Tabs.Panel>
    </Tabs>
  );
}
```

## More examples

- [Section headers](https://kbui.kcb.pro/storybook/?path=/story/components-tabs--default): Select a release panel with arrow keys or a pointer.
- [Compact time windows](https://kbui.kcb.pro/storybook/?path=/story/components-tabs--pill): Small pill tabs with a disabled option.
- [Vertical settings](https://kbui.kcb.pro/storybook/?path=/story/components-tabs--vertical): Up/Down navigation beside settings content.
- [Retained settings draft](https://kbui.kcb.pro/storybook/?path=/story/components-tabs--retained-draft): Manual activation retains an input while its panel is hidden.

- [Nested panels](https://kbui.kcb.pro/storybook/?path=/story/components-tabs--nested): Each `Tabs` root owns its orientation, density and variant.

## Reference

| Part | Responsibility |
| --- | --- |
| `Tabs` | Selection owner, orientation, appearance and shared class names |
| `Tabs.List` | Named tab list with roving keyboard focus; inserts an indicator by default |
| `Tabs.Tab` | Named trigger with a unique value matching its panel |
| `Tabs.Indicator` | Optional explicit active indicator inside the list |
| `Tabs.Panel` | Content associated with a matching trigger |

| `Tabs` prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `value` | `string \| number \| null` | — | Controlled selection; null selects no panel |
| `defaultValue` | `string \| number \| null` | First enabled tab | Initial uncontrolled selection; null selects none |
| `onValueChange` | `(value, details) => void` | — | Selection request with Base UI reason, event and cancel method |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout and keyboard axis |
| `variant` | `"line" \| "pill"` | `"line"` | Underline or raised active surface |
| `size` | `"sm" \| "md"` | `"md"` | Trigger density |
| `className` | `string` | — | Root class |
| `classNames` | `ClassNames<TabsClassKey>` | — | root, list, tab, `tabIcon`, `tabLabel`, `tabBadge`, indicator, panel |

| Part prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `Tabs.List.activateOnFocus` | `boolean` | `true` | Select with arrow-key focus; false requires Enter/Space |
| `Tabs.List.loopFocus` | `boolean` | `true` | Wrap focus at list ends |
| `Tabs.List.showIndicator` | `boolean` | `true` | Insert automatic indicator; false leaves authored indicators intact |
| `Tabs.Tab.value` | `string \| number` | Required | Stable unique selection key |
| `Tabs.Tab.disabled` | `boolean` | `false` | Prevent selection; remain discoverable with arrow keys |
| `Tabs.Tab.icon` | `ReactNode` | — | Decorative leading icon |
| `Tabs.Tab.badge` | `ReactNode` | — | Trailing count/status included in accessible name |
| `Tabs.Panel.value` | `string \| number` | Required | Matching trigger value |
| `Tabs.Panel.keepMounted` | `boolean` | `false` | Retain hidden DOM and local draft state |

All parts forward refs, native element props and Base UI composition props; `className` accepts a string. Keep triggers and panels inside their `Tabs` root. Put an explicit indicator directly inside `Tabs.List`, or set `showIndicator` to false when supplying a custom composition. Use unique values within each root and avoid interactive elements inside tab labels or badges.

## Selection and focus

Base UI owns selection, tab/panel relationships and roving focus. Tab enters the selected trigger; Left/Right moves horizontal focus, Up/Down moves vertical focus, and Home/End reaches the first/last trigger. Disabled tabs can receive arrow-key focus but cannot be selected. Automatic activation selects enabled tabs while moving; manual activation requires Enter or Space. Controlled values change only when the parent updates them. A null value selects no tab.

Uncontrolled roots recover to an enabled tab when the selected tab is removed or disabled, reporting the reason through `onValueChange`. Controlled recovery belongs to the parent. User selection can be cancelled through details.cancel(); automatic fallback cannot. Applications own fetching, loading feedback and content availability. Prefer manual activation for panels that require loading.

Inactive panels unmount by default. `keepMounted` preserves their DOM and draft state while hiding them from reading and keyboard navigation; hidden components can still run effects. Default values must match a tab when selecting a particular initial panel.

## Styling and accessibility

Each part receives its nearest root’s `data-variant`, `data-size` and `data-orientation`, so nested roots retain independent styling. Use the documented classes and component tokens: `--kb-tabs-radius`, `--kb-tabs-list-padding`, `--kb-tabs-tab-height-sm`, `--kb-tabs-tab-height-md`, `--kb-tabs-indicator-thickness` and `--kb-tabs-panel-padding`. The tab list scrolls horizontally when labels exceed available width. Vertical tabs place the list beside the panel from 48rem of their own width; at narrower widths, the panel moves beneath the list.

For right-to-left interfaces, combine HTML `dir="rtl"` with Base UI `DirectionProvider direction="rtl"` so keyboard direction matches layout.

Name `Tabs.List` with `aria-label` or `aria-labelledby`. Keep tab labels descriptive and use associated panels for peer views. Verify selected versus focused states, hidden panel controls, long labels, both themes, forced colors and enlarged text. Browser automation covers tested keyboard and accessibility fixtures; manual screen-reader and browser-zoom checks remain pending. See [shared verification](../../../../docs/guides/accessibility.md) and the informative [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

## Related components

Use [`RadioGroup`](RadioGroup.md) for a form choice and [`Toolbar`](Toolbar.md) for grouped actions.
