export type Token = {
  $type: string;
  $value: string;
  $extensions?: { "kb.dark"?: string };
};
export type TokenTree = { [key: string]: Token | TokenTree };

type Flat = { path: string[]; token: Token };
type VarTree = { [key: string]: string | VarTree };

const KEY = /^[A-Za-z0-9_-]+$/;

function flatten(tree: TokenTree, prefix: string[] = []): Flat[] {
  return Object.entries(tree).flatMap(([key, node]) => {
    if (key.startsWith("$")) return [];
    if (!KEY.test(key)) throw new Error(`Invalid token key "${key}"`);
    const path = [...prefix, key];
    if ("$value" in node) {
      if (typeof node.$value !== "string") {
        throw new Error(`Token ${path.join(".")} has non-string $value`);
      }
      return [{ path, token: node as Token }];
    }
    return flatten(node as TokenTree, path);
  });
}

const varName = (path: string[]) => `--kb-${path.join("-")}`;

// Alias "{a.b}" becomes var(--kb-a-b); unknown alias is a build error, not a silent raw string.
function resolve(value: string, known: Set<string>): string {
  return value.replace(/\{([^}]+)\}/g, (_, ref: string) => {
    const name = varName(ref.split("."));
    if (!known.has(name)) throw new Error(`Unknown token alias {${ref}}`);
    return `var(${name})`;
  });
}

function block(selector: string, lines: string[], indent = ""): string {
  const body = lines.map((l) => `${indent}  ${l}`).join("\n");
  return `${indent}${selector} {\n${body}\n${indent}}`;
}

function varTree(flat: Flat[]): VarTree {
  const out: VarTree = {};
  for (const { path } of flat) {
    let node = out;
    for (const key of path.slice(0, -1)) {
      node[key] ??= {};
      node = node[key] as VarTree;
    }
    node[path.at(-1) as string] = varName(path);
  }
  return out;
}

function readonlyType(tree: VarTree, indent = ""): string {
  const inner = `${indent}  `;
  const props = Object.entries(tree).map(([key, value]) =>
    typeof value === "string"
      ? `${inner}readonly ${JSON.stringify(key)}: ${JSON.stringify(value)};`
      : `${inner}readonly ${JSON.stringify(key)}: ${readonlyType(value, inner)};`,
  );
  return `{\n${props.join("\n")}\n${indent}}`;
}

export function buildTokens(tree: TokenTree): {
  css: string;
  ts: string;
  js: string;
  dts: string;
} {
  const flat = flatten(tree);
  const seen = new Set<string>();
  for (const { path } of flat) {
    const name = varName(path);
    if (seen.has(name)) throw new Error(`Duplicate token var ${name}`);
    seen.add(name);
  }
  const light = flat.map((f) => `${varName(f.path)}: ${resolve(f.token.$value, seen)};`);
  const dark = flat.flatMap((f) => {
    const value = f.token.$extensions?.["kb.dark"];
    return value ? [`${varName(f.path)}: ${resolve(value, seen)};`] : [];
  });
  const sections = [block(":root", light)];
  if (dark.length > 0) {
    sections.push(
      block('[data-theme="dark"]', dark),
      `@media (prefers-color-scheme: dark) {\n${block(':root:not([data-theme="light"])', dark, "  ")}\n}`,
    );
  }
  const vars = varTree(flat);
  const obj = JSON.stringify(vars, null, 2);
  return {
    css: `${sections.join("\n\n")}\n`,
    ts: `export const tokens = ${obj} as const;\n`,
    js: `export const tokens = ${obj};\n`,
    dts: `export declare const tokens: ${readonlyType(vars)};\n`,
  };
}
