import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const templates = join(import.meta.dir, "../templates/component");

const exists = (p: string) =>
  access(p).then(
    () => true,
    () => false,
  );

const specifier = (stmt: string) => stmt.match(/"([^"]*)"[^"]*$/)?.[1] ?? "";

// Sorted slots only: other statements and blank lines keep their position.
async function withLine(file: string, line: string, sortable: (stmt: string) => boolean) {
  const stmts: string[] = [];
  let open: string[] = [];
  for (const l of (await readFile(file, "utf8")).replace(/\n$/, "").split("\n")) {
    if (!open.length && l === "") {
      stmts.push("");
      continue;
    }
    open.push(l);
    if (l.trimEnd().endsWith(";")) {
      stmts.push(open.join("\n"));
      open = [];
    }
  }
  if (open.length) throw new Error(`Unterminated statement in ${file}`);
  stmts.push(line);
  const sorted = stmts.filter(sortable).sort((x, y) => (specifier(x) < specifier(y) ? -1 : 1));
  const out = stmts.map((st) => (sortable(st) ? (sorted.shift() as string) : st));
  return `${out.join("\n")}\n`;
}

export async function newComponent(name: string, root = process.cwd()): Promise<void> {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) throw new Error(`"${name}" must be PascalCase`);
  const lower = name.toLowerCase();
  const reactDir = join(root, "packages/react/src/components", name);
  const cssDir = join(root, "packages/css/src/components");
  const cssFile = join(cssDir, `${lower}.css`);
  if ((await exists(reactDir)) || (await exists(cssFile)))
    throw new Error(`${name} already exists`);

  const indexFile = join(root, "packages/react/src/index.ts");
  const stylesFile = join(root, "packages/css/src/styles.css");
  const index = await withLine(
    indexFile,
    `export { ${name}, type ${name}Props } from "./components/${name}/${name}";`,
    (s) => s.startsWith("export "),
  );
  const styles = await withLine(
    stylesFile,
    `@import "./components/${lower}.css" layer(kbui.components);`,
    (s) => s.includes("./components/"),
  );

  await mkdir(reactDir, { recursive: true });
  await mkdir(cssDir, { recursive: true });
  const fill = (s: string) => s.replaceAll("__Name__", name).replaceAll("__name__", lower);
  for (const file of (await readdir(templates)).filter((f) => !f.startsWith("."))) {
    const body = fill(await readFile(join(templates, file), "utf8"));
    const target = file.endsWith(".css") ? cssFile : join(reactDir, fill(file));
    await writeFile(target, body);
  }
  await writeFile(indexFile, index);
  await writeFile(stylesFile, styles);
}

if (import.meta.main) {
  const name = process.argv[2];
  if (!name) {
    console.error("usage: bun run new <ComponentName>");
    process.exit(1);
  }
  try {
    await newComponent(name);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
  console.log(
    `created ${name}: packages/react/src/components/${name}, packages/css/src/components/${name.toLowerCase()}.css`,
  );
  console.log("next: bun run lint:fix");
}
