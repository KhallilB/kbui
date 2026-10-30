/// <reference types="bun-types" />
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDocumentationExamples } from "./documentation.ts";
import { loadRecipeSources } from "./recipes.ts";
import { loadSiteSamples } from "./site-samples.ts";
import { loadCatalogSources } from "./source.ts";

const directory = mkdtempSync(join(tmpdir(), "kbui-example-code-"));
try {
  const recipeFiles = new Map(
    loadRecipeSources().flatMap((recipe) => recipe.files.map((file) => [file.path, file] as const)),
  );
  for (const file of recipeFiles.values()) {
    const path = join(directory, file.path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, file.sample.code);
  }
  const site = loadSiteSamples();
  const examples = [
    ...loadCatalogSources().flatMap((entry) => entry.stories),
    ...Object.entries(site.playground).map(([id, sample]) => ({
      id: `playground-${id}`,
      ...sample,
    })),
    ...loadDocumentationExamples(fileURLToPath(new URL("../../../", import.meta.url))),
  ];
  for (const story of examples) {
    writeFileSync(join(directory, `${story.id}.tsx`), story.code);
    writeFileSync(join(directory, `${story.id}.snippet.tsx`), story.snippet);
  }
  symlinkSync(
    fileURLToPath(new URL("../node_modules", import.meta.url)),
    join(directory, "node_modules"),
  );
  writeFileSync(
    join(directory, "tsconfig.json"),
    JSON.stringify({
      extends: fileURLToPath(new URL("../../../tsconfig.base.json", import.meta.url)),
      compilerOptions: { noEmit: true, types: ["vite/client"] },
      include: ["**/*.tsx"],
    }),
  );
  const result = Bun.spawnSync(["bunx", "tsc", "--project", join(directory, "tsconfig.json")], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    stdout: "pipe",
    stderr: "pipe",
  });
  if (result.exitCode !== 0)
    throw new Error(`${result.stdout.toString()}${result.stderr.toString()}`);
  console.log(
    `Example code verified: ${examples.length} complete React modules and concise snippets.`,
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}
