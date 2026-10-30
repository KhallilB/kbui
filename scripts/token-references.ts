import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { buildTokens, type TokenTree } from "../packages/tokens/src/build";

export const RUNTIME_KB_VARS: ReadonlySet<string> = new Set([
  "--kb-panel-size",
  "--kb-switch-off-color",
  "--kb-switch-on-color",
]);

const COMMENT_RE = /\/\*[\s\S]*?\*\//g;
const KB_DECL_RE = /(--kb-[a-z0-9-]+)\s*:/g;
const KB_REF_RE = /(--kb-[a-z0-9-]+)(?![a-z0-9-]|\s*:)/g;

export function extractKbTokenReferences(css: string): string[] {
  const uncommented = css.replace(COMMENT_RE, "");
  return [...uncommented.matchAll(KB_REF_RE)].map((match) => match[1] as string);
}

export function findUndefinedKbTokenReferences(
  css: string,
  definedTokens: ReadonlySet<string>,
  allowedRuntimeVars: ReadonlySet<string> = RUNTIME_KB_VARS,
): string[] {
  const uncommented = css.replace(COMMENT_RE, "");
  const localDecls = new Set(
    [...uncommented.matchAll(KB_DECL_RE)].map((match) => match[1] as string),
  );
  const missing = new Set<string>();
  for (const ref of extractKbTokenReferences(uncommented)) {
    if (!definedTokens.has(ref) && !allowedRuntimeVars.has(ref) && !localDecls.has(ref)) {
      missing.add(ref);
    }
  }
  return [...missing];
}

async function walkCssFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkCssFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".css")) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

export async function checkRepositoryCssTokenReferences(rootDir = process.cwd()): Promise<{
  filesChecked: string[];
  violations: Array<{ file: string; undefinedTokens: string[] }>;
}> {
  const rawTokens = JSON.parse(
    await readFile(join(rootDir, "packages/tokens/tokens.json"), "utf8"),
  ) as TokenTree;
  const { css: tokenCss } = buildTokens(rawTokens);
  const definedTokens = new Set(
    [...tokenCss.matchAll(KB_DECL_RE)].map((match) => match[1] as string),
  );

  const ownedDirs = [
    join(rootDir, "packages/css/src/components"),
    join(rootDir, "apps/storybook/site"),
    join(rootDir, "apps/storybook/recipes"),
    join(rootDir, "apps/storybook/.storybook"),
  ];
  const cssPaths = [join(rootDir, "packages/css/src/reset.css")];
  for (const dir of ownedDirs) {
    cssPaths.push(...(await walkCssFiles(dir)));
  }

  const filesChecked: string[] = [];
  const violations: Array<{ file: string; undefinedTokens: string[] }> = [];

  for (const absPath of cssPaths.sort()) {
    const relPath = relative(rootDir, absPath).replaceAll("\\", "/");
    filesChecked.push(relPath);
    const content = await readFile(absPath, "utf8");
    const undefinedTokens = findUndefinedKbTokenReferences(content, definedTokens, RUNTIME_KB_VARS);
    if (undefinedTokens.length > 0) {
      violations.push({ file: relPath, undefinedTokens });
    }
  }

  return { filesChecked, violations };
}
