import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCsf } from "storybook/internal/csf-tools";
import type { Plugin } from "vite";
import { parseChangelog } from "../site/changelog-model.ts";
import {
  firstComponent,
  installCommand,
  managers,
  themeMarkup,
  themes,
} from "../site/setup-model.ts";
import { exampleCode } from "./code.ts";
import { componentGuides } from "./component-guides.ts";
import { definitions } from "./definitions.ts";
import { type CodeLanguage, highlightSample } from "./highlight.ts";
import { loadSystemContent, recipeSourceFiles } from "./recipes.ts";
import { loadSiteSamples, siteSampleFiles } from "./site-samples.ts";
import type { ApiBlock, CatalogEntry, ComponentReference } from "./types";

const reactRoot = fileURLToPath(new URL("../../../packages/react/", import.meta.url));
const componentsRoot = resolve(reactRoot, "src/components");
const referenceRoot = resolve(reactRoot, "docs/components");
const setupPath = fileURLToPath(new URL("../site/setup-model.ts", import.meta.url));
const changelogPath = fileURLToPath(new URL("../../../CHANGELOG.md", import.meta.url));
const changelogId = "\0virtual:kbui-changelog";
const virtualId = "virtual:kbui-catalog";
const sampleId = "virtual:kbui-site-samples";
const resolvedSampleId = "\0virtual:kbui-site-samples";
const resolvedId = `\0${virtualId}`;
const referenceId = "\0virtual:kbui-reference";
const systemId = "\0virtual:kbui-system";
const guidancePath = fileURLToPath(new URL("./component-guides.ts", import.meta.url));

function cells(line: string): string[] {
  return line
    .trim()
    .slice(1, -1)
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll("\\|", "|"));
}

