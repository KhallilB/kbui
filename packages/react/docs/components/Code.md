# Code

Literal inline code in native `code`, or syntax-highlighted multiline code blocks with a header, copy action, line numbers, line emphasis, and collapsible viewport.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-code--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Code } from "@kb.ui/react";

export function Example() {
  return (
    <p>
      Run <Code>bun run build</Code> before publishing.
    </p>
  );
}
```

## More examples

- [Multiline blocks](https://kbui.kcb.pro/storybook/?path=/story/components-code--multiline): Present source with a language label and copy action.
- [Line numbers and emphasis](https://kbui.kcb.pro/storybook/?path=/story/components-code--line-numbers-and-highlights): Highlight the relevant part of a listing.
- [Collapsible listings](https://kbui.kcb.pro/storybook/?path=/story/components-code--collapsible): Keep a long example within a bounded viewport.
- [Code within prose](https://kbui.kcb.pro/storybook/?path=/story/components-code--in-text): Keep code legible inside a sentence.
- [Long paths and commands](https://kbui.kcb.pro/storybook/?path=/story/components-code--long-token): Check wrapping with an unbroken token.

## Reference

| Prop                             | Type                           | Default                | Notes                                                                                                                                                    |
| -------------------------------- | ------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`                       | `ReactNode`                    | unset                  | Pass source code as a string; multiline strings auto-switch to block mode                                                                                |
| `block`                          | `boolean`                      | auto                   | Force block (`true`) or inline (`false`) rendering                                                                                                       |
| `language`                       | `CodeLanguage`                 | `"tsx"` in block mode  | Grammar (`tsx`, `ts`, `jsx`, `js`, `css`, `html`, `json`, `bash`, `sh`, `shell`, `plain`, `text`) and badge label                                        |
| `title`                          | `string`                       | unset                  | Filename or caption in the block header, or native `title` when `block={false}`                                                                          |
| `copyable`                       | `boolean`                      | `true` in block mode   | Show the copy-to-clipboard button in the block header                                                                                                    |
| `onCopy`                         | `(code: string) => void`       | unset                  | Called with the raw code string after a successful clipboard copy                                                                                        |
| `lineNumbers`                    | `boolean`                      | `false`                | Render a non-selectable line-number gutter in block mode                                                                                                 |
| `startLine`                      | `number`                       | `1`                    | Starting line number for `lineNumbers` and `highlightLines`                                                                                              |
| `highlightLines`                 | `readonly number[]`            | unset                  | Line numbers (relative to `startLine`) to emphasize                                                                                                      |
| `minLines`                       | `number`                       | unset                  | Minimum visible line count for the block (and default collapsed line count when `collapsible` is enabled without `collapsedLines`)                       |
| `collapsible`                    | `boolean`                      | `false`                | Add an expand/collapse toggle for longer listings                                                                                                        |
| `collapsedLines`                 | `number`                       | `minLines`             | Visible line count when a `collapsible` block is collapsed                                                                                               |
| `defaultCollapsed` / `collapsed` | `boolean`                      | `false` / uncontrolled | Initial or controlled collapsed state when `collapsible` is enabled                                                                                      |
| `onCollapsedChange`              | `(collapsed: boolean) => void` | unset                  | Called when the user toggles the collapsed state                                                                                                         |
| `maxHeight`                      | `string \| number`             | unset                  | Maximum viewport height in block mode                                                                                                                    |
| `tokens`                         | `readonly CodeToken[]`         | `tokenizeCode()`       | Custom `[start, end, kind]` syntax ranges overriding the built-in tokenizer                                                                              |
| `classNames`                     | `ClassNames<CodePart>`         | unset                  | Extra classes for `header`, `meta`, `title`, `language`, `actions`, `toggle`, `copy`, `viewport`, `pre`, `content`, `line`, `lineNumber`, and `lineText` |
| `className`, `ref`               | Native element props           | unset                  | Targets `code` in inline mode or root `div` in block mode                                                                                                |

```tsx
import { Code } from "@kb.ui/react";

export function SnippetExample() {
  return (
    <Code
      title="src/theme.ts"
      language="ts"
      lineNumbers
      highlightLines={[2]}
      minLines={4}
    >
      {`export const defaultTheme = "light";\nexport const accent = "persimmon";`}
    </Code>
  );
}
```

Single-line strings without block props render as an inline `code` element that inherits surrounding line height and wraps long paths. Strings containing `\n` or any block prop (`language`, `title`, `copyable`, `lineNumbers`, `highlightLines`, `minLines`, `collapsible`, `collapsedLines`, `maxHeight`, `tokens`) switch automatically to a framed block listing unless `block={false}` is set. Line numbers use CSS `attr(data-line-number)` so selecting or reading `code.textContent` returns only the raw code. Customize block surfaces and syntax colors with `--kb-code-block-*` and `--kb-code-syntax-*`.

Block copying shares the [copy feedback props](CopyableText.md#reference): `disabled`, `copyLabel`, `copyingLabel`, `copiedLabel`, `copyErrorLabel`, `successMessage`, `errorMessage`, `feedbackDuration` and `onCopyError`. `Code` defaults to `Copy code`, `Copy failed`, `Code copied to clipboard` and `Failed to copy code. Select and copy the text manually.`. `onCopy` is a successful-write callback rather than a native clipboard event handler. Pending writes retain focus and ignore repeated activation; errors remain visible until retry or source change. `classNames.feedback` styles the persistent polite status region. Block viewports expose a named keyboard scroll region using `title` or the label “Code”.

## Related components

Use [`CodeBlock`](CodeBlock.md) for explicit block semantics, [`CopyableText`](CopyableText.md) for copyable identifiers, [`Text`](Text.md) for prose and [`Link`](Link.md) for a destination.
