import { expect, test } from "bun:test";
import { resolve } from "node:path";
import { requiresBrowserChecks } from "./ci-scope";

test("private-doc cleanup and public prose need no browser", () => {
  expect(
    requiresBrowserChecks([
      "README.md",
      "packages/css/README.md",
      "docs/product.md",
      "apps/storybook/site/README.md",
      "apps/storybook/docs/Introduction.mdx",
      ".claude/settings.json",
      "CLAUDE.md",
      ".gitignore",
      ".dockerignore",
      "progress.json",
    ]),
  ).toBe(false);
});

test("source, executable stories and unknown files retain browser coverage", () => {
  for (const path of [
    "packages/react/README.md",
    "packages/react/src/components/Button/Button.tsx",
    "packages/tokens/tokens.json",
    "apps/storybook/stories/Test.mdx",
    "apps/storybook/site/site.css",
    "bun.lock",
    ".github/workflows/ci.yml",
    "scripts/ci-scope.ts",
    "new-runtime-file",
  ])
    expect(requiresBrowserChecks(["README.md", path])).toBe(true);
});

test("empty diffs skip browsers; deleted source still requires browsers", () => {
  expect(requiresBrowserChecks([])).toBe(false);
  expect(requiresBrowserChecks(["packages/react/src/removed.ts"])).toBe(true);
});

test("CLI reports unchanged refs and refuses unreadable diffs", () => {
  const command = [process.execPath, resolve(import.meta.dir, "ci-scope.ts")];
  const options = {
    cwd: resolve(import.meta.dir, ".."),
    env: { ...process.env, GITHUB_OUTPUT: "" },
  };
  const unchanged = Bun.spawnSync([...command, "HEAD", "HEAD"], options);
  expect(unchanged.exitCode).toBe(0);
  expect(unchanged.stdout.toString()).toBe("browser=false\n");
  const unknown = Bun.spawnSync([...command, "not-a-commit", "HEAD"], options);
  expect(unknown.exitCode).not.toBe(0);
  expect(unknown.stderr.toString()).toContain("Cannot inspect CI diff");
  expect(unknown.stdout.toString()).not.toContain("browser=false");
  const first = Bun.spawnSync([...command, "0".repeat(40), "HEAD"], options);
  expect(first.exitCode).toBe(0);
  expect(first.stdout.toString()).toBe("browser=true\n");
});
