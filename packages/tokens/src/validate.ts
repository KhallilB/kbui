import type { Token, TokenTree } from "./build";

type FlatToken = { id: string; token: Token };
type Mode = "light" | "dark" | "forced";

const ALIAS_RE = /\{([^}]+)\}/g;

function collectTokens(tree: TokenTree, prefix: string[] = []): FlatToken[] {
  return Object.entries(tree).flatMap(([key, node]) => {
    if (key.startsWith("$")) return [];
    const path = [...prefix, key];
    if ("$value" in node && typeof node.$value === "string") {
      return [{ id: path.join("."), token: node as Token }];
    }
    return collectTokens(node as TokenTree, path);
  });
}

function checkModeGraph(flat: FlatToken[], mode: Mode, readValue: (token: Token) => string): void {
  const edges = new Map<string, string[]>();
  for (const { id, token } of flat) {
    const refs = [...readValue(token).matchAll(ALIAS_RE)].map((match) => match[1] as string);
    edges.set(id, refs);
  }

  const state = new Map<string, 1 | 2>();
  const stack: string[] = [];

  const visit = (node: string): void => {
    state.set(node, 1);
    stack.push(node);
    for (const target of edges.get(node) ?? []) {
      if (!edges.has(target)) continue;
      const targetState = state.get(target);
      if (targetState === 1) {
        const start = stack.indexOf(target);
        const cyclePath = [...stack.slice(start), target].join(" -> ");
        throw new Error(`Token alias cycle in ${mode} mode: ${cyclePath}`);
      }
      if (targetState === undefined) {
        visit(target);
      }
    }
    stack.pop();
    state.set(node, 2);
  };

  for (const { id } of flat) {
    if (state.get(id) === undefined) {
      visit(id);
    }
  }
}

// Validate each effective mode graph independently so cross-mode rebinds stay valid.
export function validateTokenCycles(tree: TokenTree): void {
  const flat = collectTokens(tree);
  checkModeGraph(flat, "light", (token) => token.$value);
  checkModeGraph(flat, "dark", (token) => token.$extensions?.["kb.dark"] ?? token.$value);
  checkModeGraph(flat, "forced", (token) => token.$extensions?.["kb.forced"] ?? token.$value);
  checkModeGraph(
    flat,
    "forced",
    (token) => token.$extensions?.["kb.forced"] ?? token.$extensions?.["kb.dark"] ?? token.$value,
  );
}
