import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { parseChangelog } from "../site/changelog-model.ts";
import {
  firstComponent,
  installCommand,
  managers,
  themeMarkup,
  themes,
} from "../site/setup-model.ts";
import {
  componentsRoot,
  guidancePath,
  loadCatalogSources,
  loadComponentReferences,
  referenceRoot,
} from "./component-sources.ts";
import { definitions } from "./definitions.ts";
import { type CodeLanguage, highlightSample } from "./highlight.ts";
import { loadSystemContent, recipeSourceFiles } from "./recipes.ts";
import { loadSiteSamples, siteSampleFiles } from "./site-samples.ts";

const setupPath = fileURLToPath(new URL("../site/setup-model.ts", import.meta.url));
const changelogPath = fileURLToPath(new URL("../../../CHANGELOG.md", import.meta.url));
const changelogId = "\0virtual:kbui-changelog";
const virtualId = "virtual:kbui-catalog";
const sampleId = "virtual:kbui-site-samples";
const resolvedSampleId = "\0virtual:kbui-site-samples";
const resolvedId = `\0${virtualId}`;
const referenceId = "\0virtual:kbui-reference";
const systemId = "\0virtual:kbui-system";

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
