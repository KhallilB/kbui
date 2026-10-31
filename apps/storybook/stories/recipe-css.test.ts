import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildCss, paletteRefsIn, rawStyleValuesIn } from "../../../packages/css/src/build";

const recipes = new URL("../recipes/", import.meta.url).pathname;
const cssSrc = new URL("../../../packages/css/src/", import.meta.url).pathname;
const regionParts = ["list", "detail", "context", "status", "composer"];

// readdir order is platform-dependent.
const files = (await readdir(recipes)).filter((f) => f.endsWith(".css")).sort();

// Recipe's own classes; `.kb-*` are package parts it restyles, not its anatomy.
const ownClasses = (text: string) =>
  new Set(
    [...text.matchAll(/\.([a-z][a-z0-9-]*)/g)]
      .map((m) => m[1] as string)
      .filter((c) => !c.startsWith("kb-")),
  );

let defined: Set<string>;
let dist: string;

beforeAll(async () => {
  dist = await mkdtemp(join(tmpdir(), "kbui-recipe-css-"));
  await buildCss(cssSrc, dist);
  const bundled = await readFile(join(dist, "styles.css"), "utf8");
  defined = new Set([...bundled.matchAll(/(--kb-[a-z0-9-]+)\s*:/g)].map((m) => m[1] as string));
});

afterAll(async () => {
  await rm(dist, { recursive: true, force: true });
});

test("every recipe stylesheet is guarded", () => {
  expect(files).toEqual(["inbox.css", "list-detail.css"]);
});

const anatomyOf = (css: string) => {
  const [first = "", ...rest] = css.split("\n");
  const anatomy = first.match(/^\/\* Anatomy: (.+) \*\/$/)?.[1] ?? "";
  return {
    anatomy,
    classes: ownClasses(anatomy),
    regions: ownClasses(anatomy.split("region:")[1] ?? ""),
    body: rest.join("\n").replace(/\/\*[\s\S]*?\*\//g, ""),
  };
};

// list-detail.css belongs to ListDetail.tsx.
const sourceClasses = async (file: string) => {
  const name = file
    .replace(/\.css$/, "")
    .replace(/(^|-)([a-z])/g, (_, __, c: string) => c.toUpperCase());
  const tsx = await readFile(join(recipes, `${name}.tsx`), "utf8");
  return new Set(
    [...tsx.matchAll(/className="([^"]+)"/g)].flatMap((m) => (m[1] as string).split(/\s+/)),
  );
};

describe.each(files)("%s", (file) => {
  const read = () => readFile(join(recipes, file), "utf8");
  const prefix = file.replace(/\.css$/, "");

  test("recipe css starts with an anatomy comment listing every class", async () => {
    const { anatomy, classes, body } = anatomyOf(await read());
    expect(anatomy, "line 1 must be /* Anatomy: … */").not.toBe("");
    for (const c of ownClasses(body))
      expect(classes.has(c), `${file}: .${c} not in anatomy`).toBe(true);
    // Anatomy may name unstyled parts, but only ones the recipe renders.
    const rendered = await sourceClasses(file);
    for (const c of classes) expect(rendered.has(c), `${file}: .${c} not rendered`).toBe(true);
  });

  test("recipe classes use the stylesheet prefix", async () => {
    const { classes, body } = anatomyOf(await read());
    for (const c of [...classes, ...ownClasses(body)])
      expect(c === prefix || c.startsWith(`${prefix}-`), `${file}: .${c}`).toBe(true);
  });

  test("recipe regions use shared part names", async () => {
    const { classes, regions } = anatomyOf(await read());
    const part = (c: string) => regionParts.find((p) => c.endsWith(`-${p}`));
    expect([...regions].map(part).sort()).toEqual([...regionParts].sort());
    for (const c of classes)
      if (!regions.has(c) && c !== prefix)
        expect(part(c), `${file}: .${c} reads as a region but is not one`).toBeUndefined();
  });

  test("recipe css reads restyle values from tokens", async () => {
    expect(rawStyleValuesIn(await read(), file)).toEqual([]);
  });

  test("recipe css uses no palette primitives or raw colours", async () => {
    expect(paletteRefsIn(await read(), file)).toEqual([]);
  });

  test("recipe css references only defined tokens", async () => {
    const refs = [...(await read()).matchAll(/var\(\s*(--kb-[a-z0-9-]+)/g)].map((m) => m[1]);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(defined.has(ref as string), `${file}: ${ref}`).toBe(true);
  });

  test("seeded hex and spacing literals fail", async () => {
    const css = `${await read()}\n.x { color: #fff; padding: 12px; }\n`;
    expect(paletteRefsIn(css, file)).toEqual([`${file}: #fff`]);
    expect(rawStyleValuesIn(css, file)).toEqual([`${file}: padding: 12px`]);
  });
});
