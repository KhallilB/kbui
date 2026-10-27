import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCsf } from "storybook/internal/csf-tools";
import type { Plugin } from "vite";
import { parseChangelog } from "../site/changelog-model.ts";
import { firstComponent, themeMarkup, themes } from "../site/setup-model.ts";
import { exampleCode } from "./code.ts";
import { definitions } from "./definitions.ts";
import { highlightSample } from "./highlight.ts";
import { loadSiteSamples, siteSampleFiles } from "./site-samples.ts";
import type { ApiBlock, CatalogEntry } from "./types";

const reactRoot = fileURLToPath(new URL("../../../packages/react/", import.meta.url));
const componentsRoot = resolve(reactRoot, "src/components");
const guidePath = resolve(reactRoot, "README.md");
const setupPath = fileURLToPath(new URL("../site/setup-model.ts", import.meta.url));
const changelogPath = fileURLToPath(new URL("../../../CHANGELOG.md", import.meta.url));
const changelogId = "\0virtual:kbui-changelog";
const virtualId = "virtual:kbui-catalog";
const sampleId = "virtual:kbui-site-samples";
const resolvedSampleId = "\0virtual:kbui-site-samples";
const resolvedId = `\0${virtualId}`;

function cells(line: string): string[] {
  return line
    .trim()
    .slice(1, -1)
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll("\\|", "|"));
}

export function parseApiSection(guide: string, heading: string, rowName?: string): ApiBlock[] {
  const section = guide.split(/^## /m).find((block) => block.startsWith(`${heading}\n`));
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
    const subheading = /^(#{3,6}) (.+)$/.exec(line);
    if (subheading) {
      blocks.push({
        kind: "heading",
        level: subheading[1]?.length as 3 | 4 | 5 | 6,
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
        !/^#{3,6} /.test(lines[index] ?? "")
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

export function loadCatalogSources(): CatalogEntry[] {
  const guide = readFileSync(guidePath, "utf8");
  const folders = readdirSync(componentsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  return folders.map((name) => {
    const definition = definitions[name];
    if (!definition) throw new Error(`Add catalog metadata for ${name}`);
    const path = resolve(componentsRoot, name, `${name}.stories.tsx`);
    const csf = loadCsf(readFileSync(path, "utf8"), {
      fileName: path,
      makeTitle: (title) => title,
    }).parse();
    const stories = csf.stories.map((story) => {
      const localName =
        story.localName ??
        Object.keys(csf._stories).find((key) => csf._stories[key]?.id === story.id) ??
        "";
      const sample = highlightSample(exampleCode(csf, localName, name));
      return {
        id: story.id,
        name: story.name ?? story.localName ?? story.id,
        ...sample,
      };
    });
    const first =
      stories.find((story) => /--(default|primary|confirm|on-hover)$/.test(story.id)) ?? stories[0];
    if (!first) throw new Error(`Missing Storybook examples: ${name}`);
    const heading = definition.section ?? name;
    return {
      id: name.toLowerCase(),
      name,
      group: definition.group,
      description: definition.description,
      apiHeading: heading,
      api: parseApiSection(guide, heading, definition.row ? name : undefined),
      stories,
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
      if (id === "virtual:kbui-setup-samples") return "\0virtual:kbui-setup-samples";
      if (id === virtualId) return resolvedId;
      if (id === "virtual:kbui-changelog") return changelogId;
      if (id === sampleId) return resolvedSampleId;
    },
    load(id) {
      if (id === "\0virtual:kbui-setup-samples") {
        const sample = (code: string) => highlightSample({ code, snippet: code });
        return `export default ${JSON.stringify({ usage: sample(firstComponent), ...Object.fromEntries(themes.map((theme) => [theme, sample(themeMarkup(theme))])), styling: { code: restyleSample, snippet: restyleSample, tokens: [], snippetTokens: [] } })};`;
      }
      if (id === resolvedSampleId) return `export default ${JSON.stringify(loadSiteSamples())};`;
      if (id === resolvedId) return `export default ${JSON.stringify(loadCatalogSources())};`;
      if (id === changelogId)
        return `export default ${JSON.stringify(parseChangelog(readFileSync(changelogPath, "utf8"), Object.keys(definitions)))};`;
    },
    buildStart() {
      this.addWatchFile(guidePath);
      this.addWatchFile(setupPath);
      this.addWatchFile(changelogPath);
      for (const path of siteSampleFiles) this.addWatchFile(path);
      for (const name of Object.keys(definitions))
        this.addWatchFile(resolve(componentsRoot, name, `${name}.stories.tsx`));
    },
    handleHotUpdate({ file, server }) {
      if (
        file !== guidePath &&
        file !== setupPath &&
        file !== changelogPath &&
        !file.startsWith(componentsRoot) &&
        !siteSampleFiles.includes(file)
      )
        return;
      const module = server.moduleGraph.getModuleById(resolvedId);
      if (module) server.moduleGraph.invalidateModule(module);
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
