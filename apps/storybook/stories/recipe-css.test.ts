import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildCss, paletteRefsIn, rawStyleValuesIn } from "../../../packages/css/src/build";

const recipes = new URL("../recipes/", import.meta.url).pathname;
const cssSrc = new URL("../../../packages/css/src/", import.meta.url).pathname;
// Shared by the retiring PageHeader and FormSection recipes; absent once retired.
const unguarded = new Set(["recipes.css"]);

// readdir order is platform-dependent.
const files = (await readdir(recipes))
  .filter((f) => f.endsWith(".css") && !unguarded.has(f))
  .sort();

// Recipe's own classes; `.kb-*` are package parts it restyles, not its anatomy.
const ownClasses = (text: string) =>
  new Set(
    [...text.matchAll(/\.([a-z][a-z0-9-]*)/g)]
      .map((m) => m[1])
      .filter((c) => !c?.startsWith("kb-")),
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

describe.each(files)("%s", (file) => {
  const read = () => readFile(join(recipes, file), "utf8");

  test("recipe css starts with an anatomy comment listing every class", async () => {
    const [first = "", ...rest] = (await read()).split("\n");
    const anatomy = first.match(/^\/\* Anatomy: (.+) \*\/$/)?.[1];
    expect(anatomy, "line 1 must be /* Anatomy: … */").toBeDefined();
    const body = rest.join("\n").replace(/\/\*[\s\S]*?\*\//g, "");
    expect([...ownClasses(anatomy ?? "")].sort()).toEqual([...ownClasses(body)].sort());
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
