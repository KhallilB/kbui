# Implementing and verifying accessibility

Use this guide with each component’s live Accessibility section. Target the applicable Level A and AA requirements of [WCAG 2.2](https://www.w3.org/TR/WCAG22/), then assess the complete page and task. A component’s available semantics and passing tests are evidence for particular behaviors; they do not establish conformance for every composition, theme, browser, or assistive technology.

WCAG defines requirements. The [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) describes interaction patterns and examples; it is informative guidance. Some patterns, including tooltip and window splitter, are explicitly works in progress. Start with native HTML and use the component’s documented behavior rather than adding redundant roles or replacing its keyboard handlers.

## Read a component’s contract

Each live component reference distinguishes:

- **Provided by kbui:** implemented semantics, relationships, state, focus behavior, and public configuration points.
- **Your implementation:** names, text, controlled state, validation, theme choices, and workflow behavior the application must supply.
- **Verify before shipping:** tasks with observable outcomes, including keyboard and screen-reader checks.
- **Standards and patterns:** linked WCAG criteria relevant to that use and any informative APG pattern. The list is a starting point for assessing applicability, not an exhaustive page audit.
- **Coverage and limits:** links to implementation, component tests, and browser stories. Record what remains unverified in the application.

If a required name, state, relationship, focus target, or alternative input method cannot be expressed through the public API, treat that as a component gap. Implement and test the missing capability before claiming support; document unresolved gaps explicitly.

## Names, structure, and instructions

Give controls persistent, purpose-specific labels. Use the component’s label, legend, description, and error props so the relationships reach the actual control. Use a placeholder for an example value rather than as the only label. Add expected format, units, and constraints when users need them to answer. See [labels and instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) and [input-purpose identification](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html).

When visible text labels a control, its accessible name must contain that text; placing it at the beginning is useful for speech input. An icon-only action still needs a meaningful name. Hide decorative icons from assistive technology. Check the computed name in the accessibility tree instead of assuming aria-label improved it. See [label in name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html).

Choose headings, lists, landmarks, fieldsets, links, and buttons from their purpose. Visual size does not establish heading rank, and a styled layout does not become an interactive grid. Read the page in DOM order and inspect its heading/landmark navigation. A named group does not remove the need to label its individual controls.

## Keyboard, focus, and pointer input

Complete the task with the keyboard. Tab and Shift+Tab must reach and leave controls in a meaningful order. Composite widgets use their documented arrow-key model. Open and close popups, cancel without acting, and confirm useful focus return. Do not add positive tabindex values or intercept editing keys without preserving their expected behavior. See [keyboard operation](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html), [no keyboard trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html), and [focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html).

Keep focus visible in every enabled state and theme. Test invalid fields, nested surfaces, overflow clipping, and sticky headers/footers. Under WCAG 2.4.11, author-created content must not entirely hide the focused component; keeping the whole focus target visible is a useful implementation goal. See [visible focus](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) and [focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).

For WCAG 2.5.8, evaluate the actual pointer target against the 24 by 24 CSS pixel minimum or a qualifying exception. The spacing exception has geometric conditions; a small icon or a fixed gap alone proves neither pass nor failure. Inline text links, equivalent controls, unmodified user-agent controls, and essential presentation have specific exceptions. Check [target size and exceptions](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) after changing density, padding, or tokens.

A dragging operation also needs a single-pointer method that works without dragging, unless an applicable exception holds. Keyboard support alone does not meet this requirement. For Panel.Handle, use the controlled size/onSizeChange API to add click/tap resize controls; see the [working composition recipe](../../packages/react/docs/components/Panel.md#resizing-without-dragging). Check [dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) against the actual task and alternatives.

## Contrast, zoom, spacing, and motion

Measure text against its actual background, including nested themes and custom tokens. Ordinary text generally needs 4.5:1; qualifying large text needs 3:1. Large-scale text has a defined size/weight threshold, not a subjective appearance. The criterion also defines exceptions such as inactive controls and logos. See [text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Meaningful visual information identifying controls, their states, and graphical objects generally needs 3:1 against adjacent colors, subject to the criterion’s exceptions. A colored border is not always necessary if another sufficiently contrasting visual cue identifies the control. A state must also remain understandable without color alone. See [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) and [use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html). Re-measure after restyling; defaults do not certify custom themes.

Check text enlargement to 200% without losing content or function. For normally vertical page content, check reflow at an effective width of 320 CSS pixels; genuinely two-dimensional content has specific exceptions. A 320-pixel viewport is useful for layout testing but does not replace browser zoom testing. See [resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) and [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

Apply the text-spacing overrides together: line height 1.5 times font size, paragraph spacing 2 times font size, letter spacing 0.12 times font size, and word spacing 0.16 times font size. Content and controls must remain available where these properties apply; these are override checks, not required default styling. See [text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html).

Test Windows forced colors or equivalent high-contrast settings, and honor reduced-motion preferences in application animations. Reduced-motion support is an important accommodation; the AAA [animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) criterion should not be described as a blanket Level AA rule for every transition.

## Errors, updates, and temporary content

The application owns validation and correction text. Mark the invalid control, explain the issue in words, and suggest a correction when known. Keep accepted values and useful drafts. An ErrorSummary links to real field/group IDs and complements inline errors; the application decides when to render and focus it after failed submission. See [error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) and [error suggestions](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html).

Use live Status/Callout behavior for relevant messages that should be announced without taking focus. A progressbar or changed DOM text is not automatically a live announcement. Keep updates concise, avoid excessive repetition, and test actual delivery with supported assistive technology. See [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

For hover/focus content such as a tooltip, test dismissal without moving focus/pointer where required, pointer movement onto the popup, and persistence while it remains relevant. Keep essential instructions available without hover and make the trigger independently named. See [content on hover or focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html).

## Run a manual task pass

1. Start from the real initial state. Put the mouse aside and complete the task with Tab, Shift+Tab, and the widget’s documented keys. Note lost, hidden, unexpected, or trapped focus.
2. Repeat with a supported screen reader. Use its heading/control navigation and interact with the fields. Listen for the expected name, role, state/value, instructions, errors, and useful result announcements; inspect the accessibility tree to diagnose differences, not to substitute for speech output.
3. Complete pointer/touch actions without hover-only instructions or required dragging. Include dismissal, cancellation, and error recovery.
4. Repeat relevant steps with zoom/enlarged text, spacing overrides, forced colors, reduced motion, and each supported theme. Include realistic long and translated content.
5. Record the environment, steps, observed outcome, and unresolved gaps below. Passing one browser/assistive-technology combination does not establish another combination’s behavior.

## Evidence before claiming support

Run the checks that cover the changed behavior and composition. Repository checks include component tests, browser stories with accessibility scans, theme/state checks, and built Docs verification. For a changed component, use the commands in [Adding a component](adding-a-component.md#theme-and-state-support) and [CONTRIBUTING](../../CONTRIBUTING.md). To inspect built reference content after serving the combined site:

```bash
STORYBOOK_URL=http://127.0.0.1:4174/storybook bun run --filter @kb.ui/storybook verify:component-docs
```

Automated checks catch many structural regressions and exercise the states they name. They do not establish all WCAG criteria, human-readable labels, complete keyboard task usability, or screen-reader interoperability. Verify the full task with representative browser/assistive-technology combinations from your supported audience; record missing coverage rather than treating an axe pass as conformance.

Keep a compact record with the release or application review:

| Record | Include |
|---|---|
| Scope | Page/task, component configuration, theme, content, applicable criterion |
| Environment | Browser, OS, screen reader/other assistive technology and versions; test date |
| Procedure | Starting state, keyboard/pointer steps, expected focus/name/state/announcement |
| Result | Observed outcome and automated evidence actually run |
| Gaps | Failed or unverified cases, mitigation, owner, and follow-up |

Retest affected evidence when component behavior, labels, state, CSS, theme tokens, or supported environments change. Preserve the distinction between a supported API, an automated regression check, a manual assessment, and a claim about complete-page conformance.


### Overlay compatibility

Run `bun run test:overlays` after building packages. The gate checks Accordion, Disclosure, Dialog and Popover in Chromium, Firefox and WebKit, with explicit light/dark themes and normal/reduced motion. Component stories exercise disclosure state, popup/drawer behavior and application-owned recovery flows.

Axe scans the body, including portaled controls. Only `[data-base-ui-focus-guard]` implementation elements are excluded, following the [Base UI maintainer’s guidance](https://github.com/mui/base-ui/issues/5237#issuecomment-4978602561). WebKit exposes those sentinels as buttons so VoiceOver cursor movement triggers focus redirection. Preserve the guards and their roles; adding names or aria-hidden to silence a scanner changes the primitive’s behavior. Naming rules remain enabled for actual controls.

On macOS, the pinned Firefox runtime receives a fresh `CFFIXED_USER_HOME` for app-data lookup, scoped to Firefox’s launch environment. The normal HOME and other browsers’ environments remain intact. Cleanup touches only generated private directories and excludes symlink targets. This avoids the [upstream macOS launch issue](https://github.com/microsoft/playwright/issues/42768) without granting access to the real Firefox app-data directory. Reassess the workaround when updating Playwright’s bundled Firefox.

These checks establish the named browser behaviors and scanner scope. They do not substitute for a human VoiceOver or other screen-reader task pass, physical-device testing, or complete-page conformance assessment.
