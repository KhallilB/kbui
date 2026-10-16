import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { bundle, transform } from "lightningcss";

const PALETTE = /var\(--kb-(?:gray|blue|red|white|black)(?:-\d+)?\)/g;

export async function componentFiles(src: string): Promise<string[]> {
  const dir = join(src, "components");
  return (await readdir(dir)).filter((f) => f.endsWith(".css")).map((f) => join(dir, f));
}

// First comment line is the contract: "/* Anatomy: .kb-x [data-...] > .kb-x-part */".
export async function anatomyRoots(src: string): Promise<string[]> {
  const roots: string[] = [];
  for (const file of await componentFiles(src)) {
    const first = (await readFile(file, "utf8")).split("\n")[0] ?? "";
    const m = first.match(/^\/\* Anatomy: (\.kb-[a-z-]+)/);
    if (!m) throw new Error(`${file}: first line must be an Anatomy comment`);
    roots.push(m[1] as string);
  }
  return roots;
}

export async function paletteRefs(src: string): Promise<string[]> {
  const hits: string[] = [];
  for (const file of await componentFiles(src)) {
    const css = await readFile(file, "utf8");
    for (const m of css.matchAll(PALETTE)) hits.push(`${file}: ${m[0]}`);
  }
  return hits;
}

export async function buildCss(src: string, dist: string): Promise<void> {
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
    await single(file, join(dist, "components", file.split("/").pop() as string));
  }
}
