# Copyable content

Use CopyableText for precise identifiers and references; use CodeBlock for commands, configuration and source. Both preserve exact source and confirm only completed clipboard writes. APIs live in the [CopyableText](../../packages/react/docs/components/CopyableText.md) and [CodeBlock](../../packages/react/docs/components/CodeBlock.md) references.

## Pair context with a named action

```tsx
import "@kb.ui/react/styles.css";
import { CodeBlock, CopyableText } from "@kb.ui/react";

export function SupportDetails() {
  return (
    <section aria-label="Support details">
      <CopyableText
        label="Request ID"
        value="req_A7k2"
        copyLabel="Copy request ID"
      />
      <CodeBlock title="Diagnostic command" language="bash" copyLabel="Copy diagnostic command">
        {"curl https://example.com/requests/req_A7k2"}
      </CodeBlock>
    </section>
  );
}
```

Give each copy control a purpose-specific visible label when the page has several. `label` and `title` provide context; `copyLabel` names the copy button. Native type=button controls do not submit enclosing forms.

## Inspect long values and add color

Set `truncate` for a compact single-line preview with a visible `Show full value` action. Expansion reveals the raw value, wrapping across the full field width with no horizontal page scrolling. `Show less` restores the preview. Inspection stays available when copying is disabled; copy always uses the complete original value in either state. Customize `expandLabel` and `collapseLabel` with the rest of the feedback text.

Set CopyableText `tone` to `accent`, `info`, `success`, `warning` or `danger` for colored values and subtle field tints. The default is `neutral`. Keep meaning in the label and value; tone does not represent copy success or failure. Neutral value color can be customized with `--kb-copyabletext-value-color`, and `classNames.value` supports caller styling. CodeBlock uses `--kb-code-syntax-*` variables for individual syntax roles; the Colorful story demonstrates semantic color overrides. Confirm contrast in light/dark themes and readable values in forced colors.

## Emphasize text and recognize links

Use `mono={false}` for prose and `highlight={["production", "req_A7k2"]}` for literal emphasis. Automatic mode detects web URLs, qualified ASCII emails and conservative source patterns, including inline backticks, fenced code, JSON, JavaScript/TypeScript, CSS, HTML and common shell commands. Text and links retain the original string for selection and copying, including punctuation and whitespace. Matching is case-sensitive and treats terms as text rather than patterns. Detected web/email links use Link and its router provider; unsupported schemes remain text. Code ranges receive syntax colors and never become navigation targets. Use format=text to keep content literal, format=code with language for explicit source, and linkify=false to disable detected links. Detection does not validate email deliverability or infer every language.

Truncated previews keep automatic links out of Tab order until expanded. After Show full value, Shift+Tab reaches links above the disclosure; Tab reaches Copy. Highlighting and links remain available in expanded and error views. For authored rich text, provide children with Link, strong, em or Code; expansion still reveals and formats exact value. Recognition is conservative and preserves original delimiters; explicit formatting overrides remain available.

## Communicate result and recovery

Pending writes display `Copying…`, retain focus and ignore repeat activation. Success displays `Copied` and updates an existing polite status region. `onCopy` receives the exact source after completion. It is a success callback rather than React's native clipboard event handler; consumer callback errors do not become clipboard failures. `onCopyError` receives write failures and API-unavailable errors.

Errors remain visible until retry or content change. Keep source selectable. CopyableText automatically expands and displays exact `value` after failure, even when `children` customizes its initial display. CodeBlock always preserves complete source under syntax markup and copies all lines while collapsed. Users can expand and select code for manual recovery.

Use `feedbackDuration={0}` to keep success feedback; otherwise it resets after the configured duration. Changing source or disabled state clears feedback and prevents stale promises from updating state or calling callbacks. Unmounting has the same protection. The operating system may still complete a write already issued before that change.

## Localize all feedback

Set `copyLabel`, `copyingLabel`, `copiedLabel`, `copyErrorLabel`, `successMessage` and `errorMessage` together. Keep retry instructions actionable and distinguish pending from completion. Feedback meaning must remain clear without color.

## Verify the host environment

The Clipboard API requires a secure context such as HTTPS or localhost. Permissions, browser activation requirements and iframe policy can still reject copying. No deprecated execCommand fallback is used. Test actual clipboard contents, permission denial, retry and manual selection in supported hosts.

Test Tab, Enter and Space, visible focus through pending/success/error states, long values at 320 CSS pixels and enlarged text, dark theme and forced colors. For CodeBlock, focus its named viewport and scroll long lines with the keyboard. Run a human screen-reader check for announcements and collapse state; automated scans alone do not verify announcement quality. Follow the [accessibility verification guide](accessibility.md).
