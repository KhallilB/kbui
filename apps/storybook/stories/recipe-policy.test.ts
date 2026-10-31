import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { recipeDefinitions } from "../catalog/content";

const root = resolve(import.meta.dir, "../../..");
const flows = recipeDefinitions.filter((recipe) => recipe.flow);

test("every flow recipe declares a policy", () => {
  expect(flows.length).toBeGreaterThan(0);
  for (const recipe of flows) expect(recipe.policy, recipe.name).toBeDefined();
});

test("collapseBelow matches the recipe stylesheet", () => {
  for (const recipe of flows) {
    const rem = Number.parseFloat(recipe.policy?.collapseBelow ?? "NaN");
    const sheet = recipe.files.find((file) => file.endsWith(".css"));
    if (!sheet) throw new Error(`${recipe.name} lists no stylesheet`);
    expect(readFileSync(resolve(root, sheet), "utf8"), recipe.name).toContain(
      `@container (max-width: ${(rem - 0.01).toFixed(2)}rem)`,
    );
  }
});
