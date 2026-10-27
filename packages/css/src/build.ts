import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { bundle, transform } from "lightningcss";

const VAR = /var\(\s*(--kb-[a-z0-9-]+)/gi;
const PALETTE = /^--kb-(?:white|black|gray|blue|red|amber|green|teal)(?:-|$)/i;
const RAW_COLOR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch)\(/gi;

export async function componentFiles(src: string): Promise<string[]> {
  const dir = join(src, "components");
  return (await readdir(dir))
    .filter((f) => f.endsWith(".css"))
    .sort()
    .map((f) => join(dir, f));
}

// First comment line is the contract: "/* Anatomy: .kb-x [data-...] > .kb-x-part */".
export async function anatomyRoots(src: string): Promise<string[]> {
  const roots: string[] = [];
  for (const file of await componentFiles(src)) {
    const [first = "", ...rest] = (await readFile(file, "utf8")).split("\n");
    const m = first.match(/^\/\* Anatomy: (\.kb-[a-z0-9-]+)/);
    if (!m) throw new Error(`${file}: first line must be an Anatomy comment`);
    const root = m[1] as string;
    if (!new RegExp(`${root.replace(/\./g, "\\.")}(?![a-z0-9-])`).test(rest.join("\n"))) {
      throw new Error(`${file}: anatomy root ${root} not found in selectors`);
    }
    roots.push(root);
  }
  return roots;
}

// Denylist: palette primitives and raw color literals; other token groups pass.
export async function paletteRefs(src: string): Promise<string[]> {
  const hits: string[] = [];
  for (const file of [join(src, "reset.css"), ...(await componentFiles(src))]) {
    const css = await readFile(file, "utf8");
    for (const m of css.matchAll(VAR)) {
      if (PALETTE.test(m[1] as string)) hits.push(`${file}: ${m[0]}`);
    }
    for (const m of css.matchAll(RAW_COLOR)) hits.push(`${file}: ${m[0]}`);
  }
  return hits;
}

// Skin-facing properties must read tokens; hairlines (<=2px), zero and em stay literal.
const SKIN_PROP =
  /^(?:font-size|font-weight|(?:min-)?(?:height|width|block-size|inline-size)|padding(?:-[a-z-]+)?|(?:row-|column-)?gap|border-radius|(?:transition|animation)(?:-duration|-timing-function)?)$/;
const DECL = /(?:^|[;{\s])([a-z-]+)\s*:\s*([^;{}]+)(?=[;}])/g;
const LENGTH = /(?<![\w.-])(\d*\.?\d+)(px|rem)\b/g;
const TIME = /(?<![\w.-])(\d*\.?\d+)m?s\b/g;
const EASING =
  /(?<![\w-])(?:ease(?:-in|-out|-in-out)?|linear|step-start|step-end)(?![\w-])|cubic-bezier\(|steps\(/g;
const WEIGHT = /^(?:\d{3}|bold|bolder|lighter|normal)$/;

export async function rawSkinValues(src: string): Promise<string[]> {
  const hits: string[] = [];
  for (const file of [join(src, "reset.css"), ...(await componentFiles(src))]) {
    const css = (await readFile(file, "utf8")).replace(/\/\*[\s\S]*?\*\//g, "");
    for (const [, prop = "", raw = ""] of css.matchAll(DECL)) {
      if (!SKIN_PROP.test(prop)) continue;
      const value = raw.replace(/var\([^)]*\)/g, "").trim();
      const found: string[] = [];
      for (const [lit, n, unit] of value.matchAll(LENGTH)) {
        if (Number(n) !== 0 && (unit === "rem" || Number(n) > 2)) found.push(lit);
      }
      for (const [lit, n] of value.matchAll(TIME)) if (Number(n) !== 0) found.push(lit);
      for (const [lit] of value.matchAll(EASING)) found.push(lit.replace("(", ""));
      if (prop === "font-weight" && WEIGHT.test(value)) found.push(value);
      for (const lit of found) hits.push(`${file}: ${prop}: ${lit}`);
    }
  }
  return hits;
}

export async function buildCss(src: string, dist: string): Promise<void> {
  await rm(dist, { recursive: true, force: true });
  await mkdir(join(dist, "components"), { recursive: true });
  const bundled = bundle({ filename: join(src, "styles.css"), minify: true });
  await writeFile(join(dist, "styles.css"), bundled.code);
  const single = async (from: string, to: string) => {
    const code = await readFile(from);
    const out = transform({ filename: from, code, minify: true });
    await writeFile(to, out.code);
  };
  await single(join(src, "reset.css"), join(dist, "reset.css"));
  for (const file of await componentFiles(src)) {
    await single(file, join(dist, "components", basename(file)));
  }
}
