export type AdoptionRelationship =
  | { status: "pending"; destination: string }
  | {
      status: "adopted";
      source: string;
      purpose: string;
      proof: { file: string; exportName: string };
    };

const pending = (destination: string): AdoptionRelationship => ({ status: "pending", destination });
const composed = (
  source: string,
  file: string,
  exportName: string,
  purpose: string,
): AdoptionRelationship => ({
  status: "adopted",
  source: `apps/storybook/${source}`,
  purpose,
  proof: { file: `apps/storybook/${file}`, exportName },
});
const request = (purpose: string, story = "RequestQueue") =>
  composed("recipes/ListDetail.tsx", "recipes/ListDetail.stories.tsx", story, purpose);
const planner = (purpose: string, story = "PickAPlan") =>
  composed("site/PlanDemo.tsx", "stories/PlanDemo.stories.tsx", story, purpose);
const frame = (purpose: string) =>
  composed(
    "site/SiteFrame.tsx",
    "stories/SiteFrame.stories.tsx",
    "StructureAndThemeLinks",
    purpose,
  );

// Authored relationships only; catalog owns family names, references and examples.
export const adoptionRelationships: Record<string, AdoptionRelationship> = {
  Accordion: pending("Settings help and expandable example details"),
  Avatar: pending("Correspondence identity and discoverable people composition"),
  Badge: pending("Recipe and workspace metadata with focused composition proof"),
  Button: planner("Planner actions and activity selection"),
  Callout: pending(
    "Connect existing SettingsScreen/OperationsScreen recovery feedback to focused proof",
  ),
  Card: planner("Planner task surface with stateful activity choices"),
  Checkbox: planner("Activity selection updates progress and summary"),
  Code: composed(
    "site/GuideContent.tsx",
    "stories/GuideContent.stories.tsx",
    "InlineAndFences",
    "Guide literals use inline Code while fenced source retains text, links and keyboard access",
  ),
  CodeBlock: composed(
    "site/CodePanel.tsx",
    "stories/CodePanel.stories.tsx",
    "LanguagesAndClipboard",
    "Read-only source retains supplied grammar tokens, exact clipboard text and recovery",
  ),
  Collection: pending("Searchable request workspace with bulk-action recovery"),
  CollectionList: pending("Workspace results with empty and error states"),
  CollectionRow: pending("Request rows with independent selection and actions"),
  Combobox: pending("Request intake owner selection"),
  ConfirmAction: pending("Destructive workspace action with cancel and error recovery"),
  Container: frame("Shared site header and footer boundaries with one gutter owner"),
  CopyableText: pending("Request identifiers and setup values with clipboard recovery"),
  Dashboard: pending("Discoverable sales and operations composition"),
  DescriptionList: pending("Request facts and sender metadata"),
  Dialog: planner("Planner note editing with save and dismissal", "NoteToYourself"),
  Disclosure: pending("Optional workspace details with keyboard and focus behavior"),
  EmptyState: pending("Request search with no-results and empty outcomes"),
  ErrorSummary: pending("Settings and request intake submission errors"),
  Fieldset: pending("Settings and request intake field groups"),
  FileInput: pending("Request intake supporting attachments"),
  Form: pending("Request intake task with validation and submission recovery"),
  FormActions: pending("Settings and request intake submit and cancel actions"),
  FormSection: request("Packaged edit form groups", "EditAndValidate"),
  Gallery: pending("Discoverable product catalog composition"),
  Grid: request("Request fields and record layout"),
  Heading: composed(
    "site/Home.tsx",
    "stories/Home.stories.tsx",
    "Navigation",
    "Landing heading ranks retain native navigation and content landmarks",
  ),
  Image: pending("Discoverable media composition that renders Image itself"),
  Inline: frame("Wrapping navigation and footer actions"),
  Input: planner("Planner rename field with retained value", "Rename"),
  Link: frame("Native site links retain theme, query, hash and caller props"),
  Menu: pending("Contextual workspace actions"),
  MultiSelect: pending("Request intake optional reviewers"),
  NumberField: pending("Request intake quantity"),
  PageHeader: request("Packaged request title and state"),
  Panel: request("Request queue, detail and supporting regions"),
  Popover: pending("Supporting workspace context with focus return"),
  Progress: planner("Activity completion progress"),
  RadioGroup: composed(
    "site/Catalog.tsx",
    "stories/CatalogDetails.stories.tsx",
    "RadioGroupToneControl",
    "Example-state selection retains choice while changing tone",
  ),
  ScrollArea: pending("Workspace activity and log region"),
  Select: request("Request status choice in edit form", "EditAndValidate"),
  Separator: pending("Passive workspace region divisions"),
  Settings: pending("Discoverable notification and team-settings composition"),
  Skeleton: pending("Workspace loading state matching final geometry"),
  Spinner: pending("Pending request action with stable label and status"),
  Split: request("Request queue and detail columns"),
  Stack: pending("Shared prose and request intake vertical groups"),
  Stat: pending(
    "Connect existing OperationsScreen summaries to discoverable composition and focused proof",
  ),
  StatsRow: pending("Operations and workspace totals"),
  Status: request("Request state announcements"),
  SupportingPane: pending("Workspace context retaining original ListDetail semantics"),
  Switch: composed(
    "site/ThemeToggle.tsx",
    "stories/ThemeToggle.stories.tsx",
    "Default",
    "Site theme preference with pointer and keyboard controls",
  ),
  Table: pending("Discoverable sorting, selection and row-action example"),
  Tabs: pending("Workspace views with keyboard navigation"),
  Text: composed(
    "site/Home.tsx",
    "stories/Home.stories.tsx",
    "TryTheDemo",
    "Landing prose retains motion order and planner context",
  ),
  Textarea: pending(
    "Packaged reply and request description fields; Inbox currently uses native textarea",
  ),
  Thumbnail: pending("Discoverable product and collection media"),
  Toast: pending("Local action outcome with persistent error recovery"),
  Toolbar: composed(
    "recipes/PageHeader.stories.tsx",
    "recipes/PageHeader.stories.tsx",
    "RecordDetail",
    "Audit actions in the copied PageHeader recipe with roving keyboard focus",
  ),
  Tooltip: composed(
    "site/Catalog.tsx",
    "stories/CatalogDetails.stories.tsx",
    "WindowControls",
    "Names for compact preview actions",
  ),
};
