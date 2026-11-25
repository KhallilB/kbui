# TreeList

Show folders, topics, or categories as a hierarchy of native lists. Branches expand and collapse with a short height transition and a rotating chevron. Connector rails clarify the visible grouping.

[All components](../../README.md#components) · [Usage](#usage) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-treelist--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { TreeList, type TreeListItem } from "@kb.ui/react";

const items: readonly TreeListItem[] = [
  {
    id: "workspace",
    label: "Workspace setup",
    children: [
      { id: "profile", label: <a href="/guide/profile">Profile</a> },
      {
        id: "access",
        label: "Access",
        children: [{ id: "roles", label: <a href="/guide/roles">Team roles</a> }],
      },
    ],
  },
  { id: "help", label: <a href="/guide/help">Getting help</a> },
];

export function GuideTopics() {
  return <TreeList aria-label="Guide topics" items={items} defaultExpandedIds={["workspace"]} />;
}
```

## More examples

- [Controlled](https://kbui.kcb.pro/storybook/?path=/story/components-treelist--controlled) shows application-owned expansion in a runbook.
- [Depth cap](https://kbui.kcb.pro/storybook/?path=/story/components-treelist--depth-cap) shows how deep branches remain reachable in a shallow visual layout.
- [Formatted labels](https://kbui.kcb.pro/storybook/?path=/story/components-treelist--formatted-labels) shows inline emphasis, highlighted text, and longer branch names.

## Reference

| Prop | Type | Default | Purpose |
|---|---|---|---|
| `items` | `readonly TreeListItem[]` | Required | Items in display order. Each item has a unique stable `id`, a React `label`, and optional `children`. An item with no children is a leaf. |
| `expandedIds` | `readonly string[]` | — | Controls which branches are expanded. |
| `defaultExpandedIds` | `readonly string[]` | `[]` | Applies initial expansion in uncontrolled use. |
| `onExpandedChange` | `(ids: string[]) => void` | — | Receives the requested branch IDs after a toggle. Descendant expansion is retained when an ancestor closes. |
| `maxVisualDepth` | `number` | `4` | Number of indented child levels below the root. Zero removes indentation and rails. Negative values become zero, fractions round down, and non-finite values use the default. |
| `classNames` | `ClassNames<"root" \| "item" \| "trigger" \| "label" \| "branch">` | — | Adds classes to the outer list, items, branch buttons, labels, and nested lists. |
| `aria-label` / `aria-labelledby`, `className`, `ref` | Native `ul` props | — | Names, styles, or references the outer list. |

After the indentation cap, the component keeps rendering nested child lists at the same visual depth. Each branch still expands independently. Collapsed descendants stay mounted and are hidden from navigation. Keep IDs stable across renders to preserve expansion for the same entries. Choose short, descriptive branch labels and use noninteractive inline content inside each branch button. Place links at leaves.

Use `<strong>` for emphasis and `<mark>` to highlight a relevant phrase within a label. TreeList keeps the phrase in the text flow and styles the highlight with the current theme.

Tab and Shift+Tab navigate visible branch buttons and leaf links. Enter and Space toggle a focused branch button and keep focus on it. Pointer collapse returns focus to the branch button if it would hide the focused descendant. If the application closes a branch through a separate controlled update while one of its descendants has focus, move focus to a visible control as part of that update. Verify that every branch exposes the expected name and expanded state, and that nested links are skipped while their branch is closed.

Collapsing a branch immediately removes its descendants from keyboard and assistive-technology navigation. Reduced motion makes expansion and collapse instant.

Use `--kb-treelist-indent`, `--kb-treelist-rail`, `--kb-treelist-row-height`, and `--kb-treelist-hover-background` to style spacing, rails, and row highlights. Use `--kb-treelist-motion-duration` and `--kb-treelist-motion-easing` to adjust branch and chevron motion. They default to kbui’s 160 ms duration and standard easing. Preserve readable text, visible focus, and a clear branch indicator when overriding tokens. See [Implementing and verifying accessibility](../../../../docs/guides/accessibility.md) for keyboard, assistive technology, and visual verification.

## Related components

Use [CollectionList](CollectionList.md) for a flat list of peer records, [Disclosure](Disclosure.md) for a single expandable block, or [Accordion](Accordion.md) for related sections with headings and panels.
