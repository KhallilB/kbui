import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const templates = new URL("../templates/component/", import.meta.url).pathname;

const exists = (p: string) =>
  access(p).then(
    () => true,
    () => false,
  );

const specifier = (stmt: string) => stmt.match(/"([^"]*)"\s*;?\s*$/)?.[1] ?? "";

// Sorted slots only: other statements keep their position.
async function addSorted(file: string, line: string, sortable: (stmt: string) => boolean) {
  const stmts: string[] = [];
  let open: string[] = [];
  for (const l of (await readFile(file, "utf8")).split("\n")) {
    if (!open.length && l === "") continue;
    open.push(l);
    if (l.trimEnd().endsWith(";")) {
      stmts.push(open.join("\n"));
      open = [];
    }
  }
  if (open.length) stmts.push(open.join("\n"));
  stmts.push(line);
  const sorted = stmts.filter(sortable).sort((x, y) => (specifier(x) < specifier(y) ? -1 : 1));
  const out = stmts.map((st) => (sortable(st) ? (sorted.shift() as string) : st));
  await writeFile(file, `${out.join("\n")}\n`);
}

export async function newComponent(name: string, root = process.cwd()): Promise<void> {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) throw new Error(`"${name}" must be PascalCase`);
  const lower = name.toLowerCase();
  const reactDir = join(root, "packages/react/src/components", name);
  const cssFile = join(root, "packages/css/src/components", `${lower}.css`);
  if ((await exists(reactDir)) || (await exists(cssFile)))
    throw new Error(`${name} already exists`);

  await mkdir(reactDir, { recursive: true });
  const fill = (s: string) => s.replaceAll("__Name__", name).replaceAll("__name__", lower);
  for (const file of await readdir(templates)) {
    const body = fill(await readFile(join(templates, file), "utf8"));
    const target = file.endsWith(".css") ? cssFile : join(reactDir, fill(file));
    await writeFile(target, body);
  }
  await addSorted(
    join(root, "packages/react/src/index.ts"),
    `export { ${name}, type ${name}Props } from "./components/${name}/${name}";`,
    (s) => s.startsWith("export "),
  );
  await addSorted(
    join(root, "packages/css/src/styles.css"),
    `@import "./components/${lower}.css";`,
    (s) => s.includes("./components/"),
  );
}

if (import.meta.main) {
  const name = process.argv[2];
  if (!name) {
    console.error("usage: bun run new <ComponentName>");
    process.exit(1);
  }
  await newComponent(name);
  console.log(
    `created ${name}: packages/react/src/components/${name}, packages/css/src/components/${name.toLowerCase()}.css`,
  );
}
