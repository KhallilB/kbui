import { format } from "prettier/standalone";

export async function formatEditorCode(source: string, language: "tsx" | "css" | "classes") {
  if (language === "classes") return source.trim().replace(/\s+/g, " ");
  const plugins =
    language === "css"
      ? [await import("prettier/plugins/postcss")]
      : await Promise.all([import("prettier/plugins/babel"), import("prettier/plugins/estree")]);
  return format(source, {
    parser: language === "tsx" ? "babel-ts" : "css",
    plugins,
    tabWidth: 2,
    printWidth: 80,
  });
}
