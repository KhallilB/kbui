import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import tokens from "../../../packages/tokens/tokens.json";
import { skinFixture } from "./skin-fixture-values";

const documented = new Set(
  Object.entries(tokens)
    .filter(([group]) => group === "panel" || group === "status")
    .flatMap(([group, node]) => Object.keys(node).map((key) => `--kb-${group}-${key}`)),
);

describe("skin fixture", () => {
  test("sets documented --kb-panel-* and --kb-status-* properties only", () => {
    const keys = Object.keys(skinFixture);
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) expect(documented.has(key), key).toBe(true);
  });

  test("uses no .kb-* selectors and no !important", async () => {
    for (const file of ["./skin-fixture.tsx", "./skin-fixture-values.ts"]) {
      const source = await readFile(new URL(file, import.meta.url), "utf8");
      expect(source).not.toMatch(/\.kb-/);
      expect(source).not.toContain("!important");
    }
    for (const value of Object.values(skinFixture)) expect(value).not.toContain("!important");
  });
});
