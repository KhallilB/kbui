import { realpathSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Inspect installed manifests: URL pins alone cannot prove resolved package versions.
export async function checkVersions(root: string): Promise<string> {
  const scope = join(root, "node_modules", "@kb.ui");
  const names = await readdir(scope);
  // css and tokens are optional; @kb.ui/react carries the stylesheet.
  if (!names.includes("react")) throw new Error("Missing @kb.ui/react");
  const versions = await Promise.all(
    names.map(async (name) => {
      const pkg: unknown = JSON.parse(await readFile(join(scope, name, "package.json"), "utf8"));
      if (
        typeof pkg !== "object" ||
        pkg === null ||
        !("name" in pkg) ||
        pkg.name !== `@kb.ui/${name}` ||
        !("version" in pkg) ||
        typeof pkg.version !== "string" ||
        !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(
          pkg.version,
        )
      ) {
        throw new Error(`Invalid KBUI manifest: @kb.ui/${name}`);
      }
      return { name, version: pkg.version };
    }),
  );
  const version = versions[0]?.version;
  if (!version || versions.some((pkg) => pkg.version !== version)) {
    throw new Error(
      `Mixed KBUI versions: ${versions.map((pkg) => `@kb.ui/${pkg.name}@${pkg.version}`).join(", ")}`,
    );
  }
  return version;
}

if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
) {
  try {
    console.log(
      `KBUI ${await checkVersions(resolve(process.argv[2] ?? process.cwd()))}: synchronized`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
