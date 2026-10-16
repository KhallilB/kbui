import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
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
    'export {\n  Zed,\n  type ZedProps,\n} from "./components/Zed/Zed";\nexport { kb } from "./utils/kb";\n',
  );
  await writeFile(
    join(root, "packages/css/src/styles.css"),
    '@import "./reset.css";\n@import "./components/zed.css";\n',
  );
});

afterEach(() => rm(root, { recursive: true, force: true }));

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
    expect(index).toBe(
      [
        'export { Badge, type BadgeProps } from "./components/Badge/Badge";',
        "export {",
        "  Zed,",
        "  type ZedProps,",
        '} from "./components/Zed/Zed";',
        'export { kb } from "./utils/kb";',
        "",
      ].join("\n"),
    );
    const css = await readFile(join(root, "packages/css/src/styles.css"), "utf8");
    expect(css.split("\n").slice(0, 3)).toEqual([
      '@import "./reset.css";',
      '@import "./components/badge.css";',
      '@import "./components/zed.css";',
    ]);
  });

  test("leaves no placeholders in generated files", async () => {
    await newComponent("Badge", root);
    const dir = join(root, "packages/react/src/components/Badge");
    const files = [
      ...(await readdir(dir)).map((f) => join(dir, f)),
      join(root, "packages/css/src/components/badge.css"),
    ];
    expect(files).toHaveLength(4);
    for (const f of files) {
      expect(f).not.toMatch(/__[Nn]ame__/);
      expect(await readFile(f, "utf8")).not.toMatch(/__[Nn]ame__/);
    }
  });

  test("writes nothing when a registry file is missing", async () => {
    await rm(join(root, "packages/css/src/styles.css"));
    await expect(newComponent("Badge", root)).rejects.toThrow();
    await expect(readdir(join(root, "packages/react/src/components/Badge"))).rejects.toThrow();
  });

  test("rejects an unterminated statement and writes nothing", async () => {
    await writeFile(join(root, "packages/react/src/index.ts"), "export {\n  Zed,\n");
    await expect(newComponent("Badge", root)).rejects.toThrow(/Unterminated statement/);
    await expect(readdir(join(root, "packages/react/src/components/Badge"))).rejects.toThrow();
  });

  test("refuses to overwrite an existing component", async () => {
    await newComponent("Badge", root);
    await expect(newComponent("Badge", root)).rejects.toThrow(/exists/);
  });

  test("rejects non-PascalCase names", async () => {
    await expect(newComponent("bad-name", root)).rejects.toThrow(/PascalCase/);
  });
});
