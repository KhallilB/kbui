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
        "statsrow.css",
        "copyabletext.css",
        "codeblock.css",
        "confirmaction.css",
        "supportingpane.css",
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

  test("opaque panel drops the glass and paints its fill on a solid base", async () => {
    const css = await readFile(join(src, "components", "panel.css"), "utf8");
    const opaque = css.match(/\.kb-panel\[data-opaque\] > \.kb-panel-plate \{[^}]*\}/)?.[0] ?? "";
    expect(opaque).toContain("backdrop-filter: none");
    expect(opaque).toContain("var(--_panel-sheen)");
    expect(opaque).toContain("var(--_panel-bg)");
    expect(opaque).toMatch(/var\(--kb-panel-background-opaque\);/);
    expect(css.split("\n")[0]).toContain("[data-opaque]");
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

  // Native <legend> ignores parent flex/grid gap; margin-block-end is required.
  test("fieldset legend applies bottom margin when visible", async () => {
    const fieldsetCss = await readFile(join(src, "components", "fieldset.css"), "utf8");
    expect(fieldsetCss).toContain(".kb-fieldset-legend:not(.kb-sr-only)");
    expect(fieldsetCss).toContain("margin-block-end: var(--kb-fieldset-gap)");
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

  test("controls, overlays, and animated surfaces preserve state specificity, forced-colors, and reduced-motion rules", async () => {
    const read = (file: string) => readFile(join(src, "components", file), "utf8");
    const inputCss = await read("input.css");
    expect(inputCss).toContain(".kb-input[data-invalid] .kb-input-control:focus-visible");
    expect(inputCss).toContain(
      ".kb-input:not([data-invalid]) .kb-input-control:hover:not(:disabled):not(:focus-visible)",
    );
    expect(inputCss).toContain("@media (forced-colors: active)");

    const textareaCss = await read("textarea.css");
    expect(textareaCss).toContain(".kb-textarea[data-invalid] .kb-textarea-control:focus-visible");
    expect(textareaCss).toContain(".kb-textarea[data-readonly] .kb-textarea-control:focus-visible");
    expect(textareaCss).toContain(
      ".kb-textarea:not([data-invalid]) .kb-textarea-control:hover:not(:disabled):not(:focus-visible)",
    );

    const menuCss = await read("menu.css");
    expect(menuCss).toContain("@media (forced-colors: active)");
    expect(menuCss).not.toMatch(/\.kb-menu-item\[data-highlighted\]\s*\{/);
    expect(menuCss).toContain(".kb-menu-item[data-highlighted]:not([data-disabled])");

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
    expect(selectCss).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\.kb-select\[data-invalid\] \.kb-select-control/,
    );
    expect(selectCss).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\.kb-select\[data-disabled\] \.kb-select-control/,
    );

    const comboboxCss = await read("combobox.css");
    expect(comboboxCss).toMatch(
      /\.kb-combobox:not\(\[data-disabled\]\):not\(\[data-readonly\]\):not\(\[data-invalid\]\)\s+\.kb-combobox-shell:hover:not\(:focus-within\)/,
    );
    expect(comboboxCss).not.toContain("outline-color: var(--kb-color-danger)");
    expect(comboboxCss).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\.kb-combobox\[data-invalid\] \.kb-combobox-shell/,
    );

    const multiselectCss = await read("multiselect.css");
    expect(multiselectCss).toMatch(
      /\.kb-multiselect:not\(\[data-disabled\]\):not\(\[data-readonly\]\):not\(\[data-invalid\]\)\s+\.kb-multiselect-shell:hover:not\(:focus-within\)/,
    );
    expect(multiselectCss).not.toContain("outline-color: var(--kb-color-danger)");
    expect(multiselectCss).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\.kb-multiselect\[data-invalid\] \.kb-multiselect-shell/,
    );

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

    for (const file of ["dialog.css", "scrollarea.css", "tooltip.css", "callout.css"]) {
      expect(await read(file), file).toContain("@media (forced-colors: active)");
    }

    for (const file of [
      "combobox.css",
      "multiselect.css",
      "code.css",
      "spinner.css",
      "skeleton.css",
      "emptystate.css",
      "toast.css",
    ]) {
      const css = await read(file);
      expect(css, file).toContain("@media (prefers-reduced-motion: reduce)");
      expect(css, file).toContain("@media (forced-colors: active)");
    }
  });
});
