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

  test("facet clips and shadows only its decorative plate, never the root", async () => {
    const css = await readFile(join(src, "components", "facet.css"), "utf8");
    const rules = css.split("}").map((r) => r.trim());
    const selectorsWith = (prop: string) =>
      rules
        .filter((r) => new RegExp(`(^|[;{\\s])${prop}:`).test(r))
        .map((r) => r.slice(0, r.indexOf("{")).trim());
    const clipped = selectorsWith("clip-path");
    expect(clipped.length).toBeGreaterThan(0);
    for (const sel of clipped) expect(sel).toMatch(/\.kb-facet-plate(::before)?$/);
    const filtered = selectorsWith("filter");
    expect(filtered.length).toBeGreaterThan(0);
    for (const sel of filtered) expect(sel).toMatch(/\.kb-facet-frame$/);
    expect(css).toMatch(/\.kb-facet-frame \{[^}]*pointer-events: none/);
    const root = css.match(/\.kb-facet \{[^}]*\}/)?.[0] ?? "";
    expect(root).not.toMatch(/clip-path|filter/);
  });

  test("facet resolves cut depth at the element so a scoped --kb-facet-cut wins", async () => {
    const css = await readFile(join(src, "components", "facet.css"), "utf8");
    expect(css).toContain("var(--kb-facet-cut-start, var(--kb-facet-cut))");
    expect(css).toContain("var(--kb-facet-cut-end, var(--kb-facet-cut))");
  });

  test("facet paints edge, highlight, divider, shadow and well from tokens", async () => {
    const css = await readFile(join(src, "components", "facet.css"), "utf8");
    const rule = (sel: RegExp) =>
      [...css.matchAll(new RegExp(sel, "g"))].map((m) => m[0]).join("\n");
    const plate = rule(/\.kb-facet-plate \{[^}]*\}/);
    expect(plate).toContain("var(--_facet-edge)");
    expect(plate).toContain("var(--_facet-seam)");
    const fill = rule(/\.kb-facet-plate::before \{[^}]*\}/);
    expect(fill).toContain("var(--_facet-highlight)");
    expect(fill).toContain("var(--_facet-bg)");
    expect(rule(/\.kb-facet-frame \{[^}]*\}/)).toContain("var(--_facet-shadow)");
    const root = rule(/\.kb-facet \{[^}]*\}/);
    expect(root).toContain("--_facet-edge: var(--kb-facet-cut-edge)");
    expect(root).toContain("--_facet-shadow: var(--kb-facet-shadow)");
    expect(root).toContain("--_facet-highlight: var(--kb-facet-highlight)");
    expect(css).toMatch(
      /\[data-tone="active"\] \{[^}]*--_facet-shadow: var\(--kb-facet-shadow-active\)/,
    );
    expect(css).toMatch(/\[data-tone="quiet"\] \{[^}]*--_facet-shadow: none/);
    expect(css).toMatch(/\[data-nested\][^{]*\{[^}]*--_facet-shadow: none/);
    expect(css).toMatch(
      /\.kb-facet-header::after \{[^}]*var\(--kb-facet-divider\)[^}]*pointer-events: none/,
    );
    const well = rule(/\.kb-facet-well \{[^}]*\}/);
    expect(well).toContain("var(--kb-facet-well)");
    expect(well).toContain("var(--kb-facet-well-shadow)");
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