export function parseApiSection(guide: string, heading: string, rowName?: string): ApiBlock[] {
  const section = guide.startsWith(`# ${heading}\n`)
    ? guide.slice(2)
    : guide.split(/^## /m).find((block) => block.startsWith(`${heading}\n`));
  if (!section) throw new Error(`Missing canonical API section: ${heading}`);
  const lines = section.slice(heading.length).trim().split("\n");
  const blocks: ApiBlock[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index]?.trim() ?? "";
    if (!line) {
      index++;
      continue;
    }
    const subheading = /^(#{2,6}) (.+)$/.exec(line);
    if (subheading) {
      blocks.push({
        kind: "heading",
        level: subheading[1]?.length as 2 | 3 | 4 | 5 | 6,
        text: subheading[2] ?? "",
      });
      index++;
    } else if (line.startsWith("```")) {
      const code: string[] = [];
      while (++index < lines.length && !lines[index]?.startsWith("```"))
        code.push(lines[index] ?? "");
      blocks.push({ kind: "code", text: code.join("\n") });
      index++;
    } else if (line.startsWith("|")) {
      const headers = cells(line);
      const divider = cells(lines[++index] ?? "");
      if (!divider.every((cell) => /^:?-+:?$/.test(cell)))
        throw new Error(`Malformed API table: ${heading}`);
      const rows: string[][] = [];
      while (lines[++index]?.trim().startsWith("|")) {
        const row = cells(lines[index] ?? "");
        if (row.length !== headers.length) throw new Error(`Malformed API row: ${heading}`);
        if (!rowName || row[0]?.replaceAll("`", "") === rowName) rows.push(row);
      }
      if (rows.length) blocks.push({ kind: "table", headers, rows });
    } else {
      const paragraph = [line];
      while (
        lines[++index]?.trim() &&
        !lines[index]?.startsWith("|") &&
        !lines[index]?.startsWith("```") &&
        !/^#{2,6} /.test(lines[index] ?? "")
      )
        paragraph.push(lines[index] ?? "");
      blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
    }
  }
  if (rowName && !blocks.some((block) => block.kind === "table"))
    throw new Error(`Missing canonical API row: ${rowName}`);
  if (!blocks.length) throw new Error(`Empty canonical API: ${heading} ${rowName ?? ""}`);
  return blocks;
}

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
      const stories = csf.stories.map((story) => {
        const localName =
          story.localName ??
          Object.keys(csf._stories).find((key) => csf._stories[key]?.id === story.id) ??
          "";
        return highlightSample({
          id: story.id,
          name: story.name ?? story.localName ?? story.id,
          ...exampleCode(csf, localName, name),
        });
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

export function catalogPlugin(): Plugin {
  // Plain classes first; the token rule is the optional app-wide route.
  const restyleSample = [
    '/* <Button className="pill">Save</Button> */',
    ".pill {",
    "  border-radius: 999px;",
    "  background: #0b6e4f;",
    "}",
    "",
    "/* Optional: every component, in both themes */",
    ":root, [data-theme] {",
    "  --kb-color-accent: light-dark(#0b6e4f, #7fd1ae);",
    "}",
  ].join("\n");
  return {
    name: "kbui-catalog-source",
    resolveId(id) {
      if (id === "virtual:kbui-system") return systemId;
      if (id === "virtual:kbui-reference") return referenceId;
      if (id === "virtual:kbui-setup-samples") return "\0virtual:kbui-setup-samples";
      if (id === virtualId) return resolvedId;
      if (id === "virtual:kbui-changelog") return changelogId;
      if (id === sampleId) return resolvedSampleId;
    },
    load(id) {
      if (id === systemId) return `export default ${JSON.stringify(loadSystemContent())};`;
      if (id === referenceId) return `export default ${JSON.stringify(loadComponentReferences())};`;
      if (id === "\0virtual:kbui-setup-samples") {
        const sample = (code: string, language: CodeLanguage = "tsx") =>
          highlightSample({ code, snippet: code }, language);
        return `export default ${JSON.stringify({
          usage: sample(firstComponent),
          ...Object.fromEntries(themes.map((theme) => [theme, sample(themeMarkup(theme), "html")])),
          styling: sample(restyleSample, "css"),
          ...Object.fromEntries(
            managers.flatMap((manager) =>
              [false, true].map((tokens) => [
                `${manager}-${tokens}`,
                sample(installCommand(manager, tokens), "shellscript"),
              ]),
            ),
          ),
          versionCheck: sample(
            "node node_modules/@kb.ui/react/dist/check-versions.js",
            "shellscript",
          ),
        })};`;
      }
      if (id === resolvedSampleId) return `export default ${JSON.stringify(loadSiteSamples())};`;
      if (id === resolvedId) return `export default ${JSON.stringify(loadCatalogSources())};`;
      if (id === changelogId)
        return `export default ${JSON.stringify(parseChangelog(readFileSync(changelogPath, "utf8"), Object.keys(definitions)))};`;
    },
    buildStart() {
      for (const path of recipeSourceFiles) this.addWatchFile(path);
      for (const name of Object.keys(definitions))
        this.addWatchFile(resolve(referenceRoot, `${name}.md`));
      this.addWatchFile(guidancePath);
      this.addWatchFile(setupPath);
      this.addWatchFile(changelogPath);
      for (const path of siteSampleFiles) this.addWatchFile(path);
      for (const name of Object.keys(definitions))
        this.addWatchFile(resolve(componentsRoot, name, `${name}.stories.tsx`));
    },
    handleHotUpdate({ file, server }) {
      if (
        !file.startsWith(`${referenceRoot}/`) &&
        file !== guidancePath &&
        file !== setupPath &&
        file !== changelogPath &&
        !recipeSourceFiles.includes(file) &&
        !file.startsWith(componentsRoot) &&
        !siteSampleFiles.includes(file)
      )
        return;
      const module = server.moduleGraph.getModuleById(resolvedId);
      const system = server.moduleGraph.getModuleById(systemId);
      if (system) server.moduleGraph.invalidateModule(system);
      if (module) server.moduleGraph.invalidateModule(module);
      const reference = server.moduleGraph.getModuleById(referenceId);
      if (reference) server.moduleGraph.invalidateModule(reference);
      const samples = server.moduleGraph.getModuleById(resolvedSampleId);
      if (samples) server.moduleGraph.invalidateModule(samples);
      const setup = server.moduleGraph.getModuleById("\0virtual:kbui-setup-samples");
      if (setup) server.moduleGraph.invalidateModule(setup);
      const changelog = server.moduleGraph.getModuleById(changelogId);
      if (changelog) server.moduleGraph.invalidateModule(changelog);
      server.ws.send({ type: "full-reload" });
      return [];
    },
  };
}
