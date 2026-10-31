import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { loadCatalogSources, loadComponentReferences } from "../catalog/source";

const preservedRecipes = [
  {
    name: "Inbox",
    defaultStoryId: "recipes-inbox--correspondence",
    docsId: "recipes-inbox--docs",
    stories: [
      "recipes-inbox--correspondence",
      "recipes-inbox--reply-and-drafts",
      "recipes-inbox--delivery-recovery",
      "recipes-inbox--filter-and-history",
      "recipes-inbox--missing-message",
      "recipes-inbox--empty-inbox",
      "recipes-inbox--long-letter",
      "recipes-inbox--pending-delivery",
      "recipes-inbox--client-validation-blocks-commit",
      "recipes-inbox--server-errors-act-like-validation",
      "recipes-inbox--commit-rejection-shows-visible-error",
      "recipes-inbox--commit-success-applies-and-clears",
      "recipes-inbox--success-after-leaving-keeps-focus",
      "recipes-inbox--failure-after-leaving-keeps-draft-and-error",
      "recipes-inbox--echo-after-failed-commit-keeps-draft",
      "recipes-inbox--unrendered-field-error-focuses-submit",
      "recipes-inbox--copy-replaces-strings",
    ],
    files: [
      "apps/storybook/recipes/Inbox.tsx",
      "apps/storybook/recipes/flow-router.ts",
      "apps/storybook/recipes/inbox.css",
    ],
  },
  {
    name: "ListDetail",
    defaultStoryId: "recipes-listdetail--request-queue",
    docsId: "recipes-listdetail--docs",
    stories: [
      "recipes-listdetail--request-queue",
      "recipes-listdetail--edit-and-validate",
      "recipes-listdetail--retained-draft",
      "recipes-listdetail--search-and-recovery",
      "recipes-listdetail--unavailable-request",
      "recipes-listdetail--empty-queue",
      "recipes-listdetail--long-content",
      "recipes-listdetail--client-validation-blocks-commit",
      "recipes-listdetail--server-errors-act-like-validation",
      "recipes-listdetail--commit-rejection-shows-visible-error",
      "recipes-listdetail--commit-success-applies-and-clears",
      "recipes-listdetail--success-after-leaving-keeps-focus",
      "recipes-listdetail--failure-after-leaving-keeps-draft-and-error",
      "recipes-listdetail--echo-after-failed-commit-keeps-draft",
      "recipes-listdetail--unrendered-field-error-focuses-submit",
      "recipes-listdetail--copy-replaces-strings",
    ],
    files: [
      "apps/storybook/recipes/ListDetail.tsx",
      "apps/storybook/recipes/flow-router.ts",
      "apps/storybook/recipes/list-detail.css",
    ],
  },
];

test("reconciliation retains every current recipe source set and public story ID", async () => {
  for (const recipe of preservedRecipes)
    for (const file of recipe.files)
      expect(existsSync(new URL(`../../../${file}`, import.meta.url)), file).toBe(true);
  const { loadRecipeSources } = await import("../catalog/recipes");
  const recipes = loadRecipeSources();
  expect(
    recipes
      .map(({ name, defaultStoryId, docsId, stories, files }) => ({
        name,
        defaultStoryId,
        docsId,
        stories: stories.map((story) => story.id),
        files: files.map((file) => file.path),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  ).toEqual([...preservedRecipes].sort((a, b) => a.name.localeCompare(b.name)));
});

test("recipe restoration preserves all 63 component families and curated reference coverage", () => {
  const catalog = loadCatalogSources();
  const references = loadComponentReferences();
  expect(catalog).toHaveLength(63);
  for (const name of [
    "Combobox",
    "MultiSelect",
    "Textarea",
    "Fieldset",
    "FormActions",
    "ErrorSummary",
  ])
    expect(
      catalog.some((entry) => entry.name === name),
      name,
    ).toBe(true);
  for (const entry of catalog) {
    expect(entry.examples?.length, entry.name).toBeGreaterThan(0);
    expect(references, entry.name).toHaveProperty(entry.name);
  }
});
