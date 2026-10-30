export type RecipeDefinition = {
  id: string;
  name: string;
  description: string;
  guide: string;
  storyFile: string;
  defaultStoryId: string;
  components: string[];
  files: string[];
};

export const recipeDefinitions: RecipeDefinition[] = [
  {
    id: "pageheader",
    name: "PageHeader",
    description: "A page introduction with a title, description, metadata and actions.",
    guide: "docs/guides/page-header.md",
    storyFile: "apps/storybook/recipes/PageHeader.stories.tsx",
    defaultStoryId: "recipes-pageheader--project-list",
    components: ["Heading", "Text", "Inline", "Toolbar", "Button"],
    files: ["apps/storybook/recipes/PageHeader.tsx", "apps/storybook/recipes/recipes.css"],
  },
  {
    id: "formsection",
    name: "FormSection",
    description: "Related fields with a visible heading, instructions and section errors.",
    guide: "docs/guides/form-section.md",
    storyFile: "apps/storybook/recipes/FormSection.stories.tsx",
    defaultStoryId: "recipes-formsection--contact-details",
    components: ["Heading", "Text", "Grid", "Input", "Panel"],
    files: ["apps/storybook/recipes/FormSection.tsx", "apps/storybook/recipes/recipes.css"],
  },
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
  },
];

export const systemGuide = "docs/guides/components-and-recipes.md";
