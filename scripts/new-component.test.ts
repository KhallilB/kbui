import { beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { newComponent } from "./new-component";

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "kbui-gen-"));
  await mkdir(join(root, "packages/react/src/components"), { recursive: true });
  await mkdir(join(root, "packages/css/src/components"), { recursive: true });
  await writeFile(
    join(root, "packages/react/src/index.ts"),
    'export { Zed, type ZedProps } from "./components/Zed/Zed";\nexport { kb } from "./utils/kb";\n',
  );
  await writeFile(
    join(root, "packages/css/src/styles.css"),
    '@import "./reset.css";\n@import "./components/zed.css";\n',
  );
});

describe("newComponent", () => {
  test("stamps four files and registers exports", async () => {
    await newComponent("Badge", root);
    const tsx = await readFile(join(root, "packages/react/src/components/Badge/Badge.tsx"), "utf8");
    expect(tsx).toContain("export function Badge(");
    expect(tsx).toContain('kb("badge"');
    expect(
      await readFile(join(root, "packages/react/src/components/Badge/Badge.test.tsx"), "utf8"),
    ).toContain('describe("Badge"');
    expect(
      await readFile(join(root, "packages/react/src/components/Badge/Badge.stories.tsx"), "utf8"),
    ).toContain("Components/Badge");
    const css = await readFile(join(root, "packages/css/src/components/badge.css"), "utf8");
    expect(css.split("\n")[0]).toMatch(/^\/\* Anatomy: \.kb-badge/);
    expect(await readFile(join(root, "packages/react/src/index.ts"), "utf8")).toContain(
      'export { Badge, type BadgeProps } from "./components/Badge/Badge";',
    );
    expect(await readFile(join(root, "packages/css/src/styles.css"), "utf8")).toContain(
      '@import "./components/badge.css";',
    );
  });

  test("keeps exports and imports sorted", async () => {
    await newComponent("Badge", root);
    const index = await readFile(join(root, "packages/react/src/index.ts"), "utf8");
    const badge = index.indexOf("components/Badge/Badge");
    expect(badge).toBeGreaterThanOrEqual(0);
    expect(badge).toBeLessThan(index.indexOf("components/Zed/Zed"));
    expect(index.trimEnd().endsWith('from "./utils/kb";')).toBe(true);
    const css = await readFile(join(root, "packages/css/src/styles.css"), "utf8");
    expect(css.split("\n").slice(0, 3)).toEqual([
      '@import "./reset.css";',
      '@import "./components/badge.css";',
      '@import "./components/zed.css";',
    ]);
  });

  test("refuses to overwrite an existing component", async () => {
    await newComponent("Badge", root);
    await expect(newComponent("Badge", root)).rejects.toThrow(/exists/);
  });

  test("rejects non-PascalCase names", async () => {
    await expect(newComponent("bad-name", root)).rejects.toThrow(/PascalCase/);
  });
});
