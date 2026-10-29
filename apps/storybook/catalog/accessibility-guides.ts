import type { AccessibilityGuide } from "./accessibility-standards";

export const accessibilityGuides = {
  Avatar: {
    provides: [
      "name labels one image role through photo loading and failure; initials are visual-only fallback content.",
      "decorative hides duplicate identity, while size and shape keep fixed media dimensions.",
    ],
    authoring: [
      "Provide a meaningful name or localized aria-label. Set decorative when an equivalent visible name is adjacent.",
      "Use a named Link or Button for profile navigation; Avatar itself adds no focus stop. Override initials for local naming conventions.",
    ],
    verify: [
      "Read a standalone avatar with a screen reader before and after a failed request; identity should be announced once. Beside a visible name, decorative avatars should be skipped.",
      "Inspect every size in light, dark and forced colors; initials must remain readable and surrounding actions must retain keyboard focus.",
    ],
    standards: ["1.1.1", "1.4.3", "4.1.2"],
  },
  Image: {
    provides: [
      "A named image role persists through loading, success and error; alt=empty hides decorative media.",
      "Fixed aspect ratios reserve layout. Source attributes and load/error callbacks reach the native image; source changes start fresh request state.",
    ],
    authoring: [
      "Supply an alternative describing purpose in context. Keep complex-image explanations in surrounding content and use aria-describedby when needed.",
      "Fallback content must be non-interactive; it is visual-only. Put actionable errors or retry buttons outside Image with their own names. Use contain when cropping would hide essential information.",
    ],
    verify: [
      "Block an image request, then load a replacement: frame dimensions must stay fixed and its accessible name must remain available. Decorative media must be absent from the accessibility tree.",
      "At 320 CSS pixels, enlarged text, both themes and forced colors, check framing, fallback text, and the visible subject. Automated tests do not replace manual screen-reader verification.",
    ],
    standards: ["1.1.1", "1.4.3", "1.4.10"],
  },
  Thumbnail: {
    provides: [
      "A native figure is named by its caption unless the caller supplies a name; image alternatives and metadata survive failure.",
      "The figure adds no focus stop; caption Links, Buttons and Dialog triggers keep their native interaction.",
    ],
    authoring: [
      "Use alt for meaningful visual information and an empty alternative for a decorative attachment tile already identified by its filename.",
      "Compose Grid as ul with li children. Use named caption actions; never place interactive content in image fallback or nest controls. Gallery modal behavior belongs to Dialog.",
    ],
    verify: [
      "Read the gallery as a list and check each figure, alternative and filename. Fail a request: title, format and size must stay readable.",
      "Tab to View Alpine study, press Enter, inspect the named dialog, then Escape; focus must return to its trigger. At 320 CSS pixels verify source order, long captions and visible focus without horizontal overflow.",
    ],
    standards: ["1.1.1", "1.3.1", "1.3.2", "1.4.10", "2.1.1", "2.4.3", "2.4.7", "4.1.2"],
  },
  CopyableText: {
    provides: [
      "Native type=button action supports Enter and Space. Pending writes keep focus and suppress repeated activation; disabled or empty values cannot copy.",
      "A persistent polite, atomic status announces pending, success and failure. Failure instructions stay visible; truncation is removed and exact value shown for manual copying.",
      "copyLabel and feedback props localize action names and announcements. Content remains selectable and success resets after feedbackDuration (zero retains it).",
      "truncate adds an Enter/Space disclosure with aria-expanded and aria-controls; expansion wraps exact value across full width and remains available when copying is disabled.",
      "tone colors content independently of clipboard state; forced colors restore system text colors.",
      "highlight uses mark and bold emphasis. Automatic web/email detection reuses underlined native Link controls; automatic links are absent from Tab order until truncated content expands.",
    ],
    authoring: [
      "Use a purpose-specific copyLabel when multiple copy controls appear together. label supplies visible context, not the button name.",
      "Translate expandLabel and collapseLabel alongside copy feedback. Keep meaning in value and label rather than color; do not use this component to conceal secrets.",
      "Use format=text or linkify=false when detected content should remain literal. Source-code ranges are noninteractive; email destinations open the user’s mail handler. Keep interactive authored children out of clipped previews.",
      "Provide HTTPS or localhost for the Clipboard API. Browser permission, activation and host policy can still prevent copying.",
    ],
    verify: [
      "Tab to each copy action, activate with Enter and Space and compare clipboard bytes with value, including case and whitespace. Focus must stay on action.",
      "Expand and collapse a truncated value with touch, Enter and Space; focus stays on disclosure and the whole raw value wraps. Deny clipboard permission: retry and manual-copy instructions appear, expanding the exact value for selection.",
      "With a screen reader, confirm pending, success and failure announcements without reading initial empty status. Test 320px, zoom, dark theme and forced colors for visible focus and reachable actions.",
      "Expand a linked value, Shift+Tab to its links, and check native link semantics, visible focus and correct destination. Tab back to disclosure and Copy; copying must preserve source without navigating.",
    ],
    standards: [
      "1.3.1",
      "1.4.1",
      "1.4.3",
      "1.4.10",
      "2.1.1",
      "2.4.7",
      "2.5.3",
      "2.5.8",
      "4.1.2",
      "4.1.3",
    ],
  },
  CodeBlock: {
    provides: [
      "Native pre/code preserves source. Line-number decorations are hidden from assistive technology and excluded from clipboard text.",
      "Copy uses the same pending, success and error feedback as CopyableText. Copy remains available for the complete source while collapsed.",
      "The named viewport is keyboard focusable for scrolling. Collapse controls expose aria-expanded and aria-controls without moving focus.",
    ],
    authoring: [
      "Provide a descriptive title for the listing and its scroll region. Customize copyLabel when several blocks need distinct names.",
      "Use highlightLines only as additional emphasis; explain important lines in prose. Confirm syntax and feedback contrast after token changes.",
      "Do not put secrets in source. Clipboard writes require HTTPS or localhost and can fail under browser policy; preserve manual-copy recovery.",
    ],
    verify: [
      "Tab to copy and expand/collapse controls; activate with Enter and Space. Copy while collapsed and compare full source including indentation and trailing newlines.",
      "Focus the viewport and scroll long listings with keyboard. At 320px and zoom, only code viewport should scroll horizontally; controls and messages remain visible.",
      "Deny clipboard access and retry. With a screen reader, check polite status, collapse state and region name. Verify focus under dark theme and forced colors; human assistive-technology coverage remains application-owned.",
    ],
    standards: [
      "1.3.1",
      "1.4.1",
      "1.4.3",
      "1.4.10",
      "2.1.1",
      "2.4.7",
      "2.5.3",
      "2.5.8",
      "4.1.2",
      "4.1.3",
    ],
  },
  Collection: {
    provides: [
      "Native table headers and caption, aria-sort, named checkboxes with mixed page selection, labeled filters and pagination.",
      "Polite result, page, selection and pending statuses; failed actions retain selection and expose an alert. Controls lock while fetching or submitting.",
    ],
    authoring: [
      "Supply stable unique IDs, meaningful label and getItemLabel, readable cell content and a matches predicate for client filtering.",
      "Own server authorization, request cancellation, confirmation of destructive actions, partial failures and focus recovery after removing records. Off-page eligibility must be rechecked by the server.",
    ],
    verify: [
      "Tab through search, facets, sort, row checkboxes, actions and pagination. Use Space to select a row and confirm the page checkbox becomes mixed; page changes retain off-page selection.",
      "With a screen reader, confirm table caption/header relationships, sort direction, checkbox names and result/action feedback. Manual screen-reader interoperability remains unverified.",
      "At 320 CSS pixels, scroll the named table region with keyboard; controls must wrap and focus remain visible. Repeat in both themes, forced colors and enlarged text; table cells may require two-dimensional scrolling.",
    ],
    standards: ["1.3.1", "1.4.1", "1.4.10", "2.1.1", "2.4.7", "4.1.2", "4.1.3"],
  },
  Container: {
    provides: [
      "The as prop selects a native landmark or section element; native naming attributes and refs pass through.",
      "Width and gutters are CSS layout; Container adds no interactive role or focus stop.",
    ],
    authoring: [
      "Choose main for the page’s main content and label additional navigation or region landmarks where their purpose needs distinguishing.",
      "Keep headings and content meaningful in DOM order; a centered boundary does not supply document structure.",
    ],
    verify: [
      "Inspect the accessibility tree for the intended landmark and name.",
      "At 320 CSS pixels and with enlarged text, confirm content and controls remain reachable without clipping.",
    ],
    standards: ["1.3.1", "1.3.2", "1.4.10"],
  },
  Inline: {
    provides: [
      "Items wrap in source order without a toolbar role or arrow-key handler.",
      "The as prop supports native lists and navigation containers.",
    ],
    authoring: [
      "Use li children with ul or ol and give a nav a meaningful name when needed.",
      "Keep independent controls in their normal Tab order; choose Toolbar only for a coordinated action group.",
    ],
    verify: [
      "Tab through every control before and after the row wraps; order must still make sense.",
      "Read the list or navigation with a screen reader and check that long translated labels wrap without hiding actions.",
    ],
    standards: ["1.3.1", "1.3.2", "2.4.3", "1.4.10"],
  },
  Split: {
    provides: [
      "Two layout-owned tracks stack in DOM order as available width narrows.",
      "Track styling is exposed through classNames.track without adding an interactive grid role.",
    ],
    authoring: [
      "Put primary content first and choose semantic child elements and headings for each column.",
      "Do not use CSS reordering to create a reading order that differs from the DOM.",
    ],
    verify: [
      "Read the content in screen-reader browse order both side by side and stacked.",
      "Narrow the actual parent, not just the browser, and check long text, controls, and nested panels remain usable.",
    ],
    standards: ["1.3.1", "1.3.2", "1.4.10"],
  },
  Separator: {
    provides: [
      "A semantic rule uses native hr semantics and exposes orientation when vertical.",
      "decorative hides a visual-only divider from assistive technology and adds no Tab stop.",
    ],
    authoring: [
      "Set decorative when the rule repeats a grouping already conveyed by headings or structure.",
      "Use Panel.Handle for resizing; Separator is a static rule with no input behavior.",
    ],
    verify: [
      "Inspect the accessibility tree: meaningful rules expose the intended orientation and decorative rules are absent.",
      "Tab through the surrounding controls and confirm the rule never becomes an extra focus stop.",
    ],
    standards: ["1.3.1", "1.3.2"],
  },
  Badge: {
    provides: [
      "Badge renders text without adding button behavior, a Tab stop, or a live region.",
      "preserveCase allows literal identifiers to keep their original spelling.",
    ],
    authoring: [
      "Write the category or state in text; tone alone cannot convey its meaning.",
      "Use a separate named action for interaction and Status with live only when a changing message needs announcement.",
    ],
    verify: [
      "Remove color or use forced colors and confirm the label still communicates its meaning.",
      "Read the badge beside the associated item with a screen reader; confirm context, spelling, and text contrast after theming.",
    ],
    standards: ["1.3.1", "1.4.1", "1.4.3"],
  },
  Button: {
    provides: [
      "The Base UI button primitive supplies native button interaction and disabled behavior.",
      "Native naming props and refs pass through; the render API can produce a real link.",
    ],
    authoring: [
      "Use meaningful visible action text. Give icon-only actions an aria-label and hide decorative icons; an overriding name must contain the visible label.",
      "Set type=submit for submission. For navigation via render, use an anchor with href, nativeButton=false, and role=link.",
    ],
    verify: [
      "Tab to the action and activate a button with Enter and Space; a rendered link must announce as a link and follow its destination with Enter.",
      "Check the computed accessible name, visible focus, disabled state, and actual clickable target after custom styling.",
    ],
    standards: ["2.1.1", "2.4.7", "2.5.3", "2.5.8", "4.1.2"],
    pattern: {
      title: "Button pattern",
      href: "https://www.w3.org/WAI/ARIA/apg/patterns/button/",
    },
  },
  Toast: {
    provides: [
      "Viewport is a named polite live region. priority=high uses a separate alert announcement; adding a toast does not move focus.",
      "F6 reaches the viewport, Tab reaches messages and actions, and Escape dismisses a focused message with focus recovery. Hover, keyboard focus and window blur pause timers.",
      "Default close controls have accessible names; closeLabel localizes each default control. Root and part refs, renderToast, placement and container support custom compositions and theme hosts.",
    ],
    authoring: [
      "Supply concise title/description text; reserve high priority for urgent updates. When composing custom content, also supply the message title/description so urgent announcements carry the same meaning.",
      "Set timeout=0 for essential information or time-sensitive actions. Provide an application preference to disable or adjust time limits where required; hover/focus pause alone does not satisfy Timing Adjustable.",
      "Mount one Viewport per provider, localize its aria-label and closeLabel, and keep important results available outside transient notifications. Use named real buttons or links for actions.",
    ],
    verify: [
      "Trigger routine and urgent messages with a screen reader: hear each relevant update without focus moving or duplicate announcements; inspect both initial and updated content.",
      "Use F6, Tab, Shift+Tab and Escape to enter, act on, dismiss and leave messages. Confirm visible focus and return to the previous working control after the last dismissal.",
      "Hover, focus and blur the window during a timed message; it must remain, then resume its remaining time. With timeout=0 it must persist until dismissed.",
      "Exceed limit and dismiss newer messages: older persistent messages return. Check long text at 320 CSS pixels, both themes, RTL, reduced motion, forced colors and application zoom.",
    ],
    standards: [
      "1.4.1",
      "1.4.3",
      "1.4.10",
      "2.1.1",
      "2.2.1",
      "2.4.3",
      "2.4.7",
      "2.5.8",
      "4.1.2",
      "4.1.3",
    ],
  },
  Callout: {
    provides: [
      "The icon slot is decorative and hidden from assistive technology.",
      "live adds role=status for changing messages without moving focus.",
    ],
    authoring: [
      "Include the reason and next step in title/body text; color and an icon are supplementary.",
      "Enable live only for relevant changes and use real named controls in actions. Your app decides when a message changes.",
    ],
    verify: [
      "Trigger the real success, waiting, or error path with a screen reader and check that the useful message is announced without stealing focus.",
      "Check initial and updated messages, action keyboard access, and meaning with color removed.",
    ],
    standards: ["1.4.1", "2.1.1", "4.1.3"],
  },
  Card: {
    provides: [
      "Card renders an article by default and supports native div or li semantics.",
      "It adds no click handler or focus stop; your content supplies real links and buttons.",
    ],
    authoring: [
      "Choose heading rank from the surrounding document and use li inside a list.",
      "If a link covers the card, keep other actions outside that link and give every destination a useful name.",
    ],
    verify: [
      "Read article/list structure and heading order with a screen reader.",
      "Tab through a linked card and its secondary actions; confirm each is separate, named, and visibly focused.",
    ],
    standards: ["1.3.1", "2.4.3", "2.4.4", "2.4.6"],
  },
  Checkbox: {
    provides: [
      "The native checkbox exposes checked and mixed states and is associated with its label, description, and error.",
      "Controlled checked/onCheckedChange props and readOnly/disabled behavior are available.",
    ],
    authoring: [
      "Supply a clear label and update checked after onCheckedChange. Use indeterminate for partial aggregate selection, not a separate saved choice.",
      "Explain required choices and errors in text; preserve the association if labels or parts are restyled.",
    ],
    verify: [
      "Activate by clicking the label and pressing Space; confirm the app updates its stored value.",
      "Use a screen reader to inspect label, mixed/checked state, help, and error. Verify read-only remains understandable and disabled behavior is intentional.",
    ],
    standards: ["1.3.1", "2.1.1", "3.3.1", "3.3.2", "4.1.2"],
    pattern: {
      title: "Checkbox pattern",
      href: "https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/",
    },
  },
  Code: {
    provides: [
      "Block copy controls have accessible action text and a polite completion status.",
      "Decorative line numbers are hidden from assistive technology; collapse controls expose expanded state and their controlled viewport.",
    ],
    authoring: [
      "Pass source text and meaningful language/title information; syntax color cannot carry information missing from the source text.",
      "Keep constrained block viewports keyboard-readable and preserve focus indicators on copy and expand controls.",
    ],
    verify: [
      "Copy using the keyboard and confirm the clipboard contains source without line numbers; test failure feedback too.",
      "Expand/collapse a long listing, read the full code with a screen reader, and verify zoom does not strand content in an unreachable viewport.",
    ],
    standards: ["1.4.1", "1.4.3", "2.1.1", "2.4.7", "4.1.2", "4.1.3"],
  },
  Popover: {
    provides: [
      "Base UI supplies trigger/popup relationships, expanded state, Escape/outside dismissal and focus return.",
      "Content supports title/description, composed labels, initialFocus/finalFocus and collision-aware positioning; non-modal interaction is the default.",
      "Direct Body and Footer sections keep actions outside constrained content scrolling; title/description props form a persistent Header.",
    ],
    authoring: [
      "Name the popup through title, Title or aria-label and include a visible Close action. Use modal only when the workflow requires focus containment.",
      "Keep popovers compact and actions visible. Name a long scrollable Body and set tabIndex=0; use Dialog or Drawer for larger tasks. Keep essential information outside the popup and choose a useful finalFocus target if its trigger disappears.",
    ],
    verify: [
      "Open with Enter, Tab through controls and close with Escape or Close; confirm focus returns to the trigger. An outside press must leave the outside control usable.",
      "With a screen reader inspect the name, description and expanded state. Check 320px, zoom, long content, nested themes, forced colors and a popup inside Dialog.",
      "Run the Chromium/Firefox/WebKit overlay gate and separately assess VoiceOver. Scans exclude only Base UI implementation guards; native focus-boundary tests and a real-control naming regression protect that scope.",
    ],
    standards: ["1.3.1", "1.4.10", "2.1.1", "2.1.2", "2.4.3", "2.4.7", "2.4.11", "4.1.2"],
  },
  Disclosure: {
    provides: [
      "A native button exposes expanded state and its controlled panel; Enter and Space toggle without submitting a form.",
      "Disabled and controlled states pass through. Closed panels are hidden or unmounted; keepMounted retains uncontrolled content state.",
    ],
    authoring: [
      "Use a clear visible trigger label and keep essential instructions, validation feedback and required controls discoverable.",
      "Choose heading structure around the trigger when needed. Do not put another interactive control inside the trigger; use Panel keepMounted for drafts that must survive collapse.",
    ],
    verify: [
      "Tab to the trigger, toggle with Enter and Space, and confirm focus stays on it and collapsed controls leave the Tab order.",
      "With a screen reader confirm expanded/collapsed state and the panel relationship; check retained drafts, disabled states, forced colors, zoom and long labels.",
    ],
    standards: ["1.3.1", "2.1.1", "2.4.3", "2.4.7", "4.1.2"],
    pattern: {
      title: "Disclosure pattern",
      href: "https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/",
    },
  },
  Accordion: {
    provides: [
      "Base UI associates heading buttons with named regions and exposes expanded/disabled state.",
      "Tab reaches enabled triggers; Enter/Space operate them. Single, multiple, controlled and retained-panel modes are available.",
    ],
    authoring: [
      "Use stable unique item values and descriptive trigger labels. Choose heading rank using Header render and keep other actions outside the heading button.",
      "Use multiple for independent panels. Keep groups focused to avoid excessive region landmarks; keep essential information discoverable.",
    ],
    verify: [
      "Tab between triggers, toggle with Enter/Space and verify single versus multiple expansion. Disabled items must reject activation; inner groups must not toggle outer groups.",
      "Use screen-reader heading and region navigation to check names and expanded state. Check long content at 320px, enlarged text, retained drafts, visible focus and forced colors.",
    ],
    standards: ["1.3.1", "1.4.10", "2.1.1", "2.4.3", "2.4.6", "2.4.7", "4.1.2"],
    pattern: {
      title: "Accordion pattern",
      href: "https://www.w3.org/WAI/ARIA/apg/patterns/accordion/",
    },
  },
  Dialog: {
    provides: [
      "Base UI supplies modal semantics, focus containment, Escape dismissal, and trigger focus restoration.",
      "Content title/description props or composed Title/Description parts supply naming relationships; initialFocus/finalFocus accept custom entry and return targets.",
    ],
    authoring: [
      "Provide a descriptive title and a visible Close or Cancel action. Use Content initialFocus/finalFocus when the default targets do not fit the workflow, and test those targets.",
      "Keep validation and saving in your app; failed submission must leave errors perceivable and preserve the user’s work.",
    ],
    verify: [
      "Open by keyboard, cycle Tab and Shift+Tab, then Escape; confirm focus stays in the open modal and returns to the trigger or intended next control.",
      "With a screen reader, verify title, description, errors, and the close action. Check a short/zoomed viewport and nested popups for visible focus and reachable actions.",
    ],
    standards: ["2.1.1", "2.1.2", "2.4.3", "2.4.11", "3.3.1", "4.1.2"],
    pattern: {
      title: "Modal dialog pattern",
      href: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
    },
  },
  FileInput: {
    provides: [
      "A labeled picker button opens the native file input; selection and confirmed-removal feedback use announcement regions.",
      "Stable item IDs let confirmed removal move focus to a remaining remove action or back to the picker.",
    ],
    authoring: [
      "Retain original File objects, apply acceptance rules, and update items after accepted additions/removals. accept only hints at picker types.",
      "Keep each filename in its remove action name, including custom renderItem/removeLabel content; provide actionable rejection text.",
    ],
    verify: [
      "Choose the same file twice, cancel the picker, and reject a file while retaining accepted files; confirm the user can recover.",
      "Remove first, middle, and last items by keyboard; check focus destination and announcement with your supported screen reader, including delayed or refused removal.",
    ],
    standards: ["2.1.1", "2.4.3", "2.5.3", "3.3.1", "3.3.3", "4.1.2", "4.1.3"],
  },
  Grid: {
    provides: [
      "Grid uses CSS layout and supports native ul/ol with li children.",
      "It does not introduce an ARIA grid role or a separate keyboard model.",
    ],
    authoring: [
      "Use ul/ol with li children and role=list for marker-free collections; confirm list exposure in supported browsers and keep visual order consistent with DOM order.",
      "Supply real headings, links, and controls inside each item; layout does not supply their semantics.",
    ],
    verify: [
      "Read the collection with a screen reader and check item count, order, and headings.",
      "At narrow width and enlarged text, Tab through all item actions and confirm the layout preserves reading order without clipping.",
    ],
    standards: ["1.3.1", "1.3.2", "1.4.10", "2.4.3"],
  },
  Heading: {
    provides: [
      "level selects a native h1–h6 element independently from visual size.",
      "Native attributes and refs remain available for labeling surrounding sections.",
    ],
    authoring: [
      "Choose rank from the document hierarchy and write a heading that describes the following content.",
      "Use size for appearance rather than changing rank to obtain a font size.",
    ],
    verify: [
      "Inspect the screen reader’s heading list and navigate by headings; the outline must describe the page meaningfully.",
      "Resize text and override spacing; confirm headings remain visible and associated content is still understandable.",
    ],
    standards: ["1.3.1", "1.4.4", "1.4.12", "2.4.6"],
  },
  Text: {
    provides: [
      "The as prop preserves native paragraph or inline semantics while visual size and tone vary.",
      "Text supports wrapping and a reading measure through CSS tokens.",
    ],
    authoring: [
      "Use paragraphs for prose and appropriate semantic elements for emphasis; visual weight alone does not establish a heading.",
      "Check foreground/background contrast for each chosen tone, especially muted copy and nested themes.",
    ],
    verify: [
      "Enlarge text to 200%, narrow to 320 CSS pixels, and apply the shared guide’s text-spacing override; no content may disappear.",
      "Read mixed prose, links, and code with a screen reader and confirm the intended order and meaning.",
    ],
    standards: ["1.3.1", "1.4.3", "1.4.4", "1.4.10", "1.4.12"],
  },
  Link: {
    provides: [
      "Link renders a native anchor with href, keyboard focus styling, and normal link activation.",
      "Native naming, destination, and ref props pass through.",
    ],
    authoring: [
      "Write link text whose purpose is clear in context and keep any overriding accessible name consistent with visible text.",
      "Use Button for actions; disclose important new-context behavior when a destination opens a different browsing context.",
    ],
    verify: [
      "Find the link in the screen reader’s links list and check its name and destination.",
      "Activate with Enter, confirm focus is visible and not hidden by sticky content, and verify the inline-link exception before judging target size.",
    ],
    standards: ["2.1.1", "2.4.4", "2.4.7", "2.5.3", "4.1.2"],
    pattern: {
      title: "Link pattern",
      href: "https://www.w3.org/WAI/ARIA/apg/patterns/link/",
    },
  },
  Menu: {
    provides: [
      "Base UI supplies the menu trigger/popup relationship, managed item navigation, and dismissal behavior.",
      "Menu.Item exposes action text and a disabled state; separators add no focus stop.",
    ],
    authoring: [
      "Name the trigger and use menu items for actions rather than saved form values.",
      "Keep item text specific and avoid nesting another button or input inside a menu item.",
    ],
    verify: [
      "Open by keyboard, move with arrows, activate an enabled item, and dismiss with Escape; check expected trigger focus return.",
      "Check disabled items, outside-click dismissal, and screen-reader announcement of the trigger’s expanded state and menu items.",
    ],
    standards: ["2.1.1", "2.1.2", "2.4.3", "4.1.2"],
    pattern: {
      title: "Menu button pattern",
      href: "https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/",
    },
  },
  NumberField: {
    provides: [
      "The numeric input is associated with its label, helper/error IDs, and invalid state; increment/decrement actions have localizable names.",
      "value/onValueChange, locale, inputRef, and root ref expose controlled state and focus targets.",
    ],
    authoring: [
      "Include units and valid formats/ranges in label or description. Keep null distinct from zero and validate typed drafts in your app.",
      "Localize incrementLabel/decrementLabel and choose a consistent server/client locale. Preserve native editing when supplying inputProps handlers.",
    ],
    verify: [
      "Clear, type a fraction/out-of-range draft, and use arrows and step buttons; confirm the same app rules and useful error text apply.",
      "With a screen reader, inspect input label/value/help/error and step-action names. Check the active editor’s Tab behavior and target sizes after theming.",
    ],
    standards: ["2.1.1", "2.5.3", "2.5.8", "3.3.1", "3.3.2", "3.3.3", "4.1.2"],
  },
  Panel: {
    provides: [
      "Native section attributes and refs support naming; collapsible Toggle/Body expose disclosure behavior.",
      "Panel.Handle is a focusable separator with a value and controlled-pane relationship; size/onSizeChange expose controlled resizing.",
    ],
    authoring: [
      "Name the section from its visible heading and give Toggle and Handle descriptive accessible names.",
      "For a draggable Handle, provide click/tap resize controls wired to size/onSizeChange. Keyboard arrows alone do not meet the single-pointer alternative requirement.",
    ],
    verify: [
      "Test Tab, collapse/restore, and the splitter’s orientation-specific arrows, Home, End, and Enter; inspect value and controlled pane.",
      "Resize without dragging using the click/tap controls, including at narrow width; confirm the handle value, pane width, and focus remain synchronized.",
    ],
    standards: ["1.3.1", "2.1.1", "2.4.3", "2.4.7", "2.5.7", "2.5.8", "4.1.2"],
    pattern: {
      title: "Window splitter pattern (work in progress)",
      href: "https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/",
    },
  },
  Progress: {
    provides: [
      "Base UI exposes a named progressbar and numeric value/range; valueText supplies a meaningful spoken count.",
      "The visible label remains associated with the progress indicator.",
    ],
    authoring: [
      "Keep value/max consistent with real progress and make valueText describe the same amount.",
      "Provide a separate status message or next-step instruction for completion when needed; a progressbar is not automatically a live region.",
    ],
    verify: [
      "Inspect the accessible name, value, maximum, and value text with a screen reader.",
      "Run a real update through completion; confirm it is perceivable without moving focus and is not announced on every insignificant update.",
    ],
    standards: ["1.3.1", "4.1.2", "4.1.3"],
  },
  RadioGroup: {
    provides: [
      "The named group and labeled radio items expose selection, help, error, and disabled states.",
      "A roving Tab stop and arrow-key navigation keep enabled options reachable.",
    ],
    authoring: [
      "Give the group and each option clear text, use unique values, and update controlled value after onValueChange.",
      "Use null deliberately for unanswered questions and explain required/error states; segmented appearance remains a radio group.",
    ],
    verify: [
      "Enter with Tab, move with arrows, and activate with Space; confirm disabled options are skipped and selection updates.",
      "Inspect group name, option names, selected state, descriptions, and errors with a screen reader, including an initially empty group.",
    ],
    standards: ["1.3.1", "2.1.1", "2.4.3", "3.3.1", "3.3.2", "4.1.2"],
    pattern: {
      title: "Radio group pattern",
      href: "https://www.w3.org/WAI/ARIA/apg/patterns/radio/",
    },
  },
  ScrollArea: {
    provides: [
      "The viewport is a focusable named region with native overflow scrolling.",
      "The label prop names the region and maxHeight constrains its CSS viewport.",
    ],
    authoring: [
      "Use a specific region name and preserve the viewport’s focus indicator.",
      "Keep content semantics inside the region and avoid unnecessary nested scrolling or clipping overflow without a way to reach it.",
    ],
    verify: [
      "Tab into the viewport, scroll with the keyboard, and Tab out to the next control without a trap.",
      "Read the full content with a screen reader and check narrow/zoomed layouts, long lines, and the start/end of the scroll range.",
    ],
    standards: ["1.3.1", "1.4.10", "2.1.1", "2.1.2", "2.4.7", "4.1.2"],
  },
  Select: {
    provides: [
      "The labeled trigger exposes combobox state; Base UI manages option navigation, selection, and dismissal.",
      "Descriptions/errors are associated, and an empty collection disables the trigger with an explanatory helper.",
    ],
    authoring: [
      "Provide a persistent label, unique option values, and meaningful option text; keep the controlled value synchronized.",
      "Explain validation and unavailable choices in words, and preserve theme/contrast when changing the portal container.",
    ],
    verify: [
      "Use arrows/typeahead to find an enabled option, select it, then Escape from an open popup and confirm focus recovery.",
      "Inspect label, expanded/selected state, help, and error with a screen reader; test empty and read-only cases in a scrolling dialog.",
    ],
    standards: ["2.1.1", "2.4.3", "3.3.1", "3.3.2", "4.1.2"],
    pattern: {
      title: "Combobox pattern",
      href: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/",
    },
  },
  Combobox: {
    provides: [
      "The labeled combobox filters options and exposes the popup/selection through Base UI.",
      "Description/error IDs and invalid state are associated with the input; empty results use a status message.",
    ],
    authoring: [
      "Supply meaningful option labels and unique values, and update controlled value when a selection changes.",
      "Keep label/instructions visible and localize clear/toggle action names; do not treat typed search text as a saved selection unless your app explicitly supports that workflow.",
    ],
    verify: [
      "Type a query, move through enabled results with arrows, select with Enter, clear, and dismiss with Escape.",
      "With a screen reader, check expanded/selection state, empty-result feedback, errors, and outside dismissal without trapping page focus.",
    ],
    standards: ["2.1.1", "2.1.2", "2.5.3", "3.3.1", "3.3.2", "4.1.2", "4.1.3"],
    pattern: {
      title: "Combobox pattern",
      href: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/",
    },
  },
  MultiSelect: {
    provides: [
      "A labeled combobox and named selections toolbar expose selected options, per-chip remove actions, and a clear action.",
      "Description/error IDs and invalid state are associated with the input; empty filtering results use a status message.",
    ],
    authoring: [
      "Keep option values stable and unique and update the controlled value after additions/removals.",
      "Use removeLabel to include each visible option label in its removal name, localize clear/toggle labels, and provide specific instructions and correction text.",
    ],
    verify: [
      "Type/filter, use arrows and Enter to select, dismiss with Escape, then test Backspace in an empty input and Delete on a focused chip.",
      "With a screen reader, inspect names/states and empty-result feedback; remove first/last selections and confirm focus remains useful. Verify disabled and read-only prevent unintended changes.",
    ],
    standards: ["1.3.1", "2.1.1", "2.4.3", "2.5.3", "3.3.1", "3.3.2", "4.1.2", "4.1.3"],
    pattern: {
      title: "Combobox pattern; chip toolbar is an additional interaction",
      href: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/",
    },
  },
  Stat: {
    provides: [
      "The label renders before the value in DOM reading order.",
      "Stat is static content and does not create a live region or a focus stop.",
    ],
    authoring: [
      "Include the unit, time period, and any comparison needed to understand the figure without position or color.",
      "Use a separate Status/live message only when a changing measure needs an announcement.",
    ],
    verify: [
      "Read the metric in context with a screen reader; its label, value, and units must make sense in sequence.",
      "Test long labels, enlarged text, and color removal; a changing value must not silently replace an essential result.",
    ],
    standards: ["1.3.1", "1.3.2", "1.4.1", "1.4.3", "4.1.3"],
  },
  Status: {
    provides: [
      "The icon is decorative; the visible text supplies the state meaning.",
      "live adds role=status without introducing a focus stop.",
    ],
    authoring: [
      "Write the state in words and enable live for meaningful changes that need non-interrupting feedback.",
      "Choose an update cadence that communicates progress without repeated noise; your app owns the status text and timing.",
    ],
    verify: [
      "Trigger a real state transition with a screen reader and confirm the useful change is announced without moving focus.",
      "Check the text with color removed, and confirm frequently changing values do not produce excessive repeated announcements.",
    ],
    standards: ["1.4.1", "1.4.3", "4.1.3"],
  },
  Switch: {
    provides: [
      "The named switch exposes checked state, associated helper/error text, and disabled/read-only behavior.",
      "Controlled checked/onCheckedChange props let the app own the saved setting.",
    ],
    authoring: [
      "Use a stable label describing the setting, rather than changing the label between On and Off.",
      "Update checked consistently with the app’s result and explain a failed setting change; do not rely on thumb position or color alone.",
    ],
    verify: [
      "Activate with Space and the label; confirm state and form value match the application model.",
      "With a screen reader, inspect the setting name, on/off state, help/error, and disabled/read-only behavior. Check target size and focus after styling.",
    ],
    standards: ["1.4.1", "2.1.1", "2.5.3", "2.5.8", "3.3.1", "4.1.2"],
    pattern: {
      title: "Switch pattern",
      href: "https://www.w3.org/WAI/ARIA/apg/patterns/switch/",
    },
  },
  Textarea: {
    provides: [
      "A native textarea is associated with a persistent label, helper/error text, and invalid state.",
      "Native input, form, selection, and ref props pass through; resize controls the CSS resize direction.",
    ],
    authoring: [
      "Name the purpose and explain expected format/length before input when needed; a placeholder does not replace the label.",
      "Keep multiline content reachable when setting rows, resize, height, or overflow, and show actionable validation feedback.",
    ],
    verify: [
      "Enter multiline text by keyboard, read the associated help/error, and check disabled/read-only behavior.",
      "Enlarge text, override spacing, resize where enabled, and move the caret through long content without losing access to it.",
    ],
    standards: ["1.3.1", "1.4.4", "1.4.10", "1.4.12", "2.1.1", "3.3.1", "3.3.2", "4.1.2"],
  },
  Fieldset: {
    provides: [
      "A native fieldset/legend supplies the group name and disabled inheritance for descendant controls.",
      "Description/error IDs and invalid state can be associated with the group.",
    ],
    authoring: [
      "Use the legend to describe a related set of answers and still label each individual control.",
      "Distinguish group errors from field errors and keep referenced helper/error IDs valid when content changes.",
    ],
    verify: [
      "Navigate the group with a screen reader and confirm the legend plus individual labels identify each answer.",
      "Test Tab order, disabled descendants, group-level errors, and an ErrorSummary link to the first intended control in the group.",
    ],
    standards: ["1.3.1", "2.4.3", "3.3.1", "3.3.2", "4.1.2"],
  },
  FormActions: {
    provides: [
      "The row uses native div layout without a toolbar role or arrow-key handler.",
      "Buttons remain in DOM order as the row wraps.",
    ],
    authoring: [
      "Give actions specific names and set submit/reset/button types deliberately.",
      "Keep keyboard order aligned with the visual order and own submission, pending, error, and success handling in the form.",
    ],
    verify: [
      "Submit with Enter from a field and activate each secondary button; only the intended action may run.",
      "Narrow the row and Tab through wrapped actions, then verify failed submission has a perceivable error and usable focus destination.",
    ],
    standards: ["1.3.2", "2.1.1", "2.4.3", "2.5.3", "3.2.2", "3.3.1"],
  },
  ErrorSummary: {
    provides: [
      "A named alert region accepts a ref for programmatic focus and renders nothing for an empty item list.",
      "Fragment links focus matching controls or eligible descendants of a referenced wrapper/group.",
    ],
    authoring: [
      "After a failed submit, render the errors and focus the summary ref once the DOM is ready; your app owns validation and that focus decision.",
      "Make every href target a real field/group ID, name the field and correction in each message, and retain inline field errors.",
    ],
    verify: [
      "Submit an invalid form by keyboard, activate each summary link, and confirm the intended control receives visible, unobscured focus.",
      "With a screen reader, check summary/field errors and correction guidance; retest after errors clear, IDs change, or a target becomes unavailable.",
    ],
    standards: ["2.4.3", "2.4.11", "3.3.1", "3.3.2", "3.3.3", "4.1.3"],
  },
  Toolbar: {
    provides: [
      "Base UI supplies a toolbar role and coordinated arrow-key navigation with a roving Tab stop.",
      "Groups/separators preserve the action structure without turning every item into a page Tab stop.",
    ],
    authoring: [
      "Name the toolbar and each action; icon-only buttons need their own accessible names.",
      "Use it for a coherent action group, not a general form row, and preserve orientation and disabled semantics.",
    ],
    verify: [
      "Tab into/out of the toolbar, move with arrows in its orientation, and activate every enabled action.",
      "With a screen reader, inspect toolbar and action names, and check visible focus/target spacing for icon-only controls.",
    ],
    standards: ["2.1.1", "2.1.2", "2.4.3", "2.4.7", "2.5.3", "2.5.8", "4.1.2"],
    pattern: {
      title: "Toolbar pattern",
      href: "https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/",
    },
  },
  Tooltip: {
    provides: [
      "Base UI supplies tooltip semantics and the trigger description relationship.",
      "The child trigger receives the primitive’s props/ref behavior while the popup is rendered in a configurable portal.",
    ],
    authoring: [
      "Use a focusable Button or link child that forwards props/ref and has its own accessible name. Keep required instructions visible outside the tooltip, including on touch devices.",
      "Keep tooltip content non-interactive and preserve the primitive’s dismissal and hover behavior when restyling or wrapping it.",
    ],
    verify: [
      "Focus and hover the trigger, press Escape without moving focus, and move the pointer onto the popup; it must remain usable while hovered and until dismissed or no longer relevant.",
      "With a screen reader, check the trigger name and description separately. Test touch access to all essential instructions and popup visibility at zoom.",
    ],
    standards: ["1.4.13", "2.1.1", "2.4.7", "4.1.2"],
    pattern: {
      title: "Tooltip pattern (work in progress)",
      href: "https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/",
    },
  },
  Input: {
    provides: [
      "A native input is associated with its persistent label, description, error, and invalid state.",
      "Native type, name, autocomplete, value events, and control ref pass through; content slots keep the input node stable.",
    ],
    authoring: [
      "Provide a purpose-specific label, appropriate type/autocomplete, and expected-format instructions; a placeholder does not replace the label.",
      "Keep overriding accessible names consistent with visible text. Name slot actions and mark decorative icons hidden; your app owns search results and validation.",
    ],
    verify: [
      "Tab to the input, edit it, trigger an error, and inspect label/help/error with a screen reader.",
      "For search, clear via keyboard and confirm focus returns to the same input; confirm changing slot actions or result messages does not lose the draft.",
    ],
    standards: ["1.3.1", "1.3.5", "2.1.1", "2.5.3", "3.3.1", "3.3.2", "4.1.2"],
  },
} satisfies Record<string, AccessibilityGuide>;
