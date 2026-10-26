import { expect, test } from "bun:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const register = resolve(root, "docs/features.md");

test("feature register links resolve to files inside the repository", () => {
  const links = [...readFileSync(register, "utf8").matchAll(/\[[^\]]+\]\(([^)]+)\)/g)];
  expect(links.length).toBeGreaterThan(0);
  for (const [, raw] of links) {
    if (!raw || /^(https?:|mailto:|#)/.test(raw)) continue;
    const target = resolve(dirname(register), decodeURIComponent(raw.split("#")[0] ?? ""));
    const local = relative(root, target);
    expect(local.startsWith(".."), `Link escapes repository: ${raw}`).toBe(false);
    expect(existsSync(target), `Missing feature reference: ${raw}`).toBe(true);
    expect(statSync(target).isFile(), `Feature reference is not a file: ${raw}`).toBe(true);
  }
});
