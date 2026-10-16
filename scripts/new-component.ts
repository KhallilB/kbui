import { access, appendFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const templates = new URL("../templates/component/", import.meta.url).pathname;

const exists = (p: string) =>
  access(p).then(
    () => true,
    () => false,
  );

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
  await appendFile(
    join(root, "packages/react/src/index.ts"),
    `export { ${name}, type ${name}Props } from "./components/${name}/${name}";\n`,
  );
  await appendFile(
    join(root, "packages/css/src/styles.css"),
    `@import "./components/${lower}.css";\n`,
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
