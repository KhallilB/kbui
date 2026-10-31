/** Task policy; a documented constant in the copied source, not a prop. */
export type RecipePolicy = {
  /** Container width below which list and detail stop sharing the row. */
  collapseBelow: `${number}rem`;
  /** Whether the context aside shows when a record first opens. */
  context: "open" | "closed";
  /** Whether a commit edits the record or appends to it. */
  commit: "edit" | "append";
};

export type RecipeDefinition = {
  id: string;
  name: string;
  description: string;
  guide: string;
  storyFile: string;
  defaultStoryId: string;
  components: string[];
  files: string[];
  /** Shared flow contract the recipe must pass, in `stories/<flow>-flow/`. */
  flow?: "list-detail" | undefined;
  policy?: RecipePolicy | undefined;
};

export const recipeDefinitions: RecipeDefinition[] = [
  {
    id: "listdetail",
    name: "ListDetail",
    description:
      "An operations queue with record details, supporting context and a validated edit form.",
    guide: "docs/guides/list-detail.md",
    storyFile: "apps/storybook/recipes/ListDetail.stories.tsx",
    defaultStoryId: "recipes-listdetail--request-queue",
    components: [
      "Container",
      "Grid",
      "Heading",
      "Text",
      "Inline",
      "Split",
      "Panel",
      "Button",
      "Status",
      "Input",
      "Select",
      "PageHeader",
      "FormSection",
    ],
    files: [
      "apps/storybook/recipes/ListDetail.tsx",
      "apps/storybook/recipes/flow-router.ts",
      "apps/storybook/recipes/list-detail.css",
    ],
    flow: "list-detail",
    policy: { collapseBelow: "48rem", context: "open", commit: "edit" },
  },
  {
    id: "inbox",
    name: "Inbox",
    description: "Read messages, write replies and check sender details.",
    guide: "docs/guides/inbox.md",
    storyFile: "apps/storybook/recipes/Inbox.stories.tsx",
    defaultStoryId: "recipes-inbox--correspondence",
    components: [
      "Button",
      "Container",
      "Grid",
      "Heading",
      "Inline",
      "Input",
      "PageHeader",
      "Panel",
      "Split",
      "Text",
      "Textarea",
    ],
    files: [
      "apps/storybook/recipes/Inbox.tsx",
      "apps/storybook/recipes/flow-router.ts",
      "apps/storybook/recipes/inbox.css",
    ],
    flow: "list-detail",
    policy: { collapseBelow: "42rem", context: "closed", commit: "append" },
  },
  {
    id: "pageheader",
    name: "PageHeader",
    description: "A page title with supporting text and actions.",
    guide: "docs/guides/page-header.md",
    storyFile: "apps/storybook/recipes/PageHeader.stories.tsx",
    defaultStoryId: "recipes-pageheader--project-list",
    components: ["Heading", "Text", "Inline", "Toolbar", "Button"],
    files: ["apps/storybook/recipes/PageHeader.tsx", "apps/storybook/recipes/recipes.css"],
  },
  {
    id: "formsection",
    name: "FormSection",
    description: "A heading, instructions and errors for related form fields.",
    guide: "docs/guides/form-section.md",
    storyFile: "apps/storybook/recipes/FormSection.stories.tsx",
    defaultStoryId: "recipes-formsection--contact-details",
    components: ["Heading", "Text", "Grid", "Input", "Panel", "Fieldset"],
    files: ["apps/storybook/recipes/FormSection.tsx", "apps/storybook/recipes/recipes.css"],
  },
];

/** Retired recipe id → package component id; old recipe URLs redirect there. */
export const retiredRecipes: Record<string, string> = {};

export const systemGuide = "docs/guides/components-and-recipes.md";
