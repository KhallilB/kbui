export type ComponentStyleAnatomy = Readonly<{
  selector: string;
  member?: string;
  slot?: string;
}>;

// Public customization and live DOM target share one declared anatomy.
const anatomy: Record<string, ComponentStyleAnatomy> = {
  Accordion: { selector: ".kb-accordion" },
  Avatar: { selector: ".kb-avatar" },
  Badge: { selector: ".kb-badge" },
  Button: { selector: ".kb-button" },
  Callout: { selector: ".kb-callout" },
  Card: { selector: ".kb-card" },
  Checkbox: { selector: ".kb-checkbox-mark", slot: "mark" },
  Code: { selector: ".kb-code" },
  CodeBlock: { selector: ".kb-codeblock" },
  Collection: { selector: ".kb-collection" },
  CollectionList: { selector: ".kb-collectionlist" },
  CollectionRow: { selector: ".kb-collectionrow" },
  Combobox: { selector: ".kb-combobox-shell, .kb-multiselect-shell", slot: "shell" },
  ConfirmAction: { selector: ".kb-confirmaction", slot: "popup" },
  Container: { selector: ".kb-container" },
  CopyableText: { selector: ".kb-copyabletext" },
  Dashboard: { selector: ".kb-dashboard" },
  DescriptionList: { selector: ".kb-descriptionlist" },
  Dialog: { selector: ".kb-dialog-popup", member: "Content" },
  Disclosure: { selector: ".kb-disclosure" },
  EmptyState: { selector: ".kb-emptystate" },
  ErrorSummary: { selector: ".kb-errorsummary" },
  Fieldset: { selector: ".kb-fieldset" },
  FileInput: { selector: ".kb-fileinput-trigger", slot: "trigger" },
  Form: { selector: ".kb-form" },
  FormActions: { selector: ".kb-formactions" },
  FormSection: { selector: ".kb-formsection" },
  Gallery: { selector: ".kb-gallery" },
  Grid: { selector: ".kb-grid" },
  Heading: { selector: ".kb-heading" },
  Image: { selector: ".kb-image" },
  Inline: { selector: ".kb-inline" },
  Input: { selector: ".kb-input-control", slot: "control" },
  Link: { selector: ".kb-link" },
  Menu: { selector: ".kb-menu", member: "Content" },
  MultiSelect: { selector: ".kb-multiselect-shell", slot: "shell" },
  NumberField: { selector: ".kb-numberfield-group", slot: "group" },
  PageHeader: { selector: ".kb-pageheader" },
  Panel: { selector: ".kb-panel" },
  Popover: { selector: ".kb-popover", member: "Content" },
  Progress: { selector: ".kb-progress-indicator", slot: "indicator" },
  RadioGroup: { selector: ".kb-radiogroup-control", member: "Item", slot: "control" },
  ScrollArea: { selector: ".kb-scrollarea-thumb", slot: "thumb" },
  Select: { selector: ".kb-select-control", slot: "control" },
  Separator: { selector: ".kb-separator" },
  Settings: { selector: ".kb-settings" },
  Skeleton: { selector: ".kb-skeleton" },
  Spinner: { selector: ".kb-spinner" },
  Split: { selector: ".kb-split" },
  Stack: { selector: ".kb-stack" },
  Stat: { selector: ".kb-stat-value", slot: "value" },
  StatsRow: { selector: ".kb-statsrow" },
  Status: { selector: ".kb-status" },
  SupportingPane: { selector: ".kb-supportingpane" },
  Switch: { selector: ".kb-switch-track", slot: "track" },
  Table: { selector: ".kb-table" },
  Tabs: { selector: ".kb-tabs" },
  Text: { selector: ".kb-text" },
  Textarea: { selector: ".kb-textarea-control", slot: "control" },
  Thumbnail: { selector: ".kb-thumbnail" },
  Toast: { selector: ".kb-toast" },
  Toolbar: { selector: ".kb-toolbar" },
  Tooltip: { selector: ".kb-tooltip" },
};

export function componentStyleAnatomy(name: string): ComponentStyleAnatomy {
  const target = Object.hasOwn(anatomy, name) ? anatomy[name] : undefined;
  if (!target) throw new Error(`Missing styling anatomy: ${name}`);
  return target;
}
