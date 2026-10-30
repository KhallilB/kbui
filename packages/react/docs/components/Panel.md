# Panel

Use `Panel` for a section that needs a header, body, and actions. Its parts help keep those areas aligned. Give the section an accessible name with `aria-labelledby`, pointing to the heading in `Panel.Header`.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-panel--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, Panel } from "@kb.ui/react";

export function Example() {
  return (
    <Panel aria-labelledby="queue-title">
      <Panel.Header>
        <h2 id="queue-title">Review queue</h2>
      </Panel.Header>
      <Panel.Body>Three items need review.</Panel.Body>
      <Panel.Footer>
        <Button>Open queue</Button>
      </Panel.Footer>
    </Panel>
  );
}
```

## More examples

- [Optional details](https://kbui.kcb.pro/storybook/?path=/story/components-panel--collapsible): Expand and collapse a section from its toggle.
- [Section actions](https://kbui.kcb.pro/storybook/?path=/story/components-panel--toolbar): Group actions alongside the section heading.
- [Nested sections](https://kbui.kcb.pro/storybook/?path=/story/components-panel--nested): Inspect depth and grouping inside a parent panel.
- [Opaque surface](https://kbui.kcb.pro/storybook/?path=/story/components-panel--opaque): Compare a glass panel with one that drops the blur.

## Reference

```tsx
<Panel tone="active" rail="status" aria-labelledby="queue-title">
  <Panel.Header>
    <h2 id="queue-title">Queue</h2>
    <Panel.Toolbar>
      <Button size="sm">Retry</Button>
    </Panel.Toolbar>
  </Panel.Header>
  <Panel.Body>
    <Panel.Well>…</Panel.Well>
  </Panel.Body>
  <Panel.Footer>…</Panel.Footer>
</Panel>
```

| Prop           | Values                                                 | Default      | Notes                                                                 |
| -------------- | ------------------------------------------------------ | ------------ | --------------------------------------------------------------------- |
| `tone`         | `quiet` / `default` / `sunken` / `active` / `critical` | `default`    | Changes the surface emphasis; pair state colors with explanatory text |
| `rail`         | `none` / `accent` / `status`                           | `none`       | Accent stays the accent color; status follows the current tone        |
| `density`      | `compact` / `standard`                                 | `standard`   | Changes padding without changing semantics                            |
| `opaque`       | `boolean`                                              | `false`      | Solid fill with no backdrop filter, whatever the theme sets           |
| `collapsible`  | `boolean`                                              | `false`      | Enables `Panel.Toggle` and collapsible body behavior                    |
| `open`         | `boolean`                                              | uncontrolled | Current body visibility when collapsible is enabled                   |
| `defaultOpen`  | `boolean`                                              | `false`      | Initial visibility for an uncontrolled collapsible panel              |
| `onOpenChange` | `(open: boolean) => void`                              | unset        | Update open here when your app controls visibility                    |

`quiet` removes the panel background; `sunken` gives it a recessed surface. Use `Panel.Well` for logs or other output that should sit inside the panel. Customize the shape with `--kb-panel-radius`, the rim with `--kb-panel-rim-top`, `--kb-panel-border`, and `--kb-panel-rim-bottom`, and the depth with `--kb-panel-shadow` or `--kb-panel-shadow-active`.

For additional lighting, use `--kb-panel-sheen`, `--kb-panel-backdrop`, `--kb-panel-glow`, `--kb-panel-glow-active`, and `--kb-panel-glow-critical`. These effects stay off by default. Active and critical tones change the upper rim and glow colors. The rail follows the panel’s rounded corners.

`opaque` turns off the theme’s glass for one panel: it drops `--kb-panel-backdrop` and paints the tone fill over the `--kb-panel-background-opaque` base. Use it under content that redraws often, such as a live terminal or log, where a backdrop blur costs memory and compositing work. It fills even a `quiet` panel. Nested panels keep their own glass; give each one that holds live content `opaque` too. Set `--kb-panel-background-opaque` in your theme to change the base; keep it a solid color that contrasts with `--kb-color-fg` in light and dark.

```tsx
<Panel opaque aria-labelledby="terminal-title">…</Panel>
```

## Resizable panels

Put `Panel.Handle` between two panels in a `Panel.Group` to let people resize them. The handle sizes the panel before it, as a percentage of the group; the panel after it takes the remaining space. Name each handle with `aria-label` or `aria-labelledby`. A column group needs a height.

```tsx
<Panel.Group direction="row">
  <Panel aria-labelledby="code-title">…</Panel>
  <Panel.Handle aria-label="Resize code" defaultSize={50} min={25} max={75} />
  <Panel aria-labelledby="view-title">…</Panel>
