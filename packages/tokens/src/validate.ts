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

const SUPPORTED_TYPES = new Set([
  "color",
  "dimension",
  "fontFamily",
  "fontWeight",
  "duration",
  "cubicBezier",
  "gradient",
  "shadow",
  "string",
  "number",
]);

const WHOLE_ALIAS_COMPAT: Record<string, string[]> = {
  color: ["color"],
  dimension: ["dimension"],
  fontFamily: ["fontFamily"],
  fontWeight: ["fontWeight", "number"],
  duration: ["duration"],
  cubicBezier: ["cubicBezier"],
  gradient: ["gradient", "color"],
  shadow: ["shadow"],
  number: ["number"],
  string: ["string", "cubicBezier", "dimension", "fontFamily"],
};

const COMPOSITE_ALIAS_COMPAT: Record<string, string[]> = {
  color: ["color", "number"],
  dimension: ["dimension", "number"],
  gradient: ["gradient", "color", "dimension"],
  shadow: ["shadow", "color", "dimension"],
};

const COLOR_KEYWORDS = new Set([
  "transparent",
  "currentColor",
  "inherit",
  "Canvas",
  "CanvasText",
  "LinkText",
  "VisitedText",
  "ActiveText",
  "ButtonFace",
  "ButtonText",
  "ButtonBorder",
  "Field",
  "FieldText",
  "Highlight",
  "HighlightText",
  "SelectedItem",
  "SelectedItemText",
  "Mark",
  "MarkText",
  "GrayText",
  "AccentColor",
  "AccentColorText",
]);

function hasBalancedParens(value: string): boolean {
  let depth = 0;
  for (const ch of value) {
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      depth -= 1;
      if (depth < 0) return false;
    }
  }
  return depth === 0;
}

function isValidColorValue(value: string): boolean {
  if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)) {
    return true;
  }
  if (COLOR_KEYWORDS.has(value)) return true;
  if (
    !/^(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color|color-mix|light-dark)\(.+\)$/.test(value) ||
    !hasBalancedParens(value)
  ) {
    return false;
  }
  if (/^rgba?\(/i.test(value)) {
    const inner = value.slice(value.indexOf("(") + 1, -1).split("/")[0] ?? "";
    const channels = [...inner.matchAll(/-?\d+(?:\.\d+)?%?/g)].map((m) => m[0]);
    if (channels.length < 3) return false;
    for (const ch of channels.slice(0, 3)) {
      const num = Number.parseFloat(ch);
      const max = ch.endsWith("%") ? 100 : 255;
      if (Number.isNaN(num) || num < 0 || num > max) return false;
    }
  }
  return true;
}

function isValidValueForType(type: string, rawValue: string): boolean {
  const value = rawValue.trim();
  if (!value || !hasBalancedParens(value)) return false;
  if (/^\{[^}]+\}$/.test(value)) return true;

  switch (type) {
    case "color":
      return isValidColorValue(value);
    case "dimension":
      return (
        /^(?:0|-?\d+(?:\.\d+)?(?:px|rem|em|ch|ex|vh|vw|vmin|vmax|svh|dvh|lvh|cqi|cqw|%))$/.test(
          value,
        ) || /^(?:calc|min|max|clamp)\(.+\)$/.test(value)
      );
    case "duration":
      return /^(?:0|\d+(?:\.\d+)?(?:ms|s))$/.test(value);
    case "fontWeight":
      return /^(?:[1-9]00|normal|bold|bolder|lighter)$/.test(value);
    case "fontFamily":
      return !/[;{}]/.test(value) && (value.match(/"/g)?.length ?? 0) % 2 === 0;
    case "cubicBezier": {
      if (/^(?:linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end)$/.test(value)) {
        return true;
      }
      const match =
        /^cubic-bezier\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)$/.exec(
          value,
        );
      if (!match) return false;
      const x1 = Number(match[1]);
      const x2 = Number(match[3]);
      return x1 >= 0 && x1 <= 1 && x2 >= 0 && x2 <= 1;
    }
    case "number":
      return /^-?\d+(?:\.\d+)?(?:\s*\/\s*[1-9]\d*(?:\.\d+)?)?$/.test(value);
    case "gradient":
      return (
        value === "none" || /^(?:repeating-)?(?:linear|radial|conic)-gradient\(.+\)$/.test(value)
      );
    case "shadow":
      return (
        value === "none" ||
        (/^(?:inset\b|-?\d|\{[A-Za-z0-9_.-]+\})/.test(value) &&
          /(?:px|rem|em|\{[A-Za-z0-9_.-]+\})/.test(value))
      );
    case "string":
      return !value.includes(";");
    default:
      return false;
  }
}

export function validateTokenValuesAndTypes(tree: TokenTree): void {
  const flat = collectTokens(tree);
  const byId = new Map(flat.map((item) => [item.id, item.token]));

  for (const { id, token } of flat) {
    if (!token.$type || !SUPPORTED_TYPES.has(token.$type)) {
      throw new Error(`Unsupported token $type "${String(token.$type)}" at ${id}`);
    }
    const modeValues: Array<[Mode, string | undefined]> = [
      ["light", token.$value],
      ["dark", token.$extensions?.["kb.dark"]],
      ["forced", token.$extensions?.["kb.forced"]],
    ];

    for (const [mode, raw] of modeValues) {
      if (raw === undefined) continue;
      const trimmed = raw.trim();
      const wholeAlias = /^\{([^}]+)\}$/.exec(trimmed);
      if (wholeAlias) {
        const ref = wholeAlias[1] as string;
        const target = byId.get(ref);
        if (target) {
          const allowed = WHOLE_ALIAS_COMPAT[token.$type] ?? [token.$type];
          if (!allowed.includes(target.$type)) {
            throw new Error(
              `Incompatible token alias {${ref}} (${target.$type}) for ${id} (${token.$type})`,
            );
          }
        }
        continue;
      }

      for (const match of trimmed.matchAll(ALIAS_RE)) {
        const ref = match[1] as string;
        const target = byId.get(ref);
        if (target) {
          const allowed = COMPOSITE_ALIAS_COMPAT[token.$type] ?? [token.$type];
          if (!allowed.includes(target.$type)) {
            throw new Error(
              `Incompatible token alias {${ref}} (${target.$type}) for ${id} (${token.$type})`,
            );
          }
        }
      }

      if (!isValidValueForType(token.$type, trimmed)) {
        throw new Error(`Invalid ${token.$type} value "${raw}" at ${id} (${mode})`);
      }
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
