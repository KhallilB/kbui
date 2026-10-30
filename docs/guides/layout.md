# Layout composition

Use `Container` for page boundaries, `Stack` for vertical flow, `Inline` for wrapping rows, `Split` for two-column sections, and `Separator` for thematic or decorative rules. Styles are framework-free CSS; React wrappers add native markup without state, effects, resize listeners or hydration-dependent layout.

## Compose a page

```tsx
import "@kb.ui/react/styles.css";
import { Button, Container, Heading, Inline, Separator, Split, Stack, Text } from "@kb.ui/react";

export function Workspace() {
  return (
    <Container as="main">
      <Stack gap="lg">
        <Inline justify="between">
          <Heading level={1}>Workspace</Heading>
          <Button>New project</Button>
        </Inline>
        <Separator />
        <Split ratio="wide-start">
          <section aria-labelledby="projects-title">
            <Heading level={2} id="projects-title">Projects</Heading>
            <Text>Primary content comes first in source order.</Text>
          </section>
          <aside aria-label="Project context">
            <Text tone="muted">Context follows when columns stack.</Text>
          </aside>
        </Split>
      </Stack>
    </Container>
  );
}
```

The [React API](../../packages/react/docs/components/Container.md) lists all props. [Composed page stories](../../packages/react/src/components/Container/Container.stories.tsx) cover both themes. Keep vertical rhythm with `Stack`; use `Grid`'s automatic columns for variable child counts. Keep `Grid layout="stack"` for a grid that toggles between one column and automatic columns.

## Responsive rules

| Primitive | Composition rule | Default |
|---|---|---|
| `Container` | Center a full-width outer box capped at a shared maximum; inline gutters remain inside that width | lg: 80rem outer width, fluid 1–2rem gutters |
| `Grid` | Fit equal columns above the minimum item width, use 1–4 explicit columns, or stack in a single track; reset list markers and margins on `ul`/`ol` | Auto-fit at 18.75rem minimum item width, 1.5rem gap, stretch alignment |
| `Stack` | Flow children top to bottom in source order; gap replaces child block margins; reset list markers and margins on `ul`/`ol` | 1rem gap, stretch alignment, start distribution |
| `Inline` | Wrap independent items onto new rows when they no longer fit; preserve source and tab order | 1rem gap, centered cross-axis, start distribution |
| `Split` | Two direct element children share a row at or above the threshold; below it each fills its own row | Equal columns, 48rem available-width threshold, 1rem gap |
| `Separator` | Fill inline width horizontally; stretch in a flex row vertically with a minimum visible height | Horizontal semantic hr |

`Container` sizes are `sm` 40rem, `md` 64rem, `lg` 80rem and `full` with no cap. Use one shared size across page sections to align their edges. `Container` sets no block spacing. Avoid repeated nested gutters: use `gutter={false}` when an outer container or `Panel` already owns inline padding.

`Grid` supports `layout` (`auto` or `stack`), `columns` (`auto`, `1`, `2`, `3` or `4`), `minItemWidth` (`sm` 14rem, `md` 18.75rem, `lg` 24rem), `gap` (`none`, `sm`, `md`, `lg`) and `align` (`start`, `center`, `end`, `baseline`, `stretch`). When rendered as `ul` or `ol`, `Grid` removes list bullets and browser list margins so `li` children align with the grid tracks.

`Inline` gap sizes are `none`, `sm` 0.5rem, `md` 1rem and `lg` 1.5rem. The same scale applies to `Grid`, `Stack` and `Split`. Cross-axis alignment supports `start`, `center`, `end`, `baseline` and `stretch`. `Inline`'s `justify` supports `start`, `center`, `end` and `between`; distribution applies separately to each wrapped row. Native lists in `Inline` keep their markers and outer spacing; `gap` controls spacing between `li` children.

`Stack` alignment supports `start`, `center`, `end` and `stretch` on the inline axis; stretch fills the stack width, the others size children to their content. `Stack`'s `justify` supports `start`, `center`, `end` and `between` on the block axis and only takes effect when the stack is taller than its content, such as `blockSize: 100%` inside a fixed-height card. `Stack` renders `div`, `section`, `article`, `aside`, `ul`, `ol`, `nav` or `form`. Nest stacks for section rhythm: a wider outer gap between sections, a tighter inner gap within each.

`Split` collapse sizes are `sm` 32rem, `md` 48rem and `lg` 64rem. Thresholds use the component's available width, so a narrow nested panel stacks even on a wide desktop. Ratios `equal`, `wide-start` and `wide-end` mean 1:1, 2:1 and 1:2. Provide two children, one per column. `Split` renders a `.kb-split-track` around each non-empty child, so column width and collapse stay independent of child tokens and text measures. Group related content inside a `section` or `div`; empty conditional children add no track. Source order defines reading order in both states; CSS never reverses it.

Tracks fill their assigned columns while children retain their own reading measures. Nested `Split` token overrides affect that nested layout. Children can shrink and ordinary text can wrap. Essential wide content such as tables, media or preformatted code still needs its own responsive treatment. Avoid fixed widths that exceed the available column. Test custom minimum widths, unusually large gaps and token overrides at narrow widths and browser zoom.

## Dashboard

