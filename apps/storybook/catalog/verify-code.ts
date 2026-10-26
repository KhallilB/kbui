/// <reference types="bun-types" />
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSiteSamples } from "./site-samples.ts";
import { loadCatalogSources } from "./source.ts";

const directory = mkdtempSync(join(tmpdir(), "kbui-example-code-"));
try {
  const site = loadSiteSamples();
  const stories = [
    ...loadCatalogSources().flatMap((entry) => entry.stories),
    ...Object.entries(site.playground).map(([id, sample]) => ({
      id: `playground-${id}`,
      ...sample,
    })),
    ...Object.entries(site.surfaces).map(([id, sample]) => ({ id: `surface-${id}`, ...sample })),
  ];
  for (const story of stories) {
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
      include: ["*.tsx"],
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
    `Example code verified: ${stories.length} complete React modules and concise snippets.`,
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}
