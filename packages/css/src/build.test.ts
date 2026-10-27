import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { anatomyRoots, buildCss, paletteRefs, rawStyleValues } from "./build";

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

  test("component css takes sizing, type and motion from tokens", async () => {
    expect(await rawStyleValues(src)).toEqual([]);
  });

  test("rawStyleValues flags restyle literals and keeps hairlines, zero and em", async () => {
    const root = await fixture({
      "raw.css": `/* Anatomy: .kb-raw */
.kb-raw {
  height: 40px;
  padding: 0.125rem var(--kb-space-2);
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  transition: color 120ms ease, background-color var(--kb-motion-duration-base) var(--kb-motion-easing-standard);
  border: 1px solid var(--kb-color-border);
  outline-offset: -2px;
  inline-size: calc(var(--kb-switch-height) - 2px);
  margin: 0;
  padding-inline-start: 1.4em;
  background: linear-gradient(180deg, red, blue);
  transition-duration: 0s;
}
@media (max-width: 580px) { .kb-raw { min-height: var(--kb-button-touch-min); } }
`,
    });
    const hits = await rawStyleValues(root);
    for (const m of ["height: 40px", "padding: 0.125rem", "font-size: 15px", "font-weight: 600"]) {
      expect(hits.some((h) => h.endsWith(m))).toBe(true);
    }
    for (const m of ["border-radius: 10px", "transition: 120ms", "transition: ease"]) {
      expect(hits.some((h) => h.endsWith(m))).toBe(true);
    }
    expect(hits).toHaveLength(7);
    await rm(root, { recursive: true, force: true });
  });

  test("panel never clips; only its decorative layers filter or blur", async () => {
    const css = await readFile(join(src, "components", "panel.css"), "utf8");
    expect(css).not.toContain("clip-path");
    expect(css).not.toContain("polygon(");
    const rules = css.split("}").map((r) => r.trim());
    const selectorsWith = (prop: string) =>
      rules
        .filter((r) => new RegExp(`(^|[;{\\s])${prop}:`).test(r))
        .map((r) => r.slice(0, r.indexOf("{")).trim());
    for (const sel of selectorsWith("filter")) expect(sel).toMatch(/\.kb-panel-glow$/);
    for (const sel of selectorsWith("backdrop-filter")) expect(sel).toMatch(/\.kb-panel-plate$/);
    const root = css.match(/\.kb-panel \{[^}]*\}/)?.[0] ?? "";
    expect(root).not.toMatch(/filter|overflow/);
    expect(root).toContain("border-radius: var(--kb-panel-radius)");
  });

  test("panel paints rim, sheen, glass, glow, shadow and well from tokens", async () => {
    const css = await readFile(join(src, "components", "panel.css"), "utf8");
    const rule = (sel: RegExp) =>
      [...css.matchAll(new RegExp(sel, "g"))].map((m) => m[0]).join("\n");
    const plate = rule(/\.kb-panel-plate \{[^}]*\}/);
    expect(plate).toContain("var(--_panel-sheen)");
    expect(plate).toContain("var(--_panel-bg)");
    expect(plate).toContain("var(--_panel-shadow)");
    expect(plate).toContain("var(--_panel-highlight)");
    expect(plate).toContain("backdrop-filter: var(--kb-panel-backdrop)");
    expect(plate).toContain("pointer-events: none");
    const rim = rule(/\.kb-panel-plate::before \{[^}]*\}/);
    expect(rim).toContain("var(--_panel-rim-top)");
    expect(rim).toContain("var(--_panel-seam)");
    expect(rim).toContain("var(--_panel-rim-bottom)");
    expect(rim).toMatch(/mask-composite: exclude/);
    const glow = rule(/\.kb-panel-glow \{[^}]*\}/);
    expect(glow).toContain("var(--_panel-glow)");
    expect(glow).toContain("filter: blur(var(--kb-panel-glow-blur))");
    expect(glow).toContain("pointer-events: none");
    expect(css).toMatch(
      /\[data-tone="active"\] \{[^}]*--_panel-rim-top: var\(--kb-panel-border-active\)/,
    );
    expect(css).toMatch(
      /\[data-tone="active"\] \{[^}]*--_panel-glow: var\(--kb-panel-glow-active\)/,
    );
    expect(css).toMatch(
      /\[data-tone="critical"\] \{[^}]*--_panel-rim-top: var\(--kb-panel-border-critical\)/,
    );
    expect(css).toMatch(
      /\[data-tone="critical"\] \{[^}]*--_panel-glow: var\(--kb-panel-glow-critical\)/,
    );
    expect(css).toMatch(/\[data-tone="quiet"\] \{[^}]*--_panel-shadow: none/);
    expect(css).toMatch(/\[data-nested\][^{]*\{[^}]*--_panel-shadow: none/);
    expect(css).toMatch(
      /\.kb-panel-header::after \{[^}]*var\(--kb-panel-divider\)[^}]*pointer-events: none/,
    );
    const well = rule(/\.kb-panel-well \{[^}]*\}/);
    expect(well).toContain("var(--kb-panel-well)");
    expect(well).toContain("var(--kb-panel-well-shadow)");
    expect(well).toContain("border-radius: var(--kb-panel-well-radius)");
  });

  test("sunken panel recesses onto its own plane color", async () => {
    const css = await readFile(join(src, "components", "panel.css"), "utf8");
    expect(css).toMatch(
      /\[data-tone="sunken"\] \{[^}]*--_panel-bg: var\(--kb-panel-background-sunken\)/,
    );
  });

  test("status chip tints from its own ink, never a palette color", async () => {
    const css = await readFile(join(src, "components", "status.css"), "utf8");
    const chip = css.match(/\.kb-status\[data-appearance="chip"\] \{[^}]*\}/)?.[0] ?? "";
    expect(chip).toContain("var(--_status-ink)");
    expect(chip).toContain("color-mix(");
  });

  test("status chip rounds and glows from tokens", async () => {
    const css = await readFile(join(src, "components", "status.css"), "utf8");
    const chip = css.match(/\.kb-status\[data-appearance="chip"\] \{[^}]*\}/)?.[0] ?? "";
    expect(chip).toContain("border-radius: var(--kb-status-radius)");
    expect(css).toMatch(
      /\[data-appearance="chip"\] > \.kb-status-icon \{[^}]*drop-shadow\(0 0 var\(--kb-status-glow\) var\(--_status-ink\)\)/,
    );
  });

  test("progress, stat and badge read their themable values from tokens", async () => {
    const read = (f: string) => readFile(join(src, "components", f), "utf8");
    const progress = await read("progress.css");
    for (const t of ["track", "fill", "fill-complete", "height", "glow"]) {
      expect(progress).toContain(`var(--kb-progress-${t})`);
    }
    const stat = await read("stat.css");
    expect(stat).toContain("var(--kb-stat-display-size)");
    expect(stat).toContain("var(--kb-stat-display-weight)");
    const badge = await read("badge.css");
    expect(badge).toMatch(/\.kb-badge\[data-appearance="plain"\] \{[^}]*background: none/);
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
