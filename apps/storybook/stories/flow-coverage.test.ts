import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadCsf } from "storybook/internal/csf-tools";
import { checkRecipeKind, recipeDefinitions } from "../catalog/content";

test("every recipe declares a flow family or explicit composition status", () => {
  for (const recipe of recipeDefinitions) {
    expect(() => checkRecipeKind(recipe), recipe.name).not.toThrow();
  }
  const base = recipeDefinitions[0];
  if (!base) throw new Error("Missing fixture recipe");
  const { flow: _flow, ...unclassified } = base;
  expect(() => checkRecipeKind({ ...unclassified, id: "intake", name: "RequestIntake" })).toThrow(
    "RequestIntake must declare flow or composition: true",
  );
  expect(() =>
    checkRecipeKind({ ...unclassified, id: "intake", name: "RequestIntake", composition: true }),
  ).toThrow("Only PageHeader and FormSection may set composition: true");
  expect(() => checkRecipeKind({ ...base, name: "PageHeader", composition: true })).toThrow(
    "PageHeader cannot set both flow and composition: true",
  );
});

test("every flow recipe runs its shared flow contract, and only those recipes do", () => {
  const families = new Set(recipeDefinitions.flatMap((recipe) => recipe.flow ?? []));
  expect(families.size).toBeGreaterThan(0);
  for (const family of families) {
    const folder = new URL(`./${family}-flow/`, import.meta.url);
    const files = readdirSync(folder).filter((name) => name.endsWith(".stories.tsx"));
    const recipes = recipeDefinitions.filter((recipe) => recipe.flow === family);
    const familyLabel = `${family[0]?.toUpperCase() ?? ""}${family.slice(1)} flow`;
    expect(files.sort()).toEqual(recipes.map((recipe) => `${recipe.name}.stories.tsx`).sort());
    for (const name of files) {
      const fileName = fileURLToPath(new URL(name, folder));
      const source = readFileSync(fileName, "utf8");
      const csf = loadCsf(source, { fileName, makeTitle: (title) => title }).parse();
      expect(csf.meta.title).toBe(`Validation/${familyLabel}/${name.replace(".stories.tsx", "")}`);
      expect(csf.stories.length, name).toBeGreaterThan(0);
      // Runtime coverage check; without it a missing rule story goes unnoticed.
      expect(source, name).toMatch(/^complete\(\);$/m);
    }
  }
});
