import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { babelParseFile } from "storybook/internal/csf-tools";
import { buildCss, paletteRefsIn, rawStyleValuesIn } from "../../../packages/css/src/build";
import { recipeDefinitions } from "../catalog/content";

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
  expect(files).toEqual(["inbox.css", "list-detail.css", "recipes.css"]);
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

const ownersOf = (file: string) =>
  recipeDefinitions.filter((recipe) => recipe.files.includes(`apps/storybook/recipes/${file}`));
const prefixesOf = (file: string) => {
  const owners = ownersOf(file);
  if (owners.length > 1 && owners.every((recipe) => !recipe.flow))
    return owners.map((recipe) => recipe.name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase());
  return owners.map(() => file.replace(/\.css$/, ""));
};

// Read static class strings from rendered root and public-slot props.
const sourceClasses = async (file: string) => {
  const classes = new Set<string>();
  const paths = new Set(
    ownersOf(file).flatMap((recipe) => recipe.files.filter((p) => p.endsWith(".tsx"))),
  );
  for (const path of paths) {
    const code = await readFile(new URL(`../../../${path}`, import.meta.url), "utf8");
    babelParseFile({ code }).path.traverse({
      JSXAttribute(path) {
        const name = path.node.name;
        if (
          name.type !== "JSXIdentifier" ||
          (name.name !== "className" && name.name !== "classNames")
        )
          return;
        path.traverse({
          StringLiteral({ node }) {
            for (const part of node.value.split(/\s+/).filter(Boolean)) classes.add(part);
          },
        });
      },
    });
  }
  return classes;
};

describe.each(files)("%s", (file) => {
  const read = () => readFile(join(recipes, file), "utf8");
  const prefixes = prefixesOf(file);

  test("recipe css starts with an anatomy comment listing every class", async () => {
    const { anatomy, classes, body } = anatomyOf(await read());
    expect(anatomy, "line 1 must be /* Anatomy: … */").not.toBe("");
    for (const c of ownClasses(body))
      expect(classes.has(c), `${file}: .${c} not in anatomy`).toBe(true);
    // Anatomy may name unstyled parts, but only ones the recipe renders.
    const rendered = await sourceClasses(file);
    for (const c of classes) expect(rendered.has(c), `${file}: .${c} not rendered`).toBe(true);
  });

  test("recipe classes use their registered owner prefixes", async () => {
    expect(prefixes.length, `${file}: no registered owner`).toBeGreaterThan(0);
    const { classes, body } = anatomyOf(await read());
    for (const c of [...classes, ...ownClasses(body)])
      expect(
        prefixes.some((prefix) => c === prefix || c.startsWith(`${prefix}-`)),
        `${file}: .${c}`,
      ).toBe(true);
  });

  test("recipe regions use shared part names", async () => {
    const { classes, regions } = anatomyOf(await read());
    const part = (c: string) => regionParts.find((p) => c.endsWith(`-${p}`));
    const expected = ownersOf(file).some((recipe) => recipe.flow) ? regionParts : [];
    expect([...regions].map(part).sort()).toEqual([...expected].sort());
    for (const c of classes)
      if (!regions.has(c) && !prefixes.includes(c))
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
