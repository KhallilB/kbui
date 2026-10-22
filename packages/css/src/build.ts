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
