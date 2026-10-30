import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCsf } from "storybook/internal/csf-tools";
import { parseApiSection } from "./api-markdown.ts";
import { exampleCode } from "./code.ts";
import { componentGuides } from "./component-guides.ts";
import { definitions } from "./definitions.ts";
import { highlightSample } from "./highlight.ts";
import { createStylingPatches } from "./styling-copy.ts";
import type { CatalogEntry, ComponentReference } from "./types";

const reactRoot = fileURLToPath(new URL("../../../packages/react/", import.meta.url));
export const componentsRoot = resolve(reactRoot, "src/components");
export const referenceRoot = resolve(reactRoot, "docs/components");
export const guidancePath = fileURLToPath(new URL("./component-guides.ts", import.meta.url));

export function loadComponentReferences(): Record<string, ComponentReference> {
  return Object.fromEntries(
    Object.entries(definitions).map(([name, definition]) => {
      const guide = readFileSync(resolve(referenceRoot, `${name}.md`), "utf8");
      const guidance = componentGuides[name];
      if (!guidance) throw new Error(`Add usage and accessibility guidance for ${name}`);
      const tables = parseApiSection(guide, name).filter((block) => block.kind === "table");
      if (!tables.length) throw new Error(`Add a prop or composition table for ${name}`);
      return [name, { name, description: definition.description, guide: guidance, tables }];
    }),
  );
}

const storiesCache = new Map<
  string,
  {
    mtimeMs: number;
    csf: ReturnType<ReturnType<typeof loadCsf>["parse"]>;
    stories: CatalogEntry["stories"];
  }
>();

export function loadCatalogSources(): CatalogEntry[] {
  const folders = readdirSync(componentsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  return folders.map((name) => {
    const guide = readFileSync(resolve(referenceRoot, `${name}.md`), "utf8");
    const definition = definitions[name];
    if (!definition) throw new Error(`Add catalog metadata for ${name}`);
    const path = resolve(componentsRoot, name, `${name}.stories.tsx`);
    const mtimeMs = statSync(path).mtimeMs;
    let cached = storiesCache.get(path);
    if (!cached || cached.mtimeMs !== mtimeMs) {
      const csf = loadCsf(readFileSync(path, "utf8"), {
        fileName: path,
        makeTitle: (title) => title,
      }).parse();
      const defaultId = (
        csf.stories.find((story) => /--(default|primary|confirm|on-hover)$/.test(story.id)) ??
        csf.stories[0]
      )?.id;
      const stories = csf.stories.map((story) => {
        const localName =
          story.localName ??
          Object.keys(csf._stories).find((key) => csf._stories[key]?.id === story.id) ??
          "";
        const sample = highlightSample({
          id: story.id,
          name: story.name ?? story.localName ?? story.id,
          ...exampleCode(csf, localName, name),
        });
        return {
          ...sample,
          styling: Object.hasOwn(definition.examples, localName)
            ? createStylingPatches(name, sample.code, story.id === defaultId)
            : [],
        };
      });
      cached = { mtimeMs, csf, stories };
      storiesCache.set(path, cached);
    }
    const { csf, stories } = cached;
    const first =
      stories.find((story) => /--(default|primary|confirm|on-hover)$/.test(story.id)) ?? stories[0];
    if (!first) throw new Error(`Missing Storybook examples: ${name}`);
    const examples = Object.entries(definition.examples).map(([exportName, label]) => {
      const story = csf._stories[exportName];
      if (!story) throw new Error(`Unknown catalog example: ${name}.${exportName}`);
      return { id: story.id, name: label };
    });
    if (!examples.some((example) => example.id === first.id))
      throw new Error(`Default catalog example missing: ${name}`);
    const heading = name;
    return {
      id: name.toLowerCase(),
      name,
      group: definition.group,
      description: definition.description,
      apiHeading: heading,
      api: parseApiSection(guide, heading),
      stories,
      examples,
      defaultStoryId: first.id,
      docsId: `${first.id.split("--")[0]}--docs`,
    };
  });
}
