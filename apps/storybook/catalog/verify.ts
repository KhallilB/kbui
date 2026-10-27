import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadCatalogSources } from "./source.ts";

const indexPath = fileURLToPath(new URL("../dist/storybook/index.json", import.meta.url));
const index: unknown = JSON.parse(readFileSync(indexPath, "utf8"));
if (
  !index ||
  typeof index !== "object" ||
  !("entries" in index) ||
  !index.entries ||
  typeof index.entries !== "object"
) {
  throw new Error("Missing built Storybook entries");
}
for (const entry of Object.values(index.entries)) {
  if (!entry || typeof entry !== "object") throw new Error("Invalid public Storybook entry");
  if (
    ("importPath" in entry &&
      typeof entry.importPath === "string" &&
      entry.importPath.startsWith("./stories/")) ||
    ("title" in entry &&
      typeof entry.title === "string" &&
      /^(Site|Showcase|Validation)\//.test(entry.title))
  )
    throw new Error("Internal story leaked into public Storybook");
}

const catalog = loadCatalogSources();
let count = 0;
for (const entry of catalog) {
  for (const id of [entry.docsId, ...entry.stories.map((story) => story.id)]) {
    if (!(id in index.entries)) throw new Error(`Catalog target missing from Storybook: ${id}`);
    count++;
  }
}
console.log(`Catalog verified: ${catalog.length} components, ${count} Storybook targets.`);
