import { cpSync, mkdirSync, rmSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";

const entries = [
  "index.html",
  "setup/index.html",
  "setup/themes/index.html",
  "compare/index.html",
  "components/index.html",
  "examples/index.html",
  "playground/index.html",
  "storybook/index.html",
  "storybook/iframe.html",
  "storybook/index.json",
];

export function stageSite(source: string, destination: string): void {
  const from = resolve(source);
  const to = resolve(destination);
  const outside = (path: string) => path.startsWith("..") || isAbsolute(path);
  if (!outside(relative(from, to)) || !outside(relative(to, from)))
    throw new Error("Staging destination overlaps source");
  for (const entry of entries) {
    try {
      if (!statSync(join(from, entry)).isFile()) throw new Error("Not a file");
    } catch {
      throw new Error(`Missing site entry: ${entry}`);
    }
  }
  rmSync(to, { recursive: true, force: true });
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

if (import.meta.main) {
  const root = resolve(import.meta.dir, "..");
  stageSite(join(root, "apps/storybook/dist"), join(root, "deployment/site/public"));
  console.log("Staged site at deployment/site/public/");
}
