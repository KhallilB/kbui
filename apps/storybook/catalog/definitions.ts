import type { CatalogGroup } from "./types";

type Definition = {
  group: CatalogGroup;
  description: string;
  section?: string;
  row?: boolean;
};
export const definitions: Record<string, Definition> = {
  Checkbox: { group: "Forms", description: "Labelled binary and mixed selections." },
  RadioGroup: { group: "Forms", description: "One labelled choice with arrow-key navigation." },
  Select: { group: "Forms", description: "Labelled choices with keyboard navigation." },
  Badge: {
    group: "Feedback",
    description: "Static labels and metadata.",
    section: "Display and layout helpers",
    row: true,
  },
  Button: {
    group: "Actions",
    description: "Actions, variants, and sizes.",
  },
  Callout: {
    group: "Feedback",
    description: "Inline messages and useful next steps.",
    section: "Display and layout helpers",
    row: true,
  },
  Card: {
    group: "Layout",
    description: "Content surfaces with caller-owned navigation.",
    section: "Card and Grid",
  },
  Dialog: {
    group: "Actions",
    description: "Dialogs with managed focus.",
  },
  Grid: {
    group: "Layout",
    description: "Responsive columns and simple stacks.",
    section: "Card and Grid",
  },
  Input: {
    group: "Forms",
    description: "Labelled fields, help text, and validation.",
  },
  Menu: {
    group: "Actions",
    description: "A compact set of overflow actions.",
    section: "Overlays and actions",
    row: true,
  },
  Panel: {
    group: "Layout",
    description: "Structured sections with headers and actions.",
  },
  Progress: {
    group: "Feedback",
    description: "Labelled completion and step counts.",
    section: "Display and layout helpers",
    row: true,
  },
  ScrollArea: {
    group: "Layout",
    description: "Named regions for longer content.",
    section: "Display and layout helpers",
    row: true,
  },
  Stat: {
    group: "Feedback",
    description: "A number with the context it needs.",
    section: "Display and layout helpers",
    row: true,
  },
  Status: {
    group: "Feedback",
    description: "States with visible text and optional icons.",
  },
  Switch: {
    group: "Forms",
    description: "Immediate on/off preferences with native form behavior.",
  },
  Toolbar: {
    group: "Actions",
    description: "Related actions in one keyboard group.",
    section: "Overlays and actions",
    row: true,
  },
  Tooltip: {
    group: "Feedback",
    description: "A little extra context on hover or focus.",
    section: "Overlays and actions",
    row: true,
  },
};
