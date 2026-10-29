# Layout composition

Use Container for page boundaries, Inline for wrapping rows, Split for two-column sections, and Separator for thematic or decorative rules. Styles are framework-free CSS; React wrappers add native markup without state, effects, resize listeners or hydration-dependent layout.

## Compose a page

```tsx
import "@kb.ui/react/styles.css";
import { Button, Container, Grid, Heading, Inline, Separator, Split, Text } from "@kb.ui/react";

export function Workspace() {
  return (
    <Container as="main">
      <Grid layout="stack">
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
      </Grid>
    </Container>
  );
}
```

The [React API](../../packages/react/docs/components/Container.md) lists all props. [Composed page stories](../../packages/react/src/components/Container/Container.stories.tsx) cover both themes. Keep vertical rhythm with `Grid layout="stack"`; use Grid's automatic columns for variable child counts.

## Responsive rules

| Primitive | Composition rule | Default |
|---|---|---|
| Container | Center a full-width outer box capped at a shared maximum; inline gutters remain inside that width | lg: 80rem outer width, fluid 1–2rem gutters |
| Grid | Fit equal columns above the minimum item width, use 1–4 explicit columns, or stack in a single track; reset list markers and margins on ul/ol | Auto-fit at 18.75rem minimum item width, 1.5rem gap, stretch alignment |
| Inline | Wrap independent items onto new rows when they no longer fit; preserve source and tab order | 1rem gap, centered cross-axis, start distribution |
| Split | Two direct element children share a row at or above the threshold; below it each fills its own row | Equal columns, 48rem available-width threshold, 1rem gap |
| Separator | Fill inline width horizontally; stretch in a flex row vertically with a minimum visible height | Horizontal semantic hr |

Container sizes are sm 40rem, md 64rem, lg 80rem and full with no cap. Use one shared size across page sections to align their edges. Container sets no block spacing. Avoid repeated nested gutters: use `gutter={false}` when an outer container or Panel already owns inline padding.

Grid supports `layout` (`auto` or `stack`), `columns` (`auto`, `1`, `2`, `3` or `4`), `minItemWidth` (`sm` 14rem, `md` 18.75rem, `lg` 24rem), `gap` (`none`, `sm`, `md`, `lg`) and `align` (`start`, `center`, `end`, `baseline`, `stretch`). When rendered as `ul` or `ol`, Grid removes list bullets and browser list margins so `li` children align with the grid tracks.

Inline gap sizes are none, sm 0.5rem, md 1rem and lg 1.5rem. The same scale applies to Grid and Split. Cross-axis alignment supports start, center, end, baseline and stretch. Inline's justify supports start, center, end and between; distribution applies separately to each wrapped row. Native lists in Inline keep their markers and list spacing; use li children.

Split collapse sizes are sm 32rem, md 48rem and lg 64rem. Thresholds use the component's available width, so a narrow nested panel stacks even on a wide desktop. Ratios equal, wide-start and wide-end mean 1:1, 2:1 and 1:2. Provide two children, one per column. Split renders a `.kb-split-track` around each non-empty child, so column width and collapse stay independent of child tokens and text measures. Group related content inside a section or div; empty conditional children add no track. Source order defines reading order in both states; CSS never reverses it.

Tracks fill their assigned columns while children retain their own reading measures. Nested Split token overrides affect that nested layout. Children can shrink and ordinary text can wrap. Essential wide content such as tables, media or preformatted code still needs its own responsive treatment. Avoid fixed widths that exceed the available column. Test custom minimum widths, unusually large gaps and token overrides at narrow widths and browser zoom.

## Semantics and accessibility

Choose landmarks from document structure with Container's native `as` prop. Container, Grid, Inline and Split default to div; non-default generic element types require an explicit `as` so native props and refs stay aligned. Named sections and aside elements keep their native semantics. Layout does not add grid roles, focus management or tab stops. Inline controls remain independent tab stops; choose Toolbar for coordinated arrow-key navigation.

Separator defaults to a native hr with an announced orientation. Use `decorative` when a rule only repeats an existing visual grouping; this sets aria-hidden and removes separator semantics. Vertical rules use `orientation="vertical"` and stretch inside Inline. Separator is a static divider, with no resizing interaction. Put a vertical separator inside a wrapper when using an Inline list so li remains the direct child.

Use `dir="rtl"` on the relevant native container for right-to-left content. Widths, gutters and start/end alignment use logical properties. In forced-colors mode, the reset maps base text, surface and border tokens to system colors, and separators use CanvasText, following [system-color guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/system-color). Automated accessibility scans and source-order tests supplement human screen-reader and zoom checks.

## Tokens and overrides

| Tokens | Responsibility |
|---|---|
| `--kb-container-size-sm`, `-md`, `-lg` | Shared maximum outer page widths |
| `--kb-container-gutter` | Responsive inline padding |
| `--kb-grid-gap`, `--kb-grid-min-item-width`, `-sm`, `-md`, `-lg` | Grid default spacing and minimum auto-fit column widths |
| `--kb-layout-gap-sm`, `-md`, `-lg` | Shared Grid, Inline and Split spacing |
| `--kb-split-collapse-sm`, `-md`, `-lg` | Available-width collapse thresholds |
| `--kb-separator-color`, `-width`, `-min-length` | Rule ink, thickness and vertical minimum length |

Use `className` and `style` for root overrides, and `classNames={{ track: "project-column" }}` for Split tracks. Unlayered app CSS wins over the shared `kbui` layer, following [restyling guidance](restyling.md). Override component tokens on the relevant subtree; shared gap aliases follow [token alias rules](../tokens.md#aliases). Keep ratios and thresholds suitable for the content and test after overrides. Layout applies through CSS alone with no viewport reads in React.

## Framework-free markup

Install `@kb.ui/css` and load its full `@kb.ui/css/styles.css` stylesheet, or choose tokens, reset and the required component files as described in the [CSS package guide](../../packages/css/README.md). Missing data attributes use the same default geometry as React.

```html
<main class="kb-container" data-size="lg">
  <div class="kb-grid" data-layout="stack">
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

For a decorative rule, add `aria-hidden="true" role="none"` and omit aria-orientation. For a vertical rule, set both data-orientation and aria-orientation to vertical unless decorative. For a gutterless container, set `data-gutter="none"`.
