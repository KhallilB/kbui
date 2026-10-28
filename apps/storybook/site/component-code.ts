import { packages, transform } from "@babel/standalone";
import type { ComponentType } from "react";

export type CodeRequest = { id: string; source: string | null };
export type CodeResult = { id: string; error?: string };

export function compileComponentExample(
  source: string,
  modules: Record<string, unknown>,
): ComponentType {
  const program = packages.parser.parse(source, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  }).program;
  for (const statement of program.body) {
    if (statement.type === "ImportDeclaration" && !Object.hasOwn(modules, statement.source.value))
      throw new Error('Imports support "react" and "@kb.ui/react" only.');
  }
  let runnable = source;
  if (!program.body.some((statement) => statement.type === "ExportDefaultDeclaration")) {
    const last = program.body.at(-1);
    if (last?.type === "ExpressionStatement") {
      runnable = `${source.slice(0, last.start ?? 0)}\nexport default function LiveExample() { return (${source.slice(last.expression.start ?? 0, last.expression.end ?? 0)}); }`;
    } else if (
      program.body.some(
        (statement) => statement.type === "FunctionDeclaration" && statement.id?.name === "Example",
      )
    ) {
      runnable += "\nexport default Example;";
    } else {
      throw new Error("End with JSX, a function named Example, or a default export.");
    }
  }
  const { code } = transform(runnable, {
    filename: "example.tsx",
    presets: [
      ["typescript", { allExtensions: true, isTSX: true }],
      ["react", { runtime: "classic" }],
    ],
    plugins: ["transform-modules-commonjs"],
  });
  const exports: { default?: ComponentType } = {};
  const requireModule = (name: string) => {
    if (!Object.hasOwn(modules, name)) throw new Error(`Unsupported import: ${name}`);
    return modules[name];
  };
  // User-authored scratch code runs only in the preview document's realm.
  new Function("require", "exports", "React", code ?? "")(requireModule, exports, modules.react);
  if (typeof exports.default !== "function") throw new Error("Default export must be a component.");
  return exports.default;
}
