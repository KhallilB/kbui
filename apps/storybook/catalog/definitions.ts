import type { CatalogGroup } from "./types";

type Definition = {
  group: CatalogGroup;
  description: string;
};
export const definitions: Record<string, Definition> = {
  Checkbox: {
    group: "Forms",
    description: "Let people select options independently, including a mixed selection.",
  },
  RadioGroup: { group: "Forms", description: "Choose one option from a visible group." },
  Select: { group: "Forms", description: "Choose one option from a dropdown list." },
  Badge: {
    group: "Feedback",
    description: "Add a short label, category, or piece of metadata.",
  },
  Button: {
    group: "Actions",
    description: "Trigger an action or link to another page.",
  },
  Callout: {
    group: "Feedback",
    description: "Highlight a message and offer a useful next step.",
  },
  Card: {
    group: "Layout",
    description: "Group related content, with room for links and actions.",
  },
  Code: { group: "Typography", description: "Literal inline code that wraps long paths." },
  Dialog: {
    group: "Actions",
    description: "Keep a focused task in a dialog while the page waits behind it.",
  },
  FileInput: {
    group: "Forms",
    description: "Choose files, review the list, and remove individual items.",
  },
  Grid: {
    group: "Layout",
    description: "Arrange content in responsive columns or a single stack.",
  },
  Heading: {
    group: "Typography",
    description: "Native heading hierarchy with independent visual sizing.",
  },
  Input: {
    group: "Forms",
    description: "Collect text with a clear label, help text, and error feedback.",
  },
  Link: {
    group: "Typography",
    description: "Recognizable navigation with visible keyboard focus.",
  },
  Menu: {
    group: "Actions",
    description: "Keep related actions in a compact popup menu.",
  },
  NumberField: {
    group: "Forms",
    description: "Enter a number by typing or using step buttons.",
  },
  Panel: {
    group: "Layout",
    description: "Organize a section with a header, content, and actions.",
  },
  Progress: {
    group: "Feedback",
    description: "Show how much of a task is complete.",
  },
  ScrollArea: {
    group: "Layout",
    description: "Keep longer content in a scrollable, keyboard-accessible region.",
  },
  Stat: {
    group: "Feedback",
    description: "Show a number alongside the label that explains it.",
  },
  Status: {
    group: "Feedback",
    description: "Describe a current state with text and an optional icon.",
  },
  Switch: {
    group: "Forms",
    description: "Turn an immediate preference on or off.",
  },
  Text: {
    group: "Typography",
    description: "Readable paragraphs, inline text and supporting content.",
  },
  Toolbar: {
    group: "Actions",
    description: "Group related actions with arrow-key navigation.",
  },
  Tooltip: {
    group: "Feedback",
    description: "Add brief context on hover or keyboard focus.",
  },
};