</Panel.Group>
```

`size` (controlled) or `defaultSize` (default `50`) sets the size of the panel before the handle in percent. `min` and `max` limit it (defaults `10` and `90`), `step` sets the arrow-key change (default `5`), and `onSizeChange` receives the next size after a key press or drag.

The handle follows the window splitter pattern. Arrow keys along the group's direction resize the panel, `Home` and `End` jump to the limits, and `Enter` collapses the panel to `min` and restores the previous size. Pointer drags work in both directions. Arrow keys do not flip in right-to-left layouts. Style the handle with `--kb-panel-handle-size`, `--kb-panel-handle-hit`, `--kb-panel-handle-grip`, `--kb-panel-handle-line` and `--kb-panel-handle-line-active`.

## Related components

Use [`Card`](Card.md) for a self-contained item and [`Grid`](Grid.md) or [`Split`](Split.md) to arrange sections.

## Resizing without dragging

The handle’s keyboard model supports keyboard access. For users who operate a pointer without dragging, provide controls for the same resizing task. This composition uses the existing controlled size API; the surrounding application supplies named click/tap buttons and feedback after button actions. Assess the chosen range and increments against the task’s required functionality.

```tsx
import "@kb.ui/react/styles.css";
import { Button, Inline, Panel, Status } from "@kb.ui/react";
import { useId, useState } from "react";

export function ResizableWorkspace() {
  const titleId = useId();
  const [size, setSize] = useState(50);
  const [message, setMessage] = useState("");
  function resizeBy(amount: number) {
    const next = Math.max(25, Math.min(75, size + amount));
    setSize(next);
    setMessage(`Code panel width ${next} percent.`);
  }
  return (
    <>
      <Inline>
        <Button
          type="button"
          disabled={size <= 25}
          onClick={() => resizeBy(-5)}
        >
          Make code narrower
        </Button>
        <Button type="button" disabled={size >= 75} onClick={() => resizeBy(5)}>
          Make code wider
        </Button>
        <Status live>{message}</Status>
      </Inline>
      <Panel.Group direction="row" style={{ width: "100%", minHeight: 240 }}>
        <Panel aria-labelledby={titleId}>
          <Panel.Header>
            <h2 id={titleId}>Code</h2>
          </Panel.Header>
          <Panel.Body>Editable source content.</Panel.Body>
        </Panel>
        <Panel.Handle
          aria-labelledby={titleId}
          size={size}
          onSizeChange={(next) => {
            setSize(next);
            setMessage("");
          }}
          min={25}
          max={75}
          step={5}
        />
        <Panel aria-label="Preview">
          <Panel.Body>Resulting preview.</Panel.Body>
        </Panel>
      </Panel.Group>
    </>
  );
}
```

Click each resize button, then focus the handle and use its arrow keys, Home/End, and Enter. Check that pane width, separator value, disabled limits, focus visibility, and feedback stay correct. Test the actual composition at zoom and with supported assistive technology. See the shared [accessibility verification guide](https://github.com/KhallilB/kbui/blob/main/docs/guides/accessibility.md#keyboard-focus-and-pointer-input) for WCAG 2.5.7 and target-size requirements.
