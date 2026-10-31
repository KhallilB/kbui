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
    files: ["apps/storybook/recipes/ListDetail.tsx", "apps/storybook/recipes/list-detail.css"],
    flow: "list-detail",
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
    ],
    files: ["apps/storybook/recipes/Inbox.tsx", "apps/storybook/recipes/inbox.css"],
    flow: "list-detail",
  },
];

/** Retired recipe id → package component id; old recipe URLs redirect there. */
export const retiredRecipes: Record<string, string> = {
  pageheader: "pageheader",
  formsection: "formsection",
};

export const systemGuide = "docs/guides/components-and-recipes.md";
