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
    components: ["Heading", "Text", "Grid", "Input", "Panel"],
    files: ["apps/storybook/recipes/FormSection.tsx", "apps/storybook/recipes/recipes.css"],
  },
];

export const systemGuide = "docs/guides/components-and-recipes.md";
