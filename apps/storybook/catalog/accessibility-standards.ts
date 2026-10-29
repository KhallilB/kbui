export const accessibilityStandards = {
  "1.3.1": { title: "Info and Relationships", level: "A", anchor: "info-and-relationships" },
  "1.3.2": { title: "Meaningful Sequence", level: "A", anchor: "meaningful-sequence" },
  "1.3.5": { title: "Identify Input Purpose", level: "AA", anchor: "identify-input-purpose" },
  "1.4.1": { title: "Use of Color", level: "A", anchor: "use-of-color" },
  "1.4.3": { title: "Contrast (Minimum)", level: "AA", anchor: "contrast-minimum" },
  "1.4.4": { title: "Resize Text", level: "AA", anchor: "resize-text" },
  "1.4.10": { title: "Reflow", level: "AA", anchor: "reflow" },
  "1.4.11": { title: "Non-text Contrast", level: "AA", anchor: "non-text-contrast" },
  "1.4.12": { title: "Text Spacing", level: "AA", anchor: "text-spacing" },
  "1.4.13": {
    title: "Content on Hover or Focus",
    level: "AA",
    anchor: "content-on-hover-or-focus",
  },
  "2.1.1": { title: "Keyboard", level: "A", anchor: "keyboard" },
  "2.1.2": { title: "No Keyboard Trap", level: "A", anchor: "no-keyboard-trap" },
  "2.4.3": { title: "Focus Order", level: "A", anchor: "focus-order" },
  "2.4.4": { title: "Link Purpose (In Context)", level: "A", anchor: "link-purpose-in-context" },
  "2.4.6": { title: "Headings and Labels", level: "AA", anchor: "headings-and-labels" },
  "2.4.7": { title: "Focus Visible", level: "AA", anchor: "focus-visible" },
  "2.4.11": {
    title: "Focus Not Obscured (Minimum)",
    level: "AA",
    anchor: "focus-not-obscured-minimum",
  },
  "2.5.3": { title: "Label in Name", level: "A", anchor: "label-in-name" },
  "2.5.7": { title: "Dragging Movements", level: "AA", anchor: "dragging-movements" },
  "2.5.8": { title: "Target Size (Minimum)", level: "AA", anchor: "target-size-minimum" },
  "3.2.2": { title: "On Input", level: "A", anchor: "on-input" },
  "3.3.1": { title: "Error Identification", level: "A", anchor: "error-identification" },
  "3.3.2": { title: "Labels or Instructions", level: "A", anchor: "labels-or-instructions" },
  "3.3.3": { title: "Error Suggestion", level: "AA", anchor: "error-suggestion" },
  "4.1.2": { title: "Name, Role, Value", level: "A", anchor: "name-role-value" },
  "4.1.3": { title: "Status Messages", level: "AA", anchor: "status-messages" },
} as const;

export type AccessibilityStandardId = keyof typeof accessibilityStandards;
export type AccessibilityGuide = {
  provides: string[];
  authoring: string[];
  verify: string[];
  standards: AccessibilityStandardId[];
  pattern?: { title: string; href: string };
};
