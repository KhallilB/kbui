import { expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { recipeDefinitions } from "../catalog/content";

const root = resolve(import.meta.dir, "../../..");
const { version: rootVersion } = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const config = JSON.parse(readFileSync(resolve(root, "release-please-config.json"), "utf8"));
const versioned = new Set(
  config.packages["."]["extra-files"]
    .filter((file: { type: string }) => file.type === "generic")
    .map((file: { path: string }) => file.path),
);

function parseSemver(version: string): [number, number, number] {
  const [major = 0, minor = 0, patch = 0] = version.split(".").map(Number);
  return [major, minor, patch];
}

function compareSemver(a: string, b: string): number {
  const [aMaj, aMin, aPat] = parseSemver(a);
  const [bMaj, bMin, bPat] = parseSemver(b);
  return aMaj - bMaj || aMin - bMin || aPat - bPat;
}

function exportedSymbols(source: string): Set<string> {
  const names = new Set<string>();
  for (const [, block = ""] of source.matchAll(/export\s*\{([\s\S]*?)\}\s*from/g)) {
    for (const part of block.split(",")) {
      const name = part
        .replace(/\btype\b/g, "")
        .trim()
        .split(/\s+as\s+/)
        .at(-1)
        ?.trim();
      if (name) names.add(name);
    }
  }
  return names;
}

function importedKbuiSymbols(source: string): string[] {
  return [...source.matchAll(/import\s*\{([\s\S]*?)\}\s*from\s*"@kb\.ui\/react"/g)]
    .flatMap(([, block = ""]) => block.split(","))
    .map(
      (part) =>
        part
          .replace(/\btype\b/g, "")
          .trim()
          .split(/\s+as\s+/)[0]
          ?.trim() ?? "",
    )
    .filter(Boolean);
}

const releaseTags = execFileSync("git", ["tag", "-l", "v*"], { cwd: root, encoding: "utf8" })
  .trim()
  .split("\n")
  .map((tag) => tag.replace(/^v/, ""))
  // 0.10.0 is tarball-only; a minimum must be installable from npm.
  .filter((ver) => compareSemver(ver, "0.10.1") >= 0)
  .sort(compareSemver);

const tagExports = new Map(
  releaseTags.map((ver) => [
    ver,
    exportedSymbols(
      execFileSync("git", ["show", `v${ver}:packages/react/src/index.ts`], {
        cwd: root,
        encoding: "utf8",
      }),
    ),
  ]),
);

const headExports = exportedSymbols(
  readFileSync(resolve(root, "packages/react/src/index.ts"), "utf8"),
);

const latestTag = releaseTags.at(-1) ?? "0.11.0";
const [latestMajor, latestMinor] = parseSemver(latestTag);
const nextReleaseVersion =
  compareSemver(rootVersion, latestTag) > 0 ? rootVersion : `${latestMajor}.${latestMinor + 1}.0`;

function minimumKbuiVersion(source: string): string {
  const imports = importedKbuiSymbols(source);
  for (const symbol of imports) {
    expect(headExports.has(symbol), `Unknown @kb.ui/react import: ${symbol}`).toBe(true);
  }
  for (const ver of releaseTags) {
    const exportsAtTag = tagExports.get(ver);
    if (exportsAtTag && imports.every((symbol) => exportsAtTag.has(symbol))) return ver;
  }
  return nextReleaseVersion;
}

/** A recipe needs every `@kb.ui/react` export its component imports. */
function recipeMinimum(recipe: (typeof recipeDefinitions)[number]): string {
  const [component] = recipe.files.filter((path) => path.endsWith(".tsx"));
  if (!component) throw new Error(`${recipe.name} lists no component`);
  return minimumKbuiVersion(readFileSync(resolve(root, component), "utf8"));
}

test("each recipe source file starts with a provenance header naming the oldest npm `@kb.ui/react` it needs", () => {
  for (const file of new Set(recipeDefinitions.flatMap((recipe) => recipe.files))) {
    const owners = recipeDefinitions.filter((recipe) => recipe.files.includes(file));
    // A shared file needs what its most demanding owner needs, and links the recipe index.
    const minVersion = owners.map(recipeMinimum).sort(compareSemver).at(-1);
    const guide =
      owners.length === 1
        ? `https://kbui.kcb.pro/recipes/?recipe=${owners[0]?.id}`
        : "https://kbui.kcb.pro/recipes/";
    const header = `kbui recipe ${owners.map((recipe) => recipe.name).join(", ")} · needs @kb.ui/react ≥ ${minVersion} · ${guide}`;
    const source = readFileSync(resolve(root, file), "utf8");
    const [firstLine] = source.split("\n");
    expect(firstLine, file).toBe(file.endsWith(".css") ? `/* ${header} */` : `// ${header}`);
    expect(source, file).not.toContain("x-release-please");
    expect(versioned.has(file), `${file} must not be in release-please extra-files`).toBe(false);
  }
});
