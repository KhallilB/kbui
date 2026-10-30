import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCatalogSources } from "../catalog/source";
import { componentStyleTarget } from "../site/catalog-skin";

test("live fields target the public parts used by copied styling", () => {
  expect(componentStyleTarget("Combobox")).toBe(".kb-combobox-shell, .kb-multiselect-shell");
  expect(componentStyleTarget("MultiSelect")).toBe(".kb-multiselect-shell");
  expect(componentStyleTarget("Textarea")).toBe(".kb-textarea-control");
  expect(componentStyleTarget("ConfirmAction")).toBe(".kb-confirmaction");
  expect(componentStyleTarget("Popover")).toBe(".kb-popover");
});

test("every catalog family has declared live anatomy, never a guessed selector", () => {
  const root = new URL("../../../packages/css/src/components/", import.meta.url).pathname;
  const css = readdirSync(root)
    .filter((file) => file.endsWith(".css"))
    .map((file) => readFileSync(join(root, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, ""))
    .join("\n");
  const catalog = loadCatalogSources();
  expect(catalog).toHaveLength(63);
  for (const entry of catalog)
    for (const selector of componentStyleTarget(entry.name).split(/,\s*/))
      expect(css, `${entry.name}: ${selector}`).toMatch(
        new RegExp(`${selector.replaceAll(".", "\\.")}(?![\\w-])`),
      );
  expect(() => componentStyleTarget("UnregisteredComponent")).toThrow("UnregisteredComponent");
});
