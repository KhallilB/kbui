import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

type Manifest = { name: string; version?: string; private?: boolean; files?: string[] };
type ExtraFile = { type?: string; path?: string; jsonpath?: string };

const readJson = async <T>(file: string): Promise<T> => JSON.parse(await readFile(file, "utf8"));

const exists = (file: string) => Bun.file(file).exists();

/** Non-private workspaces under packages/: the ones that ship a release tarball. */
export async function publishedPackages(root: string) {
  const found: { path: string; pkg: Manifest }[] = [];
  for (const dir of (await readdir(join(root, "packages"))).sort()) {
    const path = `packages/${dir}/package.json`;
    if (!(await exists(join(root, path)))) continue;
    const pkg = await readJson<Manifest>(join(root, path));
    if (!pkg.private) found.push({ path, pkg });
  }
  return found;
}

/** Lists every way the repository breaks lockstep releases; empty means releasable. */
export async function releaseProblems(root: string): Promise<string[]> {
  const problems: string[] = [];
  const { version } = await readJson<Manifest>(join(root, "package.json"));
  const manifest = await readJson<Record<string, string>>(
    join(root, ".release-please-manifest.json"),
  );
  if (manifest["."] !== version) {
    problems.push(`.release-please-manifest.json is ${manifest["."]}, root is ${version}`);
  }

  const config = await readJson<{ packages: Record<string, { "extra-files"?: ExtraFile[] }> }>(
    join(root, "release-please-config.json"),
  );
  const extraFiles = config.packages["."]?.["extra-files"] ?? [];
  // An entry that bumps any other field leaves the package version behind.
  const bumped = new Set(
    extraFiles.filter((f) => f.type === "json" && f.jsonpath === "$.version").map((f) => f.path),
  );

  for (const { path, pkg } of await publishedPackages(root)) {
    if (pkg.version !== version) {
      problems.push(
        `${pkg.name} is ${pkg.version}, root is ${version}: packages release in lockstep`,
      );
    }
    if (!bumped.has(path)) {
      problems.push(`${pkg.name} has no extra-files entry in release-please-config.json`);
    }
  }

  for (const { path } of extraFiles) {
    if (!path || !(await exists(join(root, path)))) {
      problems.push(`release-please-config.json extra-files points at missing ${path}`);
    }
  }
  return problems;
}
