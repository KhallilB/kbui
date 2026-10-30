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

  test("puts every kbui rule in a kbui cascade layer", async () => {
    const css = await readFile(join(dist, "styles.css"), "utf8");
    expect(css).toStartWith("@layer kbui.tokens{");
    const unlayered = css.replace(
      /@layer kbui\.\w+\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*\}/g,
      "",
    );
    expect(unlayered).toBe("");
    expect(await readFile(join(dist, "reset.css"), "utf8")).toStartWith("@layer kbui.reset{");
    expect(await readFile(join(dist, "components", "button.css"), "utf8")).toStartWith(
      "@layer kbui.components{",
    );
  });

  test("emits standalone reset and component files", async () => {
    expect(await readdir(dist)).toContain("reset.css");
    expect(await readdir(join(dist, "components"))).toEqual(
      expect.arrayContaining([
        "button.css",
        "input.css",
        "dialog.css",
        "toast.css",
        "table.css",
        "descriptionlist.css",
        "collectionlist.css",
        "collectionrow.css",
        "image.css",
        "avatar.css",
        "thumbnail.css",
        "tabs.css",
        "pageheader.css",
        "copyabletext.css",
        "codeblock.css",
        "confirmaction.css",
      ]),
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

  test("combobox and multiselect stylesheets reference only defined tokens and include reduced-motion and forced-colors rules", async () => {
    const bundled = await readFile(join(dist, "styles.css"), "utf8");
    const definedVars = new Set(
      [...bundled.matchAll(/(--kb-[a-z0-9-]+)\s*:/g)].map((match) => match[1]),
    );
    for (const file of ["combobox.css", "multiselect.css"]) {
      const css = await readFile(join(src, "components", file), "utf8");
      expect(css).toContain("@media (prefers-reduced-motion: reduce)");
      expect(css).toContain("@media (forced-colors: active)");
      const usedVars = [...css.matchAll(/var\((--kb-[a-z0-9-]+)/g)].map((match) => match[1]);
      expect(usedVars.length).toBeGreaterThan(0);
      for (const tokenVar of usedVars) {
        expect(definedVars.has(tokenVar)).toBe(true);
      }
    }
  });

  test("basic forms css uses only defined tokens and preserves legend spacing and forced-colors states", async () => {
    const tokensCss = await readFile(join(dist, "styles.css"), "utf8");
    const definedVars = new Set(
      [...tokensCss.matchAll(/(--kb-[a-z0-9-]+)\s*:/g)].map((match) => match[1]),
    );
    for (const file of [
      "switch.css",
      "textarea.css",
      "fieldset.css",
      "formactions.css",
      "errorsummary.css",
      "confirmaction.css",
    ]) {
      const css = await readFile(join(src, "components", file), "utf8");
      const refs = [...css.matchAll(/var\(\s*(--kb-[a-z0-9-]+)/g)]
        .map((match) => match[1])
        .filter((ref) => ref !== "--kb-switch-off-color" && ref !== "--kb-switch-on-color");
      for (const ref of refs) {
        expect(definedVars.has(ref)).toBe(true);
      }
    }
    const switchCss = await readFile(join(src, "components", "switch.css"), "utf8");
    expect(switchCss).toContain(".kb-fieldset .kb-switch:not([data-size])");
    expect(switchCss).toContain("min-inline-size: var(--kb-button-touch-min)");
    expect(switchCss).toContain("data-off-tone");
    expect(switchCss).toContain("data-on-tone");
    const fieldsetCss = await readFile(join(src, "components", "fieldset.css"), "utf8");
    expect(fieldsetCss).toContain(".kb-fieldset-legend:not(.kb-sr-only)");
    expect(fieldsetCss).toContain("margin-block-end: var(--kb-fieldset-gap)");
    const textareaCss = await readFile(join(src, "components", "textarea.css"), "utf8");
    expect(textareaCss).toContain("max-inline-size: 100%");
    expect(textareaCss).toContain(".kb-textarea[data-invalid] .kb-textarea-control:focus-visible");
  });

  test("every component stylesheet references only defined tokens and styles.css imports stay sorted", async () => {
    const bundled = await readFile(join(dist, "styles.css"), "utf8");
    const definedVars = new Set(
      [...bundled.matchAll(/(--kb-[a-z0-9-]+)\s*:/g)].map((match) => match[1]),
    );
    const runtimeVars = new Set([
      "--kb-panel-size",
      "--kb-switch-off-color",
      "--kb-switch-on-color",
    ]);
    const files = (await readdir(join(src, "components"))).filter((f) => f.endsWith(".css")).sort();
    for (const file of files) {
      const css = await readFile(join(src, "components", file), "utf8");
      const refs = [...css.matchAll(/var\(\s*(--kb-[a-z0-9-]+)/g)]
        .map((match) => match[1])
        .filter((ref): ref is string => ref !== undefined && !runtimeVars.has(ref));
      for (const ref of refs) {
        expect(definedVars.has(ref), `${file}: ${ref}`).toBe(true);
      }
    }
    const stylesCss = await readFile(join(src, "styles.css"), "utf8");
    const imports = [...stylesCss.matchAll(/@import "\.\/components\/([^"]+)"/g)].map((m) => m[1]);
    expect(imports).toEqual([...imports].sort());
  });

  test("controls and overlays preserve focus-visible over invalid, forced-colors states, and anatomy headers", async () => {
    const read = (file: string) => readFile(join(src, "components", file), "utf8");
    const inputCss = await read("input.css");
    expect(inputCss).toContain(".kb-input[data-invalid] .kb-input-control:focus-visible");
    expect(inputCss).toContain("@media (forced-colors: active)");

    const menuCss = await read("menu.css");
    expect(menuCss).toContain("@media (forced-colors: active)");
    expect(menuCss).not.toMatch(/\.kb-menu-item\[data-highlighted\]\s*\{/);
    expect(menuCss).toContain(".kb-menu-item[data-highlighted]:not([data-disabled])");

    const dialogCss = await read("dialog.css");
    expect(dialogCss).toContain("@media (forced-colors: active)");

    const scrollareaCss = await read("scrollarea.css");
    expect(scrollareaCss).toContain("@media (forced-colors: active)");

    const numberfieldCss = await read("numberfield.css");
    expect(numberfieldCss).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\.kb-numberfield-input:focus-visible/,
    );
    expect(numberfieldCss).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\.kb-numberfield\[data-disabled\] \.kb-numberfield-group/,
    );

    const radiogroupCss = await read("radiogroup.css");
    expect(radiogroupCss).toContain(
      ".kb-radiogroup[data-invalid] .kb-radiogroup-control:not([data-checked])",
    );
    expect(radiogroupCss).toContain(
      '.kb-radiogroup[data-appearance="segmented"][data-invalid] .kb-radiogroup-options',
    );

    const fileinputCss = await read("fileinput.css");
    expect(fileinputCss).toContain(".kb-fileinput[data-invalid] .kb-fileinput-trigger");

    const selectCss = await read("select.css");
    expect(selectCss.split("\n")[0]).toContain(".kb-select-portal");
    expect(selectCss.split("\n")[0]).toContain("[data-pointer-focus]");
    expect(selectCss.split("\n")[0]).toContain("[data-starting-style]");
    expect(selectCss).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\.kb-select\[data-invalid\] \.kb-select-control/,
    );
    expect(selectCss).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\.kb-select\[data-disabled\] \.kb-select-control/,
    );

    expect(await anatomyRoots(src)).toContain(".kb-radiogroup");
    expect(radiogroupCss.split("\n")[0]).toContain("[data-selection]");
    expect(menuCss.split("\n")[0]).toContain("[data-kb-menu-trigger][data-pointer-focus]");

    const comboboxCss = await read("combobox.css");
    expect(comboboxCss.split("\n")[0]).toContain("[data-starting-style]");
    expect(comboboxCss).toMatch(
      /\.kb-combobox:not\(\[data-disabled\]\):not\(\[data-readonly\]\):not\(\[data-invalid\]\)\s+\.kb-combobox-shell:hover:not\(:focus-within\)/,
    );
    expect(comboboxCss).not.toContain("outline-color: var(--kb-color-danger)");
    expect(comboboxCss).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\.kb-combobox\[data-invalid\] \.kb-combobox-shell/,
    );

    const multiselectCss = await read("multiselect.css");
    expect(multiselectCss.split("\n")[0]).toContain("[data-starting-style]");
    expect(multiselectCss).toMatch(
      /\.kb-multiselect:not\(\[data-disabled\]\):not\(\[data-readonly\]\):not\(\[data-invalid\]\)\s+\.kb-multiselect-shell:hover:not\(:focus-within\)/,
    );
    expect(multiselectCss).not.toContain("outline-color: var(--kb-color-danger)");
    expect(multiselectCss).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\.kb-multiselect\[data-invalid\] \.kb-multiselect-shell/,
    );

    expect(inputCss).toContain(
      ".kb-input:not([data-invalid]) .kb-input-control:hover:not(:disabled):not(:focus-visible)",
    );

    const textareaCss = await read("textarea.css");
    expect(textareaCss).toContain(
      ".kb-textarea:not([data-invalid]) .kb-textarea-control:hover:not(:disabled):not(:focus-visible)",
    );
    expect(textareaCss).toContain(".kb-textarea[data-readonly] .kb-textarea-control:focus-visible");

    const buttonCss = await read("button.css");
    expect(buttonCss).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\.kb-button:focus-visible[\s\S]*outline-color: Highlight/,
    );
    expect(buttonCss.slice(buttonCss.lastIndexOf("@media (forced-colors: active)"))).not.toContain(
      "var(--kb-color-danger)",
    );

    const switchCss = await read("switch.css");
    expect(switchCss).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\.kb-switch\[data-invalid\] \.kb-switch-control \+ \.kb-switch-track/,
    );
    expect(switchCss).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\.kb-switch \.kb-switch-control:disabled \+ \.kb-switch-track/,
    );

    const tooltipCss = await read("tooltip.css");
    expect(tooltipCss).toContain("@media (forced-colors: active)");

    const calloutCss = await read("callout.css");
    expect(calloutCss).toContain("@media (forced-colors: active)");
    expect(calloutCss).toContain(
      "border: 1px solid color-mix(in oklab, var(--_callout-ink) 65%, transparent)",
    );
    expect(calloutCss).toContain(
      "background: color-mix(in oklab, var(--_callout-ink) 18%, var(--kb-material-surface-bg))",
    );
    expect(calloutCss).toMatch(/--_callout-title:\s*var\(--_callout-ink\)/);
    expect(calloutCss).toMatch(/\.kb-callout-title \{[\s\S]*?color: var\(--_callout-title\)/);

    const codeCss = await read("code.css");
    expect(codeCss.split("\n")[0]).toContain("[data-block]");
    expect(codeCss.split("\n")[0]).toContain(".kb-code-header");
    expect(codeCss.split("\n")[0]).toContain(".kb-code-line");
    expect(codeCss).toContain(".kb-code[data-block]");
    expect(codeCss).toContain(".kb-code-line[data-highlighted]");
    expect(codeCss).toContain('[data-syntax="keyword"]');
    expect(codeCss).toContain('[data-syntax="function"]');
    expect(codeCss).toContain("--kb-code-motion-duration");
    expect(codeCss).toContain("--kb-code-motion-easing");
    expect(codeCss).toContain("--kb-code-toggle-min-width");
    expect(codeCss).toContain("--kb-code-copy-min-width");
    expect(codeCss).toContain("[data-min-lines]");
    expect(codeCss).toContain("--_code-min-lines");
    expect(codeCss).toContain("--_code-collapsed-lines");
    expect(codeCss).toContain("@media (prefers-reduced-motion: reduce)");
    expect(codeCss).toContain("@media (forced-colors: active)");

    const gridCss = await read("grid.css");
    expect(gridCss.split("\n")[0]).toContain("[data-columns=auto|1|2|3|4]");
    expect(gridCss.split("\n")[0]).toContain("[data-min-item-width=sm|md|lg]");
    expect(gridCss.split("\n")[0]).toContain("[data-gap=none|sm|md|lg]");
    expect(gridCss.split("\n")[0]).toContain("[data-align=start|center|end|baseline|stretch]");
    expect(gridCss).toContain("list-style: none;");
    expect(gridCss).toContain(".kb-grid > *");
    expect(gridCss).toContain('.kb-grid[data-min-item-width="sm"]');
    expect(gridCss).toContain('.kb-grid[data-columns="3"]');
    expect(gridCss).toContain('.kb-grid[data-gap="md"]');
    expect(gridCss).toContain('.kb-grid[data-align="center"]');

    const galleryCss = await read("gallery.css");
    expect(galleryCss.split("\n")[0]).toContain(".kb-gallery-items.kb-grid > .kb-gallery-item");
    expect(galleryCss).toContain("container: kb-gallery / inline-size");
    expect(galleryCss).toContain("max-inline-size: var(--kb-gallery-max-width)");
    expect(galleryCss).toContain("@media (width >= 48rem)");
    expect(galleryCss).toContain("padding-inline: var(--kb-gallery-gutter-sm)");
    expect(galleryCss).toMatch(
      /@media \(width >= 48rem\) \{\s*\.kb-gallery \{\s*padding-inline: var\(--kb-gallery-gutter-md\)/,
    );
    expect(galleryCss).toMatch(
      /@media \(width >= 64rem\) \{\s*\.kb-gallery \{\s*padding-inline: var\(--kb-gallery-gutter-lg\)/,
    );
    for (const step of ["30rem", "48rem", "64rem"]) {
      expect(galleryCss).toContain(`@container kb-gallery (width >= ${step})`);
    }
    expect(galleryCss).toMatch(/\.kb-gallery-item\[data-featured\][^{]*\{\s*grid-column: span 2/);
    expect(galleryCss).not.toContain(".kb-card");

    for (const file of ["spinner.css", "skeleton.css", "emptystate.css", "toast.css"]) {
      const css = await read(file);
      expect(css).toContain("@media (prefers-reduced-motion: reduce)");
      expect(css).toContain("@media (forced-colors: active)");
    }

    const spinnerCss = await read("spinner.css");
    expect(spinnerCss.split("\n")[0]).toContain(".kb-spinner");
    expect(spinnerCss.split("\n")[0]).toContain("[data-size=sm|md|lg]");
    expect(spinnerCss.split("\n")[0]).toContain("[data-variant=ring|orbit|dots|bars]");
    expect(spinnerCss.split("\n")[0]).toContain("[data-appearance=plain|pill]");
    expect(spinnerCss).toContain("var(--kb-spinner-duration)");
    expect(spinnerCss).toContain("var(--kb-spinner-easing)");
    expect(spinnerCss).toContain("var(--kb-spinner-orbit-duration)");
    expect(spinnerCss).toContain("var(--kb-spinner-pulse-duration)");
    expect(spinnerCss).toContain("var(--kb-spinner-stagger)");
    expect(spinnerCss).toContain("var(--kb-spinner-glow)");
    expect(spinnerCss).toContain('.kb-spinner[data-appearance="pill"]');
    expect(spinnerCss).toContain(".kb-spinner-core");
    expect(spinnerCss).toContain(".kb-spinner-dot");
    expect(spinnerCss).toContain(".kb-spinner-bar");

    const skeletonCss = await read("skeleton.css");
    expect(skeletonCss.split("\n")[0]).toContain(".kb-skeleton");
    expect(skeletonCss.split("\n")[0]).toContain("[data-variant=text|rect|circle|pill]");
    expect(skeletonCss.split("\n")[0]).toContain("[data-animation=shimmer|pulse|wave]");
    expect(skeletonCss.split("\n")[0]).toContain("[data-tone=default|subtle|accent]");
    expect(skeletonCss).toContain("var(--kb-skeleton-base)");
    expect(skeletonCss).toContain("var(--kb-skeleton-highlight)");
    expect(skeletonCss).toContain("var(--kb-skeleton-sheen)");
    expect(skeletonCss).toContain("var(--kb-skeleton-pulse-duration)");
    expect(skeletonCss).toContain("var(--kb-skeleton-stagger)");
    expect(skeletonCss).toContain('.kb-skeleton[data-animation="pulse"]');
    expect(skeletonCss).toContain('.kb-skeleton[data-animation="wave"]');
    expect(skeletonCss).toContain('.kb-skeleton[data-tone="accent"]');

    const emptyStateCss = await read("emptystate.css");
    expect(emptyStateCss.split("\n")[0]).toContain(".kb-emptystate");
    expect(emptyStateCss.split("\n")[0]).toContain("[data-variant=surface|subtle|plain]");
    expect(emptyStateCss).toContain("var(--kb-emptystate-max-width)");
    expect(emptyStateCss).toContain(".kb-emptystate-actions");

    const pageHeaderCss = await read("pageheader.css");
    expect(pageHeaderCss.split("\n")[0]).toContain(
      ".kb-pageheader [data-size=sm|md|lg] [data-divider]",
    );
    expect(pageHeaderCss).toContain("flex: 1 1 var(--kb-pageheader-heading-min-width)");
    expect(pageHeaderCss).toContain("flex-wrap: wrap");

    const toastCss = await read("toast.css");
    expect(toastCss.split("\n")[0]).toContain(".kb-toast");
    expect(toastCss.split("\n")[0]).toContain(".kb-toast-viewport");
    expect(toastCss).toContain("var(--kb-toast-z-index)");
    expect(toastCss).toContain("var(--kb-toast-shadow)");
    expect(toastCss).toContain("[data-starting-style]");
    expect(toastCss).toContain("[data-ending-style]");
  });
});
