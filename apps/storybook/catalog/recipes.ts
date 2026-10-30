import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { babelParseFile, loadCsf } from "storybook/internal/csf-tools";
import { type RecipeDefinition, recipeDefinitions, systemGuide } from "./content.ts";
import { definitions } from "./definitions.ts";
import { highlightSample } from "./highlight.ts";
import type { RecipeReference } from "./types";

const root = fileURLToPath(new URL("../../../", import.meta.url));

export function loadRecipeSources(
  directory = root,
  registry: RecipeDefinition[] = recipeDefinitions,
): RecipeReference[] {
  return registry.map((definition) => {
    for (const component of definition.components)
      if (!definitions[component]) throw new Error(`Unknown recipe component: ${component}`);
    const path = resolve(directory, definition.storyFile);
    const csf = loadCsf(readFileSync(path, "utf8"), {
      fileName: path,
      makeTitle: (title) => title,
    }).parse();
    const stories = csf.stories.map((story) => ({
      id: story.id,
      name: story.name ?? story.localName ?? story.id,
      exportName: Object.keys(csf._stories).find((key) => csf._stories[key]?.id === story.id) ?? "",
    }));
    if (!stories.some((story) => story.id === definition.defaultStoryId))
      throw new Error(`Missing default recipe story: ${definition.defaultStoryId}`);
    const files: RecipeReference["files"] = definition.files.map((path) => {
      const code = readFileSync(resolve(directory, path), "utf8");
      return {
        path,
        name: path.split("/").at(-1) ?? path,
        language: path.endsWith(".css") ? "CSS" : "React",
        sample: highlightSample({ code, snippet: code }, path.endsWith(".css") ? "css" : "tsx"),
      };
    });
    const provided = new Set(files.map((file) => resolve(directory, file.path)));
    for (const file of files.filter((file) => file.language === "React")) {
      for (const node of babelParseFile({ code: file.sample.code }).ast.program.body) {
        if (node.type !== "ImportDeclaration" || !node.source.value.startsWith(".")) continue;
        const dependency = resolve(directory, dirname(file.path), node.source.value);
        if (
          ![
            dependency,
            `${dependency}.tsx`,
            `${dependency}.ts`,
            `${dependency}/index.tsx`,
            `${dependency}/index.ts`,
          ].some((path) => provided.has(path))
        )
          throw new Error(
            `Missing recipe source dependency: ${file.path} imports ${node.source.value}`,
          );
      }
    }
    return {
      ...definition,
      kind: "recipe",
      docsId: `${definition.defaultStoryId.split("--")[0]}--docs`,
      markdown: readFileSync(resolve(directory, definition.guide), "utf8"),
      stories,
      files,
    };
  });
}

export function loadSystemContent() {
  return { recipes: loadRecipeSources(), guide: readFileSync(resolve(root, systemGuide), "utf8") };
}

export const recipeSourceFiles = [
  systemGuide,
  ...recipeDefinitions.flatMap((entry) => [entry.guide, entry.storyFile, ...entry.files]),
].map((path) => resolve(root, path));
