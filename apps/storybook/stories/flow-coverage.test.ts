import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadCsf } from "storybook/internal/csf-tools";
import { recipeDefinitions } from "../catalog/content";

test("every flow recipe runs its shared flow contract, and only those recipes do", () => {
  const families = new Set(recipeDefinitions.flatMap((recipe) => recipe.flow ?? []));
  expect([...families]).toEqual(["list-detail"]);
  for (const family of families) {
    const folder = new URL(`./${family}-flow/`, import.meta.url);
    const files = readdirSync(folder).filter((name) => name.endsWith(".stories.tsx"));
    const recipes = recipeDefinitions.filter((recipe) => recipe.flow === family);
    expect(files.sort()).toEqual(recipes.map((recipe) => `${recipe.name}.stories.tsx`).sort());
    for (const name of files) {
      const fileName = fileURLToPath(new URL(name, folder));
      const source = readFileSync(fileName, "utf8");
      const csf = loadCsf(source, { fileName, makeTitle: (title) => title }).parse();
      expect(csf.meta.title).toBe(
        `Validation/List-detail flow/${name.replace(".stories.tsx", "")}`,
      );
      expect(csf.stories.length, name).toBeGreaterThan(0);
      // Runtime coverage check; without it a missing rule story goes unnoticed.
      expect(source, name).toMatch(/^complete\(\);$/m);
    }
  }
});
