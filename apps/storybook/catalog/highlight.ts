import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import tsx from "shiki/langs/tsx.mjs";
import type { CodeSample, CodeToken, SyntaxKind } from "./types";

// Grammar stays build-only; semantic names leave presentation in CSS.
const scopes: Record<SyntaxKind, string[]> = {
  keyword: ["keyword", "storage", "constant.language"],
  string: ["string"],
  comment: ["comment"],
  number: ["constant.numeric"],
  tag: ["entity.name.tag", "support.class.component"],
  attribute: ["entity.other.attribute-name"],
  type: ["entity.name.type", "support.type", "support.class"],
  function: ["entity.name.function", "support.function"],
};
const names = new Map(
  Object.keys(scopes).map((kind) => [`var(--syntax-${kind})`, kind as SyntaxKind]),
);
const highlighter = await createHighlighterCore({
  langs: tsx,
  themes: [
    {
      name: "kbui-paper",
      settings: [
        { settings: { foreground: "#303b31", background: "#fffdf5" } },
        ...Object.entries(scopes).map(([kind, scope]) => ({
          scope,
          settings: { foreground: `var(--syntax-${kind})` },
        })),
      ],
    },
  ],
  // Bun's JS regex engine mis-tokenizes TSX; Oniguruma matches Node and Bun.
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

export function highlightCode(code: string): CodeToken[] {
  const result: CodeToken[] = [];
  const { tokens } = highlighter.codeToTokens(code, { lang: "tsx", theme: "kbui-paper" });
  for (const line of tokens) {
    for (const token of line) {
      const kind = names.get(token.color ?? "");
      if (!kind || !token.content.length) continue;
      const start = token.offset;
      const end = start + token.content.length;
      const previous = result.at(-1);
      if (previous && previous[1] === start && previous[2] === kind) previous[1] = end;
      else result.push([start, end, kind]);
    }
  }
  return result;
}

export function highlightSample(source: { code: string; snippet: string }): CodeSample {
  return {
    ...source,
    tokens: highlightCode(source.code),
    snippetTokens: highlightCode(source.snippet),
  };
}
