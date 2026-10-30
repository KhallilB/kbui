# CopyableText

Copy identifiers, commands and references with explicit feedback. Values remain selectable, including when clipboard permission is denied.

[All components](../../README.md#components) · [Usage](#usage) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-copyabletext--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { CopyableText } from "@kb.ui/react";

export function Example() {
  return (
    <CopyableText
      label="Request ID"
      value="req_01JCP6NF8B4M2WQ9K7X3"
      copyLabel="Copy request ID"
    />
  );
}
```

`value` is the clipboard source. Case, whitespace, Unicode and trailing newlines are preserved. `children` can format the collapsed display independently; expanding or a copy failure reveals the exact value for inspection and manual copying. Do not use this component to conceal secrets.

The native `button` retains focus while a write is pending. Repeated activation during that write does nothing. Success appears only after the Clipboard API resolves; its callback receives the copied value. If value changes, the component is disabled, or it unmounts, outstanding writes cannot update feedback or fire callbacks. A write already sent to the operating system cannot be cancelled.

A visible failure message remains until retry or content change. Users can select the full value and copy manually. Clipboard writes require a secure context such as HTTPS or localhost; browser permission, user activation, iframe policy or host restrictions can still reject them. No legacy clipboard fallback is attempted.

With `truncate`, a single-line preview has an explicit `Show full value` button. Activating it wraps the complete raw value across the field width; `Show less` restores the compact preview. The action works with touch, Enter and Space, retains focus, and exposes `aria-expanded` and `aria-controls`. It stays available when copying is disabled. A changed value resets the disclosure. Failure automatically expands it; users can collapse it again deliberately. CSS truncation preserves full text in the accessibility tree; disclosure controls visual wrapping. No hover-only tooltip is required.

Set `tone` to color the value and softly tint field appearance. Neutral is the default; accent, info, success, warning and danger reuse semantic theme colors. Tone is emphasis, not clipboard state or an announcement. Keep meaning in the label and value, including forced-colors mode. For a custom neutral color, override `--kb-copyabletext-value-color`; use `classNames.value` for richer display styling.

Set `highlight` to a string or array of literal, case-sensitive terms. Matches use semantic `mark` elements with bold emphasis; the longest match wins when terms overlap at the same position. Matching never interprets HTML or regular expressions and never changes copied content.

Automatic `format="auto"` recognizes HTTP(S) and `www.` URLs, qualified ASCII email addresses, backtick-delimited inline code, fenced code, valid JSON objects/arrays, and conservative JavaScript/TypeScript, CSS, HTML and common package-manager/Git/curl command patterns. `Code` receives the existing syntax colors and suppresses navigation inside source. Delimiters, whitespace and clipboard bytes remain literal.

Use `format="text"` for identifiers or prose that resemble code, or `format="code"` with `language` for explicit source. A language hint forces code in automatic mode. Detection is intentionally conservative; it does not validate email deliverability or infer every programming language. Unknown fenced languages render as plain code. For large listings, prefer `CodeBlock`.

Detected links reuse `Link` styling and `Link.Provider`. Emails use mailto destinations with an encoded address; web links remain underlined native anchors. Sentence punctuation and unmatched closing brackets stay outside anchors. Set `linkify={false}` to disable detected links, or `linkify` with `format="text"` to opt back into links without code detection. Authored children retain caller-owned `Link`, strong, em or `Code` composition; automatic formatting applies to displayed raw source.

In truncated previews, detected links become interactive only after expansion. This keeps clipped links out of Tab order. After expanding, Shift+Tab reaches links above the disclosure; Tab continues to Copy. Copying remains a separate action. Errors expand the same formatted raw source for manual selection. `mono={false}` gives prose the proportional font and body line spacing.

## More examples

- [Automatic recognition](https://kbui.kcb.pro/storybook/?path=/story/components-copyabletext--automatic): URLs, emails, inline commands and source code.
- [Text and links](https://kbui.kcb.pro/storybook/?path=/story/components-copyabletext--rich-content): prose with literal highlights and native web links.
- [References](https://kbui.kcb.pro/storybook/?path=/story/components-copyabletext--references): identifiers, URLs and invitation text.
- [Inline](https://kbui.kcb.pro/storybook/?path=/story/components-copyabletext--inline): compact reference beside prose.
- [Long values](https://kbui.kcb.pro/storybook/?path=/story/components-copyabletext--long-value): expand and collapse a full-width wrapped value.
- [Colors](https://kbui.kcb.pro/storybook/?path=/story/components-copyabletext--colors): six value tones with matching field tints.
- [Copy feedback](https://kbui.kcb.pro/storybook/?path=/story/components-copyabletext--copy-feedback): pending, focus retention and success.
- [Copy failure](https://kbui.kcb.pro/storybook/?path=/story/components-copyabletext--copy-failure): persistent recovery instructions.
- [Localized](https://kbui.kcb.pro/storybook/?path=/story/components-copyabletext--localized): translated button and announcement text.

## Reference

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `string` | required | Exact clipboard contents; empty string disables action |
| `children` | `ReactNode` | `value` | Optional display; exact value is shown on failure |
| `label` | `string` | unset | Visible context above value; does not name the button |
| `appearance` | `"field" \| "plain"` | `"field"` | Bordered field or inline treatment |
| `size` | `"sm" \| "md"` | `"md"` | Density; default copy target follows button height token |
| `mono` | `boolean` | `true` | Monospace value display |
| `tone` | `CopyableTextTone` | `"neutral"` | `neutral`, `accent`, `info`, `success`, `warning` or `danger`; independent of copy state |
| `truncate` | `boolean` | `false` | Single-line preview with explicit full-value disclosure |
| `expandLabel` | `string` | `"Show full value"` | `Disclosure` text when collapsed |
| `collapseLabel` | `string` | `"Show less"` | `Disclosure` text when expanded |
| `disabled` | `boolean` | `false` | Disables copying, retains selectable value |
| `copyLabel` | `string` | `"Copy"` | Visible action and accessible name; use specific purpose |
| `copyingLabel` | `string` | `"Copying…"` | Pending label and polite announcement |
| `copiedLabel` | `string` | `"Copied"` | Success label |
| `copyErrorLabel` | `string` | `"Retry copy"` | Failure label; action retries |
| `successMessage` | `string` | `"Copied to clipboard"` | Polite success announcement |
| `errorMessage` | `string` | `"Copy failed. Select and copy the text manually."` | Visible polite error and recovery instructions |
| `feedbackDuration` | `number` | `2000` | Success reset in milliseconds; zero retains success, invalid or negative uses default |
| `onCopy` | `(value: string) => void` | unset | Current write succeeded; replaces native clipboard event prop |
| `onCopyError` | `(error: unknown) => void` | unset | Current write failed, including unavailable API |
| `highlight` | `string \| readonly string[]` | unset | Literal case-sensitive terms; empty terms ignored, longest overlapping match wins |
| `format` | `CopyableTextFormat` | `"auto"` | `auto`, `text`, or `code`; conservative recognition with explicit overrides |
| `language` | `CodeLanguage` | unset | `Code` hint; forces code in auto mode; text mode remains literal |
| `linkify` | `boolean` | automatic | Override detected web/email links; false disables links; code ranges never become links |
| `classNames` | `Partial<Record<CopyableTextPart, string>>` | unset | `label`, `value`, `actions`, `toggle`, `copy`, `feedback`, `link`, `highlight`, `code` slots |
| `className`, `ref`, other props | Native `span` props | unset | Root element; native `onCopy` replaced by success callback |

The root exposes `data-copy-state="idle|pending|copied|failed"`, appearance, size, tone, mono, expandable, expanded, truncate and disabled attributes. Pending sets `aria-disabled` on the button while preserving focus. The status region exists before interaction and is empty initially. Failure is both visible and announced; success has a visible button label and polite announcement.

Use `--kb-copyabletext-highlight-background` for marked text and `Link` tokens for navigation styling. Standalone CSS users also load `link.css` and `code.css` for detected links and syntax styling. Use `--kb-copyabletext-*` tokens for gap, padding, radius, border, background, neutral value color, target size and minimum copy width. `className` styles the root; `classNames` styles individual parts. Verify contrast and target sizes after overrides. Automated tests cover component behavior, browser keyboard activation and accessibility scans; screen-reader announcement quality remains a human verification task.

## Related components

Use [`CodeBlock`](CodeBlock.md) for highlighted source and multiline commands, [`Code`](Code.md) for inline literals, and [`Link`](Link.md) for navigation. [Copyable content guidance](https://github.com/KhallilB/kbui/blob/main/docs/guides/copyable-content.md) covers shared recovery and localization.
