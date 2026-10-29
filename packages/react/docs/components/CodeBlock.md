# CodeBlock

An explicit block listing for commands, configuration and source. Reuses Code highlighting, line numbers, line emphasis and collapse behavior, with shared copy feedback and a keyboard-scrollable viewport.

[All components](../../README.md#components) · [Usage](#usage) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-codeblock--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { CodeBlock } from "@kb.ui/react";

export function Example() {
  return (
    <CodeBlock title="Terminal" language="bash" copyLabel="Copy install command">
      {"bun add @kb.ui/react"}
    </CodeBlock>
  );
}
```

`children` must be the exact source string. Copy excludes line numbers, syntax markup, highlighted-line decoration and display padding. Collapsed blocks copy the full source. Empty strings disable copying. CodeBlock always renders a block, including single-line commands. It uses `.kb-codeblock.kb-code[data-block]`; shared `.kb-code-*` parts and `--kb-code-*` tokens remain compatible with Code.

Clipboard feedback appears after the actual write resolves. Pending writes suppress repeat activation and preserve button focus. Errors stay visible with manual selection instructions until retry or source change. Success resets after `feedbackDuration` (two seconds by default, zero retains it). Changes to source or disabled state invalidate outstanding feedback; unmounted instances ignore completion. Already-issued operating-system writes cannot be cancelled.

The named viewport has a keyboard focus stop for horizontal and vertical scrolling. `title` names that region, falling back to `Code`. Syntax color and line emphasis supplement source text; explain important lines in surrounding prose. The collapse action exposes its expanded state and controlled viewport without moving focus. Use controlled `collapsed` with `onCollapsedChange`, or `defaultCollapsed` for local state.

Override `--kb-code-syntax-*` through `style` or a class to change individual syntax colors. The Colorful example maps keyword, string, tag, function and attribute colors to semantic theme tokens. All code and clipboard contents remain unchanged; verify contrast against the listing background after customization.

## More examples

- [Colorful](https://kbui.kcb.pro/storybook/?path=/story/components-codeblock--colorful): customize individual syntax roles with theme colors.
- [Source](https://kbui.kcb.pro/storybook/?path=/story/components-codeblock--source): highlighted TSX with line numbers and emphasis.
- [Configuration](https://kbui.kcb.pro/storybook/?path=/story/components-codeblock--configuration): JSON payload.
- [Collapsible](https://kbui.kcb.pro/storybook/?path=/story/components-codeblock--collapsible): bounded long listings with full-source copy.
- [Long command](https://kbui.kcb.pro/storybook/?path=/story/components-codeblock--long-command): keyboard scrolling without page overflow.
- [Copy feedback](https://kbui.kcb.pro/storybook/?path=/story/components-codeblock--copy-feedback): exact clipboard text and retained focus.
- [Copy failure](https://kbui.kcb.pro/storybook/?path=/story/components-codeblock--copy-failure): visible recovery instructions and retained source.
- [Localized](https://kbui.kcb.pro/storybook/?path=/story/components-codeblock--localized): long translated labels wrap within narrow listings.
- [Read only](https://kbui.kcb.pro/storybook/?path=/story/components-codeblock--read-only): source without a copy control.

## Reference

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `string` | required | Exact source, including whitespace and trailing newlines |
| `title` | `string` | unset | Header text and accessible viewport name |
| `language` | `CodeLanguage` | unset | `tsx`, `ts`, `jsx`, `js`, `css`, `html`, `json`, `bash` and aliases; `plain` disables syntax coloring |
| `copyable` | `boolean` | `true` | Show copy action and status region |
| `disabled` | `boolean` | `false` | Disable copy while retaining source and collapse interaction |
| `copyLabel`, `copyingLabel`, `copiedLabel`, `copyErrorLabel` | `string` | `"Copy code"`, `"Copying…"`, `"Copied"`, `"Copy failed"` | Visible button names; failed action retries |
| `successMessage` | `string` | `"Code copied to clipboard"` | Polite success announcement |
| `errorMessage` | `string` | `"Failed to copy code. Select and copy the text manually."` | Visible polite recovery instructions |
| `feedbackDuration` | `number` | `2000` | Success reset in milliseconds; zero retains feedback, invalid or negative uses default |
| `onCopy` | `(source: string) => void` | unset | Current clipboard write succeeded; replaces native clipboard event prop |
| `onCopyError` | `(error: unknown) => void` | unset | Current write failed or API unavailable |
| `lineNumbers` | `boolean` | `false` | Decorative line gutter |
| `startLine` | `number` | `1` | First displayed line number |
| `highlightLines` | `readonly number[]` | unset | Emphasized display line numbers, accounting for startLine |
| `minLines` | `number` | unset | Minimum displayed lines without altering source |
| `collapsible` | `boolean` | `false` | Show expand/collapse action |
| `collapsedLines` | `number` | unset | Collapsed viewport line count; falls back to minLines |
| `defaultCollapsed` | `boolean` | `false` | Initial local collapsed state |
| `collapsed` | `boolean` | unset | Controlled collapsed state |
| `onCollapsedChange` | `(collapsed: boolean) => void` | unset | Collapse state request |
| `maxHeight` | `string \| number` | unset | Scrollable viewport limit; number interpreted as CSS pixels |
| `tokens` | `readonly CodeToken[]` | automatic | Ordered, non-overlapping UTF-16 ranges for external syntax highlighting |
| `classNames` | `Partial<Record<CodePart, string>>` | unset | Shared Code slots including `copy`, `feedback`, `viewport`, `line`, `lineNumber`, `lineText` |
| `className`, `ref`, other props | Native root props | unset | Root `div`; ref typed as HTMLDivElement |

No syntax dependency is added. Supported languages use Code's small tokenizer; external highlighting can supply tokens. When loading standalone CSS parts, import both `code.css` and `codeblock.css` in that order. The bundled stylesheet includes both.

Automated checks exercise exact copies, controlled collapse, keyboard activation, scrolling and accessibility scans. Verify real clipboard permission behavior and human screen-reader announcements in the consuming application. See [shared copy guidance](https://github.com/KhallilB/kbui/blob/main/docs/guides/copyable-content.md).

## Related components

Use [Code](Code.md) for inline literals or automatic block detection and [CopyableText](CopyableText.md) for identifiers and references outside source listings.
