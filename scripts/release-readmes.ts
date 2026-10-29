import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Archive = { name: string; version: string; readme: string; integrity: string };
type Metadata = {
  "dist-tags"?: { latest?: string };
  readme?: string;
  versions?: Record<string, { dist?: { integrity?: string } }>;
};
type Options = {
  fetch?: (url: string) => Promise<Response>;
  sleep?: (ms: number) => Promise<void>;
  attempts?: number;
  delay?: number;
  allowHistorical?: boolean;
};

export async function readArchives(directory: string): Promise<Archive[]> {
  const files = (await readdir(directory)).filter((file) => file.endsWith(".tgz")).sort();
  if (!files.length) throw new Error("No release archives to verify");
  return Promise.all(
    files.map(async (file) => {
      const path = join(directory, file);
      const extract = (entry: string) =>
        execFileSync("tar", ["-xOzf", path, `package/${entry}`], { encoding: "utf8" });
      const pkg = JSON.parse(extract("package.json"));
      const readme = extract("README.md");
      if (!pkg.name || !pkg.version || !readme.trim())
        throw new Error(`Incomplete release archive ${file}`);
      const integrity = `sha512-${createHash("sha512")
        .update(await readFile(path))
        .digest("base64")}`;
      return { name: pkg.name, version: pkg.version, readme, integrity };
    }),
  );
}

export async function verifyPublication(archives: Archive[], options: Options = {}): Promise<void> {
  const request =
    options.fetch ??
    ((url: string) => fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15_000) }));
  const sleep =
    options.sleep ?? ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)));
  const attempts = options.attempts ?? 20;
  const delay = options.delay ?? 15_000;
  for (const archive of archives) {
    // Legacy scope remains on GitHub; no npm version exists to verify.
    if (archive.name.startsWith("@kbui/")) continue;
    let failure: unknown;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const response = await request(
          `https://registry.npmjs.org/${encodeURIComponent(archive.name)}`,
        );
        if (!response.ok) throw new Error(`Registry HTTP ${response.status}`);
        const metadata = (await response.json()) as Metadata;
        const published = metadata.versions?.[archive.version];
        if (!published) throw new Error(`${archive.name}@${archive.version} missing from registry`);
        if (published.dist?.integrity !== archive.integrity)
          throw new Error(`${archive.name} integrity differs from release archive`);
        const latest = metadata["dist-tags"]?.latest;
        if (latest !== archive.version && !options.allowHistorical)
          throw new Error(`${archive.name} latest is ${latest}, expected ${archive.version}`);
        // Historical recovery must not compare an old README with a newer release's page.
        if (latest === archive.version && metadata.readme !== archive.readme)
          throw new Error(`${archive.name} registry README differs from release archive`);
        console.log(
          `${archive.name}@${archive.version}: README and archive integrity verified${latest === archive.version ? " (latest)" : " (historical archive)"}`,
        );
        failure = undefined;
        break;
      } catch (error) {
        failure = error;
        if (attempt < attempts) await sleep(delay);
      }
    }
    if (failure) throw failure;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const archives = await readArchives(resolve(process.argv[2] ?? "release"));
  await verifyPublication(archives, { allowHistorical: process.env.ALLOW_HISTORICAL === "true" });
}
