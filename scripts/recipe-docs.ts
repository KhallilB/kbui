import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { recipeDefinitions } from "../apps/storybook/catalog/content";
import { applyBlocks } from "../apps/storybook/catalog/recipe-docs";

// Rewrites the generated blocks in every recipe guide; recipe-docs.test.ts fails when one is stale.
const root = join(import.meta.dir, "..");
for (const recipe of recipeDefinitions) {
  const path = join(root, recipe.guide);
  const markdown = await readFile(path, "utf8");
  const next = applyBlocks(markdown, recipe);
  if (next === markdown) continue;
  await writeFile(path, next);
  console.log(`updated ${recipe.guide}`);
}
