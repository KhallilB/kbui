import { appendFileSync } from "node:fs";

export function requiresBrowserChecks(paths: string[]): boolean {
  return paths.some((path) => {
    if (path === "packages/react/README.md") return true;
    if (/\.md$/i.test(path)) return false;
    if (/^(?:docs\/|apps\/storybook\/docs\/).*\.mdx$/i.test(path)) return false;
    if (/^\.(?:claude|codex|agents|internal)\//.test(path)) return false;
    return ![".gitignore", ".dockerignore", "progress.json"].includes(path);
  });
}

if (import.meta.main) {
  const [base, head] = process.argv.slice(2);
  if (!base || !head) throw new Error("Expected base and head commit IDs");
  let browser = true;
  if (!/^0+$/.test(base)) {
    const diff = Bun.spawnSync([
      "git",
      "diff",
      "--no-ext-diff",
      "--no-renames",
      "--name-only",
      "-z",
      base,
      head,
      "--",
    ]);
    if (diff.exitCode !== 0) throw new Error(`Cannot inspect CI diff: ${diff.stderr}`);
    browser = requiresBrowserChecks(diff.stdout.toString().split("\0").filter(Boolean));
  }
  const result = `browser=${browser}\n`;
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, result);
  process.stdout.write(result);
}
