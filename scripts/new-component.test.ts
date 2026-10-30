import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { extractDocumentationExamples } from "../apps/storybook/catalog/documentation";
import { parseApiSection } from "../apps/storybook/catalog/source";
import { authorNextSteps, newComponent } from "./new-component";

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "kbui-gen-"));
  await mkdir(join(root, "packages/react/src/components"), { recursive: true });
  await mkdir(join(root, "packages/css/src/components"), { recursive: true });
  await writeFile(
    join(root, "packages/react/package.json"),
    JSON.stringify({ name: "@kb.ui/react" }),
  );
  await writeFile(
    join(root, "packages/react/src/index.ts"),
    'export {\n  Zed,\n  type ZedProps,\n} from "./components/Zed/Zed";\nexport { kb } from "./utils/kb";\n',
  );
  await writeFile(
    join(root, "packages/css/src/styles.css"),
    '@import "./reset.css" layer(kbui.reset);\n@import "./components/zed.css" layer(kbui.components);\n',
  );
});

afterEach(() => rm(root, { recursive: true, force: true }));

describe("newComponent", () => {
  test("stamps component files and reference skeleton, registers layered CSS import, and compiles generated TSX", async () => {
    await newComponent("Badge", root);
    const tsx = await readFile(join(root, "packages/react/src/components/Badge/Badge.tsx"), "utf8");
    expect(tsx).toContain("export function Badge(");
    expect(tsx).toContain('kb("badge"');
    const transpiler = new Bun.Transpiler({ loader: "tsx" });
    expect(() => transpiler.transformSync(tsx)).not.toThrow();
    expect(
      await readFile(join(root, "packages/react/src/components/Badge/Badge.test.tsx"), "utf8"),
    ).toContain('describe("Badge"');
    expect(
      await readFile(join(root, "packages/react/src/components/Badge/Badge.stories.tsx"), "utf8"),
    ).toContain("Components/Badge");
    const css = await readFile(join(root, "packages/css/src/components/badge.css"), "utf8");
    expect(css.split("\n")[0]).toMatch(/^\/\* Anatomy: \.kb-badge/);
    const doc = await readFile(join(root, "packages/react/docs/components/Badge.md"), "utf8");
    expect(doc).toContain("# Badge");
    expect(doc).toContain('import "@kb.ui/react/styles.css";');
    expect(doc).toContain('import { Badge } from "@kb.ui/react";');
    expect(doc).not.toMatch(/WCAG\s+2\.|conforms to|screen reader tested/i);
    const modules = extractDocumentationExamples(doc);
    expect(modules).toHaveLength(1);
    expect(() => transpiler.transformSync(modules[0] ?? "")).not.toThrow();
    const apiBlocks = parseApiSection(doc, "Badge");
    expect(apiBlocks.some((b) => b.kind === "table")).toBe(true);
    expect(await readFile(join(root, "packages/react/src/index.ts"), "utf8")).toContain(
      'export { Badge, type BadgeProps } from "./components/Badge/Badge";',
    );
    expect(await readFile(join(root, "packages/css/src/styles.css"), "utf8")).toContain(
      '@import "./components/badge.css" layer(kbui.components);',
    );
    const steps = authorNextSteps("Badge");
    expect(steps.some((s) => s.includes("packages/react/README.md"))).toBe(true);
    expect(steps.some((s) => s.includes("apps/storybook/catalog/definitions.ts"))).toBe(true);
    expect(steps.some((s) => s.includes("apps/storybook/catalog/accessibility-guides.ts"))).toBe(
      true,
    );
  });

  test("preserves an existing authored reference markdown file without overwriting it", async () => {
    const docDir = join(root, "packages/react/docs/components");
    await mkdir(docDir, { recursive: true });
    const existingDoc = "# Badge\n\nAuthored guidance that must be preserved.\n";
    await writeFile(join(docDir, "Badge.md"), existingDoc, "utf8");
    await newComponent("Badge", root);
    expect(await readFile(join(docDir, "Badge.md"), "utf8")).toBe(existingDoc);
  });

  test("keeps exports and layered component imports sorted", async () => {
    await newComponent("Zeta", root);
    await newComponent("Badge", root);
    const index = await readFile(join(root, "packages/react/src/index.ts"), "utf8");
    expect(index).toBe(
      [
        'export { Badge, type BadgeProps } from "./components/Badge/Badge";',
        "export {",
        "  Zed,",
        "  type ZedProps,",
        '} from "./components/Zed/Zed";',
        'export { Zeta, type ZetaProps } from "./components/Zeta/Zeta";',
        'export { kb } from "./utils/kb";',
        "",
      ].join("\n"),
    );
    const css = await readFile(join(root, "packages/css/src/styles.css"), "utf8");
    expect(css.split("\n").slice(0, 4)).toEqual([
      '@import "./reset.css" layer(kbui.reset);',
      '@import "./components/badge.css" layer(kbui.components);',
      '@import "./components/zed.css" layer(kbui.components);',
      '@import "./components/zeta.css" layer(kbui.components);',
    ]);
  });

  test("leaves no placeholders in generated files", async () => {
    await newComponent("Badge", root);
    const dir = join(root, "packages/react/src/components/Badge");
    const files = [
      ...(await readdir(dir)).map((f) => join(dir, f)),
      join(root, "packages/css/src/components/badge.css"),
      join(root, "packages/react/docs/components/Badge.md"),
    ];
    expect(files).toHaveLength(5);
    for (const f of files) {
      expect(f).not.toMatch(/__(?:[Nn]ame|pkg)__/);
      expect(await readFile(f, "utf8")).not.toMatch(/__(?:[Nn]ame|pkg)__/);
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
