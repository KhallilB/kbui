# Forms and overlays

Field APIs (`Select`, `Checkbox`, `RadioGroup`, `Switch`) live in the [React API](../../packages/react/README.md). This guide covers what spans components: theme hosts for portaled popups, structured dialogs, surface tokens and the accessibility contracts the shared suite checks.

## Theme hosts and portals

Set tokens on a stable theme wrapper. Select mounts its popup inside its own root, so nested themes reach it. Dialog, `Menu.Content` and Tooltip mount on `document.body` by default; pass the wrapper as `container` when colors or timing live on a nested element:

```tsx
import { useRef } from "react";
import { Button, Menu } from "@kbui/react";

export function ThemedActions() {
  const host = useRef<HTMLDivElement>(null);
  return (
    <div ref={host} data-theme="dark">
      <Menu>
        <Menu.Trigger render={<Button />}>Actions</Menu.Trigger>
        <Menu.Content container={host}>
          <Menu.Item>Inspect</Menu.Item>
        </Menu.Content>
      </Menu>
    </div>
  );
}
```

Keep the host outside overflow clipping and transformed ancestors when a popup must escape them. A Select inside a scrolling Dialog should target an unclipped outer host.

Aliases resolve where they are declared. Inside a nested surface, set component tokens such as `--kb-popup-background` or `--kb-dialog-background` directly rather than expecting a parent alias to recompute.

## Structured dialogs

Use `Dialog.Content` `title` and `description` for simple prompts. For a structured review, compose `Dialog.Header`, `Dialog.Title`, `Dialog.Description`, `Dialog.Body`, `Dialog.Footer` and `Dialog.Actions`. Sections are neutral `div`s with native props and refs; add `role="region"` and a name only when the content deserves a landmark. Use the props or the composed parts, not both, or the dialog gets two names. Always include a visible Close or Cancel action.

## Surface tokens

[Surface theming](../tokens.md#surface-theming) lists the Dialog, Button and popup tokens. Defaults reproduce the shipped design: Button transitions take 140ms with a 1px press offset, Dialog 150ms with a 0.96 entry scale, popups use `--kb-motion-duration-fast`. Set duration and easing on the theme host; a popup-only inline style cannot reach the sibling Dialog backdrop.

Reduced motion removes component transitions, the Dialog entry movement and the Button press offset. Consumer animations must honor the same preference.

## Accessibility contracts

`apps/storybook/stories/Accessibility.stories.tsx` checks these in normal and reduced-motion Chromium (`bun run test:stories`) and under forced colors (`bun run --cwd apps/storybook test:a11y`):

- Selected radio indicators stay distinguishable from their control under forced colors.
- A read-only mixed Checkbox keeps its mixed state, exposes `aria-readonly` and ignores activation.
- Select merges caller `aria-describedby` after its own helper. An empty Select's "No options available" helper comes first.
- Buttons use system colors under forced colors, so text stays legible on every variant; disabled buttons use `GrayText`.
- A Select inside a scrolling, nested-theme Dialog keeps its options in the viewport at 320px, returns focus to the trigger, and Escape closes the listbox before the dialog.

Automated checks run in Chromium only. They do not replace screen-reader, native WebView or other-engine sign-off.
