import { format } from "prettier/standalone";
import { classSourceParts } from "./class-source";

export async function formatEditorCode(source: string, language: "tsx" | "css" | "classes") {
  if (language === "classes")
    return classSourceParts(source)
      .map((part) => (part.comment ? part.text : part.text.trim().replace(/\s+/g, " ")))
      .filter(Boolean)
      .join("\n\n");
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
