export type Token = {
  $type: string;
  $value: string;
  $extensions?: { "kb.dark"?: string };
};
export type TokenTree = { [key: string]: Token | TokenTree };

type Flat = { path: string[]; token: Token };

const isToken = (node: Token | TokenTree): node is Token => typeof node.$value === "string";

function flatten(tree: TokenTree, prefix: string[] = []): Flat[] {
  return Object.entries(tree).flatMap(([key, node]) =>
    isToken(node) ? [{ path: [...prefix, key], token: node }] : flatten(node, [...prefix, key]),
  );
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

function tsTree(flat: Flat[]): string {
  const out: Record<string, unknown> = {};
  for (const { path } of flat) {
    let node = out;
    for (const key of path.slice(0, -1)) {
      node[key] ??= {};
      node = node[key] as Record<string, unknown>;
    }
    node[path.at(-1) as string] = varName(path);
  }
  return `export const tokens = ${JSON.stringify(out, null, 2)} as const;\n`;
}

export function buildTokens(tree: TokenTree): { css: string; ts: string } {
  const flat = flatten(tree);
  const known = new Set(flat.map((f) => varName(f.path)));
  const light = flat.map((f) => `${varName(f.path)}: ${resolve(f.token.$value, known)};`);
  const dark = flat.flatMap((f) => {
    const value = f.token.$extensions?.["kb.dark"];
    return value ? [`${varName(f.path)}: ${resolve(value, known)};`] : [];
  });
  const css = [
    block(":root", light),
    block('[data-theme="dark"]', dark),
    `@media (prefers-color-scheme: dark) {\n${block(':root:not([data-theme="light"])', dark, "  ")}\n}`,
  ].join("\n\n");
  return { css: `${css}\n`, ts: tsTree(flat) };
}
