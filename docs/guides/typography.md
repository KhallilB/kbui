# Typography

Use Heading, Text, Link and Code to give content a predictable hierarchy and readable flow. Values live in tokens, styles in framework-free CSS, and native markup in thin React wrappers. Prepared locally after 0.7.0; unreleased.

## Compose content

```tsx
import "@kbui/css/styles.css";
import { Code, Grid, Heading, Link, Text } from "@kbui/react";

export function Installation() {
  return (
    <Grid layout="stack">
      <Heading level={1}>Install kbui</Heading>
      <Text size="lg">One shared language for every screen.</Text>
      <Heading level={2}>Load the stylesheet</Heading>
      <Text>
        Import <Code>@kbui/css/styles.css</Code> once, then follow the{" "}
        <Link href="/setup">setup guide</Link>.
      </Text>
      <Text size="sm" tone="muted">Updated today</Text>
    </Grid>
  );
}
```

Choose heading rank from the document outline. Visual size can change independently: `Heading level={2} size="sm"` remains a section heading. Use Text for prose and native `strong` or `em` for meaningful emphasis. Use `Text as="span"` inside a sentence; use `as="div"` only when grouping block content. Components remove their own margins; spacing belongs to the parent layout.

The [canonical React API](../../packages/react/README.md#heading) lists props and defaults. The [composed article](../../packages/react/src/components/Heading/Heading.stories.tsx) exercises all four inside an existing Panel, in both themes. Other colocated stories cover sizes, supporting text, links within prose and long code paths.

## Framework-free recipes

The same anatomy works with plain HTML or another renderer. Load `@kbui/css/styles.css`, or load tokens/reset plus each required component stylesheet.

```html
<h1 class="kb-heading" data-size="xl">Install kbui</h1>
<h2 class="kb-heading" data-size="lg">Load the stylesheet</h2>
<p class="kb-text" data-size="md" data-tone="default">
  Import <code class="kb-code">@kbui/css/styles.css</code>, then read the
  <a class="kb-link" href="/setup">setup guide</a>.
</p>
```

CSS-only headings default to lg when no size attribute exists. Render the appropriate `data-size` explicitly to match React's rank-based defaults. Text defaults to md and primary ink without attributes. Link requires an anchor with href; Code requires an inline code element. A router integration should emit the same native anchor and class; preserve its own ref and event handling.

## Theme and scale

| Tokens | Responsibility |
|---|---|
| `--kb-font-sans`, `--kb-font-mono` | Shared font families |
| `--kb-text-small-size`, `--kb-text-body-size`, `--kb-size-lg`, `--kb-size-display` | Existing body, supporting and display roles |
| `--kb-heading-size-sm`, `-md`, `-lg`, `-xl`, `-display` | Heading sizes, independent of semantic rank |
| `--kb-heading-weight`, `--kb-heading-tracking`, `--kb-heading-leading` | Heading rhythm |
| `--kb-text-leading-body`, `--kb-text-measure`, `--kb-text-muted` | Body rhythm, line length and secondary ink |
| `--kb-link-color`, `--kb-link-hover`, `--kb-link-underline-offset`, `--kb-color-ring` | Link ink, underline and focus |
| `--kb-code-size`, `--kb-code-background`, `--kb-code-border`, `--kb-code-radius` | Relative inline code size and surface |

Override tokens at the root or set component tokens on the relevant subtree. [Token alias rules](../tokens.md#aliases) explain why aliases declared at root do not follow every wrapper-level override. Set theme on `html` or a wrapper using `data-theme="light"` or `data-theme="dark"`.

## Accessibility and content

Use a page title, then nest headings according to their relationships; avoid skipped ranks. This preserves navigation described by [WAI heading guidance](https://www.w3.org/WAI/tutorials/page-structure/headings/). Descriptive links help readers understand destinations in context, following [WAI link-purpose guidance](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html).

Keep underlines and keyboard outlines visible. Link text inherits its surrounding size, Code inherits ink, and long identifiers wrap without clipping. Do not use color alone to convey state. Secondary ink and link tokens are tuned for the shipped light/dark surfaces; custom backgrounds and token overrides need their own contrast checks. Forced-colors mode retains native link/focus colors.

Do not truncate essential prose or put arbitrary block elements inside Text's default paragraph. Allow browser zoom and text spacing changes; no fixed text heights or hidden overflow are used. Inline Code represents short computer-code fragments, following the [native code element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/code). Pass literal markup as a string. Use a separate multiline listing for code where layout and indentation are essential.