[`Dashboard`](../../packages/react/docs/components/Dashboard.md) is a layout intent for overview pages: header, metrics, primary and secondary regions in that order. It is its own page frame, so use it instead of `Container`: it fills the width up to 80rem, with gutters of 1rem below 48rem, 1.5rem from 48rem and 2rem from 64rem of its parent's width; as a direct flex item, wrap it in its own block such as `main` so the gutters measure its column, not the whole row. Primary and secondary share a row, two thirds and one third, once the panels region is 60rem wide; below that each fills its own row, primary first. Like `Split`, these thresholds use available width, not the viewport.

## Main task with an aside

Use [`SupportingPane`](../../packages/react/docs/components/SupportingPane.md) when one task fills the page and supporting context sits beside it, such as a cart and its order summary or a list and an inspector. It frames the page itself, so do not wrap it in `Container`.

| Width | Page frame | Main and aside |
| --- | --- | --- |
| Viewport under 48rem | 1rem gutters | Aside below main, both full width |
| Viewport 48rem to 64rem | 1.5rem gutters | Beside each other once the pane's content is 48rem wide; otherwise stacked |
| Viewport 64rem and wider | 2rem gutters, page capped at 80rem | Aside 22rem wide, main fills the rest |

The collapse point uses the pane's own content width, so a pane in a narrow parent stays stacked on a wide screen. Main comes first in source, reading and Tab order at every width. The aside is a native `aside`; name it from its visible heading with `asideLabelledBy`.

## Semantics and accessibility

Choose landmarks from document structure with `Container`'s native `as` prop. `Container`, `Grid`, `Inline`, `Stack` and `Split` default to `div`; non-default generic element types require an explicit `as` so native props and refs stay aligned. Named sections and aside elements keep their native semantics. Layout does not add grid roles, focus management or tab stops. `Inline` controls remain independent tab stops; choose `Toolbar` for coordinated arrow-key navigation.

`Separator` defaults to a native `hr` with an announced orientation. Use `decorative` when a rule only repeats an existing visual grouping; this sets `aria-hidden` and removes separator semantics. Vertical rules use `orientation="vertical"` and stretch inside `Inline`. `Separator` is a static divider, with no resizing interaction. Put a vertical separator inside a wrapper when using an `Inline` list so `li` remains the direct child.

Use `dir="rtl"` on the relevant native container for right-to-left content. Widths, gutters and start/end alignment use logical properties. In forced-colors mode, the reset maps base text, surface and border tokens to system colors, and separators use `CanvasText`, following [system-color guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/system-color). Automated accessibility scans and source-order tests supplement human screen-reader and zoom checks.

## Tokens and overrides

| Tokens | Responsibility |
|---|---|
| `--kb-container-size-sm`, `-md`, `-lg` | Shared maximum outer page widths |
| `--kb-container-gutter` | Responsive inline padding |
| `--kb-grid-gap`, `--kb-grid-min-item-width`, `-sm`, `-md`, `-lg` | `Grid` default spacing and minimum auto-fit column widths |
| `--kb-layout-gap-sm`, `-md`, `-lg` | Shared `Grid`, `Inline`, `Stack` and `Split` spacing |
| `--kb-split-collapse-sm`, `-md`, `-lg` | Available-width collapse thresholds |
| `--kb-separator-color`, `-width`, `-min-length` | Rule ink, thickness and vertical minimum length |
| `--kb-dashboard-gap`, `--kb-dashboard-max-width`, `--kb-dashboard-gutter-sm`, `-md`, `-lg`, `--kb-dashboard-gutter-md-from`, `--kb-dashboard-gutter-lg-from`, `--kb-dashboard-collapse` | `Dashboard` region spacing, page width, gutter steps and panel collapse |

Use `className` and `style` for root overrides, and `classNames={{ track: "project-column" }}` for `Split` tracks. Unlayered app CSS wins over the shared `kbui` layer, following [restyling guidance](restyling.md). Override component tokens on the relevant subtree; shared gap aliases follow [token alias rules](../tokens.md#aliases). Keep ratios and thresholds suitable for the content and test after overrides. Layout applies through CSS alone with no viewport reads in React.

## Framework-free markup

Install `@kb.ui/css` and load its full `@kb.ui/css/styles.css` stylesheet, or choose tokens, reset and the required component files as described in the [CSS package guide](../../packages/css/README.md). Missing data attributes use the same default geometry as React.

```html
<main class="kb-container" data-size="lg">
  <div class="kb-stack" data-gap="lg" data-align="stretch" data-justify="start">
    <div class="kb-inline" data-gap="md" data-align="center" data-justify="between">
      <h1 class="kb-heading" data-size="xl">Workspace</h1>
      <a class="kb-link" href="/projects/new">New project</a>
    </div>
    <hr class="kb-separator" data-orientation="horizontal" aria-orientation="horizontal" />
    <div class="kb-split" data-ratio="wide-start" data-collapse="md" data-gap="md" data-align="stretch">
      <div class="kb-split-track"><section aria-labelledby="projects"><h2 id="projects">Projects</h2></section></div>
      <div class="kb-split-track"><aside aria-label="Project context">Context</aside></div>
    </div>
  </div>
</main>
```

For a decorative rule, add `aria-hidden="true" role="none"` and omit `aria-orientation`. For a vertical rule, set both `data-orientation` and `aria-orientation` to `vertical` unless decorative. For a gutterless container, set `data-gutter="none"`.
