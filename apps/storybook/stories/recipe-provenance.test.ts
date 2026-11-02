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

test("each recipe source file starts with a provenance header", () => {
  const files = [...new Set(recipeDefinitions.flatMap((recipe) => recipe.files))];
  for (const file of files) {
    const owners = recipeDefinitions.filter((recipe) => recipe.files.includes(file));
    // A shared file links the recipe index rather than one owner's guide.
    const guide =
      owners.length === 1
        ? `https://kbui.kcb.pro/recipes/?recipe=${owners[0]?.id}`
        : "https://kbui.kcb.pro/recipes/";
    const lines = [
      "x-release-please-start-version",
      `kbui recipe ${owners.map((recipe) => recipe.name).join(", ")} · from kbui ${version} · ${guide}`,
      "x-release-please-end",
    ];
    const comment = file.endsWith(".css")
      ? (line: string) => `/* ${line} */`
      : (line: string) => `// ${line}`;
    const header = readFileSync(resolve(root, file), "utf8").split("\n").slice(0, 3);
    // The block lets release-please bump the version with the release.
    expect(header, file).toEqual(lines.map(comment));
    expect(versioned.has(file), `${file} is not in release-please extra-files`).toBe(true);
  }
});
