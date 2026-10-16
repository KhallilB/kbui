import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const components = join(import.meta.dirname, "components");

describe("story coverage", () => {
  test("every component folder has a story and a test", () => {
    const dirs = readdirSync(components, { withFileTypes: true }).filter((d) => d.isDirectory());
    expect(dirs.length).toBeGreaterThan(0);
    for (const dir of dirs) {
      const base = join(components, dir.name, dir.name);
      expect(existsSync(`${base}.stories.tsx`), `${dir.name} needs a story`).toBe(true);
      expect(existsSync(`${base}.test.tsx`), `${dir.name} needs a test`).toBe(true);
    }
  });
});
