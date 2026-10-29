# Typography

Use Heading, Text, Link and Code to give content a predictable hierarchy and readable flow. Values live in tokens, styles in framework-free CSS, and native markup in thin React wrappers.

## Compose content

```tsx
import "@kb.ui/react/styles.css";
import { Code, Grid, Heading, Link, Text } from "@kb.ui/react";

export function Installation() {
  return (
    <Grid layout="stack">
      <Heading level={1}>Install kbui</Heading>
      <Text size="lg">One shared language for every screen.</Text>
      <Heading level={2}>Load the stylesheet</Heading>
      <Text>
        Import <Code>@kb.ui/react/styles.css</Code> once, then follow the{" "}
        <Link href="/setup">setup guide</Link>.
      </Text>
      <Code title="src/main.tsx" language="tsx" lineNumbers>
        {`import "@kb.ui/react/styles.css";\nimport { Button } from "@kb.ui/react";`}
      </Code>
      <Text size="sm" tone="muted">Updated today</Text>
    </Grid>
  );
}
```

Choose heading rank from the document outline. Visual size can change independently: `Heading level={2} size="sm"` remains a section heading. Use Text for prose and native `strong` or `em` for meaningful emphasis. Use `Text as="span"` inside a sentence; use `as="div"` only when grouping block content. Components remove their own margins; spacing belongs to the parent layout.

The [canonical React API](../../packages/react/docs/components/Heading.md) lists props and defaults. The [composed article](../../packages/react/src/components/Heading/Heading.stories.tsx) exercises all four inside an existing Panel, in both themes. Other colocated stories cover sizes, supporting text, links within prose, inline code paths and syntax-highlighted multiline code blocks.

## Framework-free recipes

The same anatomy works with plain HTML or another renderer. Install `@kb.ui/css` and load `@kb.ui/css/styles.css`, or load tokens/reset plus each required component stylesheet. See the [CSS package guide](../../packages/css/README.md) for package imports and serving styles without a bundler.

```html
<h1 class="kb-heading" data-size="xl">Install kbui</h1>
<h2 class="kb-heading" data-size="lg">Load the stylesheet</h2>
<p class="kb-text" data-size="md" data-tone="default">
  Import <code class="kb-code">@kb.ui/css/styles.css</code>, then read the
  <a class="kb-link" href="/setup">setup guide</a>.
</p>
<div class="kb-code" data-block data-line-numbers>
  <div class="kb-code-header">
    <div class="kb-code-meta">
      <span class="kb-code-title">src/main.ts</span>
      <span class="kb-code-language">TS</span>
    </div>
  </div>
  <div class="kb-code-viewport">
    <pre class="kb-code-pre"><code class="kb-code-content"><span class="kb-code-line"><span class="kb-code-line-number" data-line-number="1" aria-hidden="true"></span><span class="kb-code-line-text"><span data-syntax="keyword">import</span> <span data-syntax="string">"@kb.ui/css/styles.css"</span>;</span></span></code></pre>
  </div>
</div>
```

CSS-only headings default to lg when no size attribute exists. Render the appropriate `data-size` explicitly to match React's rank-based defaults. Text defaults to md and primary ink without attributes. Link requires an anchor with href; Code uses a native `code` element inline or `.kb-code[data-block]` for multiline listings. In React, give router links to `Link.Provider` once (see [router links](../../packages/react/docs/components/Link.md#router-links)); a CSS-only router integration should emit the same native anchor and class and preserve its own ref and event handling.

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
| `--kb-code-block-background`, `-face`, `-border`, `-radius`, `-shadow`, `-font-size`, `-leading`, `-max-height` | Multiline code block surface, typography and scroll cap |
| `--kb-code-header-background`, `--kb-code-gutter-color`, `--kb-code-line-highlight-background`, `-border` | Block header bar, line-number gutter and highlighted line emphasis |
| `--kb-code-syntax-keyword`, `-string`, `-comment`, `-number`, `-tag`, `-attribute`, `-type`, `-function`, `-operator`, `-property` | Theme-aware syntax highlighting colors in light, dark and forced-colors modes |

Override tokens at the root or set component tokens on the relevant subtree. [Token alias rules](../tokens.md#aliases) explain why aliases declared at root do not follow every wrapper-level override. Set theme on `html` or a wrapper using `data-theme="light"` or `data-theme="dark"`.

## Accessibility and content

Use a page title, then nest headings according to their relationships; avoid skipped ranks. This preserves navigation described by [WAI heading guidance](https://www.w3.org/WAI/tutorials/page-structure/headings/). Descriptive links help readers understand destinations in context, following [WAI link-purpose guidance](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html).

Keep underlines and keyboard outlines visible. Link text inherits its surrounding size, Code inherits ink, and long identifiers wrap without clipping. Do not use color alone to convey state. Secondary ink, link tokens and syntax tokens are tuned for the shipped light/dark surfaces; custom backgrounds and token overrides need their own contrast checks. Forced-colors mode retains native link/focus colors and maps syntax tokens to system colors.

Do not truncate essential prose or put arbitrary block elements inside Text's default paragraph. Allow browser zoom and text spacing changes; no fixed text heights or hidden overflow are used on inline prose. Inline Code represents short computer-code fragments, following the [native code element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/code), while multiline strings or block props render a framed `pre`/`code` listing with non-selectable line numbers and polite copy status announcements.
