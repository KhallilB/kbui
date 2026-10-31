import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { recipeDefinitions } from "../catalog/content";

const root = resolve(import.meta.dir, "../../..");
const { version } = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const config = JSON.parse(readFileSync(resolve(root, "release-please-config.json"), "utf8"));
const versioned = new Set(
  config.packages["."]["extra-files"]
    .filter((file: { type: string }) => file.type === "generic")
    .map((file: { path: string }) => file.path),
);

test("each recipe starts with a provenance header", () => {
  for (const recipe of recipeDefinitions)
    for (const file of recipe.files.filter((path) => path.endsWith(".tsx"))) {
      const header = readFileSync(resolve(root, file), "utf8").split("\n").slice(0, 3);
      // The block lets release-please bump the version with the release.
      expect(header, file).toEqual([
        "// x-release-please-start-version",
        `// kbui recipe ${recipe.name} · from kbui ${version} · https://kbui.kcb.pro/recipes/?recipe=${recipe.id}`,
        "// x-release-please-end",
      ]);
      expect(versioned.has(file), `${file} is not in release-please extra-files`).toBe(true);
    }
});
