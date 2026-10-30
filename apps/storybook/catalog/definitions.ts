import type { CatalogGroup } from "./types";

type Definition = {
  group: CatalogGroup;
  description: string;
  examples: Record<string, string>;
};
export const definitions: Record<string, Definition> = {
  Avatar: {
    group: "Media",
    description:
      "Recognizable people and organizations with resilient portraits, initials and five shapes.",
    examples: {
      Default: "Default",
      Initials: "Initials Catalog",
      Shapes: "Shapes",
      Portraits: "Portrait Collection",
      People: "People",
    },
  },
  Image: {
    group: "Media",
    description: "Stable image frames with crop, contain, responsive sources and failure states.",
    examples: {
      Default: "Default",
      CropAndContain: "Crop and Contain",
      Ratios: "Ratios",
      FailureAndRecovery: "Failure and Recovery",
      AssetLibrary: "Editorial Image Library",
    },
  },
  Thumbnail: {
    group: "Media",
    description:
      "Captioned product and attachment previews that compose into responsive galleries.",
    examples: {
      Default: "Default",
      Products: "Products",
      Attachments: "Attachments",
      Gallery: "Gallery",
    },
  },
  CopyableText: {
    group: "Actions",
    description: "Copy identifiers, commands and references with visible feedback and recovery.",
    examples: {
      Default: "Default",
      RichContent: "Text and Links",
      Automatic: "Automatic",
      LongValue: "Long Value",
      Colors: "Colors",
    },
  },
  CodeBlock: {
    group: "Typography",
    description: "Copy exact source from highlighted, numbered or collapsible code listings.",
    examples: {
      Default: "Default",
      Source: "Source",
      Colorful: "Colorful",
      Collapsible: "Collapsible",
      LongCommand: "Long Command",
    },
  },
  Collection: {
    group: "Layout",
    description:
      "Sort, filter, select and page through records with explicit bulk-action contracts.",
    examples: {
      Default: "Default",
      LargeCollection: "Large Collection",
      ServerPagination: "Server Pagination",
      Empty: "Empty",
      BulkFailure: "Bulk Failure",
    },
  },
  DescriptionList: {
    group: "Structured data",
    description: "Scan labeled record details with aligned, responsive key/value presentation.",
    examples: {
      Default: "Default",
      Responsive: "Responsive",
      Nested: "Nested",
    },
  },
  CollectionList: {
    group: "Structured data",
    description: "Scan record collections with native list semantics and shared alignment.",
    examples: {
      Default: "Default",
      Ordered: "Ordered",
      Filterable: "Filterable",
    },
  },
  CollectionRow: {
    group: "Structured data",
    description: "Summarize one record with selection, details, metadata and independent actions.",
    examples: {
      Default: "Default",
      SelectionAndActions: "Selection and Actions",
      LongContent: "Long Content",
    },
  },

  Table: {
    group: "Structured data",
    description: "Present records with sorting, selection, row actions and sticky layouts.",
    examples: {
      Default: "Default",
      SortingAndSelection: "Sorting and Selection",
      DenseSticky: "Dense and Sticky",
    },
  },
  Split: {
    group: "Layout",
    description: "Two columns that stack when their parent narrows.",
    examples: {
      Default: "Default",
      Ratios: "Ratios",
      Responsive: "Responsive",
      Nested: "Nested",
      ContentMeasures: "Content Measures",
    },
  },
  Form: {
    group: "Layout",
    description: "One task with grouped fields, then its one submit action.",
    examples: {
      HotelBooking: "Hotel Booking",
      SignUp: "Sign Up",
    },
  },
  Settings: {
    group: "Layout",
    description: "Sections of fields and managed lists, each saved on its own.",
    examples: {
      Notifications: "Notifications",
      TeamMembers: "Team Members",
    },
  },
  Separator: {
    group: "Layout",
    description: "Semantic or decorative horizontal and vertical rules.",
    examples: { Default: "Default", Vertical: "Vertical", Decorative: "Decorative" },
  },
  Inline: {
    group: "Layout",
    description: "Wrapping rows with shared spacing and alignment.",
    examples: {
      Default: "Default",
      Wrapping: "Wrapping",
      Alignment: "Alignment",
      Gaps: "Gaps",
      List: "List",
    },
  },
  PageHeader: {
    group: "Layout",
    description: "Open a screen with its title, context, state badges and page-level actions.",
    examples: {
      Default: "Default",
      DetailWithStatus: "Detail with Status",
      Breadcrumbs: "Breadcrumbs",
      WithTabs: "With Tabs",
      NarrowWrap: "Narrow Wrap",
    },
  },
  Container: {
    group: "Layout",
    description: "Shared page widths and responsive gutters.",
    examples: { Default: "Default", Sizes: "Sizes", Responsive: "Responsive", Page: "Page" },
  },
  Dashboard: {
    group: "Layout",
    description: "An overview page: header, metrics, then primary and secondary panels.",
    examples: {
      SalesOverview: "Sales Overview",
      MetricsAndPrimary: "Metrics and Primary",
    },
  },
  Checkbox: {
    group: "Forms",
    description: "Let people select options independently, including a mixed selection.",
    examples: { Default: "Default", Mixed: "Mixed", Disabled: "Disabled", Invalid: "Invalid" },
  },
  RadioGroup: {
    group: "Forms",
    description: "Choose one option from a visible group.",
    examples: {
      Default: "Default",
      Segmented: "Segmented",
      Disabled: "Disabled",
      Invalid: "Invalid",
    },
  },
  Select: {
    group: "Forms",
    description: "Choose one option from a dropdown list.",
    examples: { Default: "Default", Invalid: "Invalid", Disabled: "Disabled" },
  },
  Combobox: {
    group: "Forms",
    description: "Search and choose one or multiple options from a longer list.",
    examples: {
      Default: "Default",
      Multiple: "Multiple selections",
      Invalid: "Invalid",
      Empty: "Empty",
      Disabled: "Disabled",
    },
  },
  MultiSelect: {
    group: "Forms",
    description: "Search a list and keep multiple selections visible as removable chips.",
    examples: {
      Default: "Default",
      ManySelections: "Many Selections",
      Invalid: "Invalid",
      Empty: "Empty",
      Disabled: "Disabled",
    },
  },
  Badge: {
    group: "Feedback",
    description: "Add a short label, category, or piece of metadata.",
    examples: { Default: "Default", Tones: "Colors", PlainMonoPreserveCase: "Identifiers" },
  },
  Button: {
    group: "Actions",
    description: "Trigger an action or link to another page.",
    examples: {
      Primary: "Primary",
      Secondary: "Secondary",
      Ghost: "Ghost",
      Danger: "Danger",
      Disabled: "Disabled",
    },
  },
  Toast: {
    group: "Feedback",
    description: "Manage temporary notifications with announcements and timed dismissal.",
    examples: {
      Default: "Default",
      Queue: "Queue",
      Tones: "Colors",
      WithAction: "Undo action",
      Timed: "Timed dismissal",
    },
  },
  Callout: {
    group: "Feedback",
    description: "Highlight a message and offer a useful next step.",
    examples: { Default: "Default", WithActions: "With Actions", Tones: "Colors" },
  },
  Card: {
    group: "Layout",
    description: "Group related content, with room for links and actions.",
    examples: { Default: "Default", Plain: "Plain", SingleLink: "Single Link" },
  },
  Code: {
    group: "Typography",
    description: "Literal inline code and syntax-highlighted multiline code blocks.",
    examples: {
      Default: "Default",
      Multiline: "Multiline",
      LineNumbersAndHighlights: "Line Numbers",
      Collapsible: "Collapsible",
      InText: "In Text",
    },
  },
  Popover: {
    group: "Actions",
    description: "Reveal supporting controls in an anchored, dismissible popup.",
    examples: {
      Default: "Default",
      Controlled: "Controlled",
      ScopedPortal: "Nested Theme",
      InsideDialog: "Inside Dialog",
      Scrolling: "Scrolling",
    },
  },
  Disclosure: {
    group: "Layout",
    description: "Reveal supporting details or controls within the page.",
    examples: {
      Default: "Default",
      RetainedDraft: "Retained Draft",
      Controlled: "Controlled",
      Disabled: "Disabled",
    },
  },
  Accordion: {
    group: "Layout",
    description: "Organize related disclosures under descriptive headings.",
    examples: {
      Default: "Default",
      Multiple: "Multiple",
      Controlled: "Controlled",
      Disabled: "Disabled",
      Nested: "Nested",
    },
  },
  Dialog: {
    group: "Actions",
    description: "Keep a focused task in a dialog while the page waits behind it.",
    examples: {
      Confirm: "Confirm",
      Drawer: "Drawer",
      ConfirmationRecovery: "Confirmation Recovery",
      CustomLayout: "Custom Layout",
      Sections: "Sections",
    },
  },
  ConfirmAction: {
    group: "Actions",
    description: "Put a destructive action behind one confirmation that closes only after success.",
    examples: {
      Default: "Default",
      FailureAndRetry: "Failure and Retry",
      RowAction: "Row Action",
    },
  },
  FileInput: {
    group: "Forms",
    description: "Choose files, review the list, and remove individual items.",
    examples: {
      Default: "Default",
      Empty: "Empty",
      Rejected: "Rejected",
      Disabled: "Disabled",
      CustomContent: "Custom Content",
    },
  },
  Grid: {
    group: "Layout",
    description: "Arrange content in responsive columns or a single stack.",
    examples: {
      Default: "Default",
      Columns: "Columns",
      ColumnWidths: "Column Widths",
      GapsAndAlignment: "Gaps and Alignment",
      StackedList: "Stacked List",
    },
  },
  Heading: {
    group: "Typography",
    description: "Native heading hierarchy with independent visual sizing.",
    examples: { Default: "Default", Hierarchy: "Hierarchy", Article: "Article" },
  },
  Input: {
    group: "Forms",
    description: "Collect text with a clear label, help text, and error feedback.",
    examples: {
      Default: "Default",
      WithDescription: "With Description",
      WithError: "With Error",
      Disabled: "Disabled",
      WithIconsAndActions: "Icons and actions",
    },
  },
  Link: {
    group: "Typography",
    description: "Recognizable navigation with visible keyboard focus.",
    examples: { Default: "Default", InText: "In Text" },
  },
  Menu: {
    group: "Actions",
    description: "Keep related actions in a compact popup menu.",
    examples: { Default: "Default" },
  },
  NumberField: {
    group: "Forms",
    description: "Enter a number by typing or using step buttons.",
    examples: {
      Default: "Default",
      Bounds: "Bounds",
      Fractional: "Fractional",
      Invalid: "Invalid",
    },
  },
  Panel: {
    group: "Layout",
    description: "Organize a section with a header, content, and actions.",
    examples: {
      Default: "Default",
      Depth: "Depth",
      Compact: "Compact",
      Collapsible: "Collapsible",
      Group: "Group",
    },
  },
  Progress: {
    group: "Feedback",
    description: "Show how much of a task is complete.",
    examples: { Default: "Default", Steps: "Steps", Complete: "Complete" },
  },
  ScrollArea: {
    group: "Layout",
    description: "Keep longer content in a scrollable, keyboard-accessible region.",
    examples: { Default: "Default" },
  },
  Stat: {
    group: "Feedback",
    description: "Show a number alongside the label that explains it.",
    examples: { Default: "Default", Display: "Display", Row: "Row" },
  },
  Status: {
    group: "Feedback",
    description: "Describe a current state with text and an optional icon.",
    examples: { Default: "Default", Tones: "Tones", Chip: "Chip", Live: "Live" },
  },
  Switch: {
    group: "Forms",
    description: "Turn an immediate preference on or off.",
    examples: {
      Default: "Default",
      WithIcons: "With Icons",
      WithDescription: "With Description",
      WithError: "With Error",
      Disabled: "Disabled",
    },
  },
  Text: {
    group: "Typography",
    description: "Readable paragraphs, inline text and supporting content.",
    examples: { Default: "Default", SizesAndTones: "Sizes and tones", Inline: "Inline" },
  },
  Textarea: {
    group: "Forms",
    description: "Collect multiline text with a label, help text, and error feedback.",
    examples: {
      Default: "Default",
      WithDescription: "With Description",
      WithError: "With Error",
      Disabled: "Disabled",
      ReadOnly: "Read Only",
    },
  },
  Fieldset: {
    group: "Forms",
    description: "Group related fields with a native fieldset, legend, and section help.",
    examples: {
      Default: "Default",
      WithError: "With Error",
      Disabled: "Disabled",
    },
  },
  FormActions: {
    group: "Forms",
    description: "Align submit, reset, and secondary actions at the end of a form.",
    examples: {
      Default: "Default",
      WithDivider: "With Divider",
      SplitAlignment: "Split Alignment",
    },
  },
  FormSection: {
    group: "Forms",
    description: "A headed group of related fields with its error and actions.",
    examples: {
      Default: "Default",
      SplitLayout: "Split Layout",
      SectionError: "Section Error",
      PendingSave: "Pending Save",
    },
  },
  ErrorSummary: {
    group: "Forms",
    description: "Summarize form validation errors with links that focus each field.",
    examples: {
      Default: "Default",
      FormRecovery: "Form Recovery",
    },
  },
  EmptyState: {
    group: "Feedback",
    description: "Explain why a collection or section is empty and offer the next action.",
    examples: {
      Default: "Default",
      FilteredZeroResults: "Zero Results",
      RecoverableFailure: "Recoverable Failure",
      VariantsAndSizes: "Variants",
    },
  },
  Skeleton: {
    group: "Feedback",
    description: "Reserve incoming content geometry while a section loads.",
    examples: {
      Default: "Default",
      WaveAndPulse: "Wave and Pulse",
      CardPlaceholder: "Card Placeholder",
      ShapesAndSizes: "Shapes and Sizes",
      ContentTransition: "Content Transition",
    },
  },
  Spinner: {
    group: "Feedback",
    description: "Indicate an indeterminate wait or busy control.",
    examples: {
      Default: "Default",
      FancyVariants: "Fancy Variants",
      WithVisibleLabel: "Visible Label",
      BusyButton: "Busy Button",
      SizesAndTones: "Sizes and Tones",
    },
  },
  Tabs: {
    group: "Navigation",
    description:
      "Switch between peer sections with arrow-key roving focus and an active indicator.",
    examples: {
      Default: "Default",
      Pill: "Pill",
      Vertical: "Vertical",
      RetainedDraft: "Retained Draft",
      Nested: "Nested",
    },
  },
  Toolbar: {
    group: "Actions",
    description: "Group related actions with arrow-key navigation.",
    examples: { Default: "Default" },
  },
  Tooltip: {
    group: "Feedback",
    description: "Add brief context on hover or keyboard focus.",
    examples: { OnHover: "On Hover" },
  },
};
