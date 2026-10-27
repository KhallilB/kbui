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

function documentationProblems(path: string, content: string, version: string | undefined) {
  const problems: string[] = [];
  const blocks = [
    ...content.matchAll(/x-release-please-start-version[^\n]*\n([\s\S]*?)x-release-please-end/g),
  ];
  if (!blocks.length) {
    return [`${path} has no release-version block`];
  }
  if (
    blocks.length !== (content.match(/x-release-please-start-version/g) ?? []).length ||
    blocks.length !== (content.match(/x-release-please-end/g) ?? []).length
  ) {
    return [`${path} has malformed release-version blocks`];
  }
  const documented = new Set<string>();
  let multiple = false;
  for (const block of blocks) {
    for (const line of (block[1] ?? "").split("\n")) {
      const versions = line.match(/\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?/g) ?? [];
      if (versions.length > 1) multiple = true;
      for (const value of versions) documented.add(value);
    }
  }
  // Generic updater replaces one version per line; URLs reuse a shell variable.
  if (multiple)
    problems.push(`${path} has multiple versions on one managed line; use a version variable`);
  if (!documented.size) problems.push(`${path} has no version in its managed blocks`);
  for (const value of documented)
    if (value !== version) problems.push(`${path} documents ${value}, root is ${version}`);
  return problems;
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

  for (const { path, type } of extraFiles) {
    if (!path || !(await exists(join(root, path)))) {
      problems.push(`release-please-config.json extra-files points at missing ${path}`);
      continue;
    }
    if (type !== "generic") continue;
    const content = await readFile(join(root, path), "utf8");
    problems.push(...documentationProblems(path, content, version));
  }
  return problems;
}
