import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { recipeDefinitions } from "../catalog/content";
import { loadRecipeSources } from "../catalog/recipes";
import { loadCatalogSources } from "../catalog/source";

const root = resolve(import.meta.dir, "../../..");

test("recipes expose exact copyable files and stable public previews, separately from components", () => {
  const recipes = loadRecipeSources();
  expect(recipes.map((recipe) => recipe.name)).toEqual(
    expect.arrayContaining(["ListDetail", "Inbox"]),
  );
  for (const recipe of recipes) {
    expect(recipe.kind).toBe("recipe");
    const component = loadCatalogSources().find((entry) => entry.name === recipe.name);
    if (component) expect(component.docsId).not.toBe(recipe.docsId);
    expect(recipe.docsId).toBe(`recipes-${recipe.id}--docs`);
    expect(recipe.stories.map((story) => story.id)).toContain(recipe.defaultStoryId);
    expect(recipe.markdown).toBe(readFileSync(resolve(root, recipe.guide), "utf8"));
    for (const file of recipe.files) {
      expect(file.sample.code).toBe(readFileSync(resolve(root, file.path), "utf8"));
      expect(file.sample.snippet).toBe(file.sample.code);
    }
  }
  expect(recipes[0]?.defaultStoryId).toBe("recipes-listdetail--request-queue");
  expect(recipes[1]?.defaultStoryId).toBe("recipes-inbox--correspondence");
});

test("recipe loading rejects unknown component dependencies and missing source targets", () => {
  const definition = recipeDefinitions[0];
  if (!definition) throw new Error("Missing fixture recipe");
  expect(() => loadRecipeSources(root, [{ ...definition, components: ["MissingWidget"] }])).toThrow(
    "Unknown recipe component: MissingWidget",
  );
  expect(() =>
    loadRecipeSources(root, [{ ...definition, guide: "docs/guides/missing.md" }]),
  ).toThrow();
  expect(() => loadRecipeSources(root, [{ ...definition, files: ["missing.tsx"] }])).toThrow();
  expect(() =>
    loadRecipeSources(root, [{ ...definition, files: ["apps/storybook/recipes/ListDetail.tsx"] }]),
  ).toThrow("Missing recipe source dependency");
  expect(() =>
    loadRecipeSources(root, [{ ...definition, defaultStoryId: "recipes-listdetail--missing" }]),
  ).toThrow("Missing default recipe story");
});
