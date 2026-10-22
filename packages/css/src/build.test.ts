import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { anatomyRoots, buildCss, paletteRefs } from "./build";

const src = new URL("./", import.meta.url).pathname;
let dist: string;

beforeAll(async () => {
  dist = await mkdtemp(join(tmpdir(), "kbui-css-"));
  await buildCss(src, dist);
});

afterAll(async () => {
  await rm(dist, { recursive: true, force: true });
});

async function fixture(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "kbui-fixture-"));
  await mkdir(join(root, "components"), { recursive: true });
  await writeFile(join(root, "reset.css"), "");
  for (const [name, body] of Object.entries(files)) {
    await writeFile(join(root, "components", name), body);
  }
  return root;
}

describe("buildCss", () => {
  test("bundles tokens, reset and every component into styles.css", async () => {
    const css = await readFile(join(dist, "styles.css"), "utf8");
    expect(css).toContain("--kb-color-bg:");
    expect(css).toContain(".kb-sr-only");
    for (const root of await anatomyRoots(src)) expect(css).toContain(root);
  });

  test("emits standalone reset and component files", async () => {
    expect(await readdir(dist)).toContain("reset.css");
    expect(await readdir(join(dist, "components"))).toEqual(
      expect.arrayContaining(["button.css", "input.css", "dialog.css"]),
    );
  });

  test("every component file declares an anatomy root", async () => {
    const roots = await anatomyRoots(src);
    expect(roots).toEqual(expect.arrayContaining([".kb-button", ".kb-input", ".kb-dialog-popup"]));
  });

  test("component css never references a palette primitive", async () => {
    expect(await paletteRefs(src)).toEqual([]);
  });

  test("paletteRefs flags palette vars (fallback, spaced) and raw literals", async () => {
    const root = await fixture({
      "bad.css": `/* Anatomy: .kb-bad */
.kb-bad {
  a: var(--kb-gray-500);
  b: var(--kb-gray-500, red);
  c: var( --kb-blue-600 );
  d: #fff;
}
`,
    });
    const hits = await paletteRefs(root);
    expect(hits).toHaveLength(4);
    for (const m of ["--kb-gray-500", "--kb-blue-600", "#fff"]) {
      expect(hits.some((h) => h.includes(m))).toBe(true);
    }
    await rm(root, { recursive: true, force: true });
  });

  test("paletteRefs flags the amber, green and teal families", async () => {
    const root = await fixture({
      "fam.css": `/* Anatomy: .kb-fam */
.kb-fam {
  a: var(--kb-amber-500);
  b: var(--kb-green-400);
  c: var(--kb-teal-600);
}
`,
    });
    const hits = await paletteRefs(root);
    expect(hits).toHaveLength(3);
    for (const m of ["--kb-amber-500", "--kb-green-400", "--kb-teal-600"]) {
      expect(hits.some((h) => h.includes(m))).toBe(true);
    }
    await rm(root, { recursive: true, force: true });
  });

  test("paletteRefs scans reset.css and accepts non-palette vars", async () => {
    const root = await fixture({
      "ok.css":
        "/* Anatomy: .kb-ok */\n.kb-ok { a: var(--kb-color-fg); b: var(--kb-space-2); c: var(--kb-badge-radius); }\n",
    });
    expect(await paletteRefs(root)).toEqual([]);
    await writeFile(join(root, "reset.css"), "html { color: rgb(0 0 0); }");
    expect(await paletteRefs(root)).toHaveLength(1);
    await rm(root, { recursive: true, force: true });
  });

  test("facet clips only its decorative pseudo-elements, never the root", async () => {
    const css = await readFile(join(src, "components", "facet.css"), "utf8");
    const rules = css
      .split("}")
      .map((r) => r.trim())
      .filter((r) => r.includes("clip-path"));
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      const selector = rule.slice(0, rule.indexOf("{"));
      expect(selector).toMatch(/::(before|after)\s*$/);
    }
    expect(css).toMatch(/\.kb-facet::before,\s*\.kb-facet::after \{[^}]*pointer-events: none/);
  });

  test("facet rail starts and ends inside the cut corners", async () => {
    const css = await readFile(join(src, "components", "facet.css"), "utf8");
    const rail = css.match(/\.kb-facet-rail \{[^}]*\}/)?.[0] ?? "";
    expect(rail).toContain("inset-block-start: var(--_facet-cut-start)");
    expect(rail).not.toMatch(/inset-block:\s*0/);
  });

  test("facet paints its opt-in cut edge, highlight and header divider from tokens", async () => {
    const css = await readFile(join(src, "components", "facet.css"), "utf8");
    const rules = (sel: RegExp) => [...css.matchAll(sel)].map((m) => m[0]).join("\n");
    const seam = rules(/\.kb-facet::before \{[^}]*\}/g);
    expect(seam).toContain("var(--_facet-edge)");
    expect(seam).toContain("var(--_facet-edge-start-depth)");
    expect(seam).toContain("var(--_facet-edge-end-depth)");
    const root = css.match(/\.kb-facet \{[^}]*\}/)?.[0] ?? "";
    expect(root).toContain("--_facet-edge: var(--kb-facet-cut-edge)");
    expect(css).toMatch(/\[data-cut="start"\][^{]*\{[^}]*--_facet-edge-start-depth:/);
    expect(css).toMatch(/\[data-cut="end"\][^{]*\{[^}]*--_facet-edge-end-depth:/);
    expect(css).toMatch(/\[data-tone="quiet"\] \{[^}]*--_facet-edge: transparent/);
    expect(css).toMatch(
      /\[data-tone="critical"\] \{[^}]*--_facet-edge: var\(--kb-facet-border-critical\)/,
    );
    const fill = rules(/\.kb-facet::after \{[^}]*\}/g);
    expect(fill).toContain("var(--kb-facet-highlight)");
    expect(css).toMatch(
      /\.kb-facet-header::after \{[^}]*var\(--kb-facet-divider\)[^}]*pointer-events: none/,
    );
  });

  test("sunken facet recesses onto its own plane color", async () => {
    const css = await readFile(join(src, "components", "facet.css"), "utf8");
    expect(css).toMatch(
      /\[data-tone="sunken"\] \{[^}]*--_facet-bg: var\(--kb-facet-background-sunken\)/,
    );
  });

  test("status chip tints from its own ink, never a palette color", async () => {
    const css = await readFile(join(src, "components", "status.css"), "utf8");
    const chip = css.match(/\.kb-status\[data-appearance="chip"\] \{[^}]*\}/)?.[0] ?? "";
    expect(chip).toContain("var(--_status-ink)");
    expect(chip).toContain("color-mix(");
  });

  test("anatomyRoots throws without an anatomy comment", async () => {
    const root = await fixture({ "x.css": ".kb-x { color: red; }\n" });
    await expect(anatomyRoots(root)).rejects.toThrow("first line must be an Anatomy comment");
    await rm(root, { recursive: true, force: true });
  });

  test("anatomyRoots throws when the root is not a selector in the body", async () => {
    const root = await fixture({
      "x.css": "/* Anatomy: .kb-x */\n.kb-x-part { color: red; }\n",
    });
    await expect(anatomyRoots(root)).rejects.toThrow("anatomy root .kb-x not found in selectors");
    await rm(root, { recursive: true, force: true });
  });

  test("buildCss removes stale files from dist", async () => {
    const out = await mkdtemp(join(tmpdir(), "kbui-css-stale-"));
    await writeFile(join(out, "stale.css"), "");
    await buildCss(src, out);
    expect(await readdir(out)).not.toContain("stale.css");
    await rm(out, { recursive: true, force: true });
  });
});
