import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { babelParseFile } from "storybook/internal/csf-tools";

export function extractDocumentationExamples(markdown: string): string[] {
  const examples: string[] = [];
  for (const match of markdown.matchAll(/```tsx[^\n]*\r?\n([\s\S]*?)```/g)) {
    const code = match[1] ?? "";
    if (!/\bimport\b/.test(code) || !/\bexport\b/.test(code)) continue;
    const body = babelParseFile({ code }).ast.program.body;
    if (
      body.some((node) => node.type === "ImportDeclaration") &&
      body.some(
        (node) =>
          node.type === "ExportNamedDeclaration" || node.type === "ExportDefaultDeclaration",
      )
    )
      examples.push(code);
  }
  return examples;
}

export function loadDocumentationExamples(root: string) {
  return [
    "README.md",
    "docs/guides/using-kbui.md",
    "apps/storybook/docs/Introduction.mdx",
    "packages/react/README.md",
    ...readdirSync(join(root, "packages/react/docs/components"))
      .filter((name) => name.endsWith(".md"))
      .sort()
      .map((name) => `packages/react/docs/components/${name}`),
    "docs/guides/copyable-content.md",
    "docs/guides/number-fields.md",
    "docs/guides/file-inputs.md",
    "docs/guides/forms-and-overlays.md",
  ].flatMap((path) => {
    const examples = extractDocumentationExamples(readFileSync(join(root, path), "utf8"));
    if (!examples.length) throw new Error(`Missing complete React example in ${path}`);
    return examples.map((code, index) => ({
      id: `documentation-${path.replaceAll(/[^a-z0-9]/gi, "-")}-${index}`,
      code,
      snippet: code,
    }));
  });
}
