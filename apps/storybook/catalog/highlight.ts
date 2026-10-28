import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import css from "shiki/langs/css.mjs";
import html from "shiki/langs/html.mjs";
import shellscript from "shiki/langs/shellscript.mjs";
import tsx from "shiki/langs/tsx.mjs";
import type { CodeSample, CodeToken, SyntaxKind } from "./types";

// Semantic names leave presentation in CSS; editors load grammars lazily.
const scopes: Record<SyntaxKind, string[]> = {
  keyword: ["keyword", "storage", "constant.language"],
  string: ["string"],
  comment: ["comment"],
  number: ["constant.numeric", "constant.other.color"],
  tag: ["entity.name.tag", "support.class.component", "entity.other.attribute-name.class.css"],
  attribute: [
    "entity.other.attribute-name",
    "support.type.property-name.css",
    "constant.other.option",
  ],
  type: ["entity.name.type", "support.type", "support.class"],
  function: ["entity.name.function", "support.function"],
};
const names = new Map(
  Object.keys(scopes).map((kind) => [`var(--syntax-${kind})`, kind as SyntaxKind]),
);
const highlighter = await createHighlighterCore({
  langs: [...tsx, ...css, ...html, ...shellscript],
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

export type CodeLanguage = "tsx" | "css" | "html" | "shellscript";

export function highlightCode(code: string, language: CodeLanguage = "tsx"): CodeToken[] {
  const result: CodeToken[] = [];
  const { tokens } = highlighter.codeToTokens(code, { lang: language, theme: "kbui-paper" });
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

export function highlightSample(
  source: { code: string; snippet: string },
  language: CodeLanguage = "tsx",
): CodeSample {
  return {
    ...source,
    tokens: highlightCode(source.code, language),
    snippetTokens: highlightCode(source.snippet, language),
  };
}
