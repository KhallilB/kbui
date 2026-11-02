import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCatalogSources } from "../catalog/source";
import { componentStyleTarget } from "../site/catalog-skin";

test("every catalog family has declared live anatomy, never a guessed selector", () => {
  const root = new URL("../../../packages/css/src/components/", import.meta.url).pathname;
  const css = readdirSync(root)
    .filter((file) => file.endsWith(".css"))
    .map((file) => readFileSync(join(root, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, ""))
    .join("\n");
  const catalog = loadCatalogSources();
  expect(catalog.length).toBeGreaterThan(0);
  for (const entry of catalog)
    for (const selector of componentStyleTarget(entry.name).split(/,\s*/))
      expect(css, `${entry.name}: ${selector}`).toMatch(
        new RegExp(`${selector.replaceAll(".", "\\.")}(?![\\w-])`),
      );
  expect(() => componentStyleTarget("UnregisteredComponent")).toThrow("UnregisteredComponent");
});
