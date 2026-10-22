import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
// Product names stay out of kbui: packages, Storybook, guides and decisions.
const FORBIDDEN = /control room|faceted operations|bezl/i;
const SCOPE =
  /^(packages|apps|docs\/decisions|docs\/guides|docs\/[^/]+\.md|README\.md|CONTRIBUTING\.md)/;

async function trackedFiles(): Promise<string[]> {
  const proc = Bun.spawn(["git", "ls-files", "-z"], { cwd: root, stdout: "pipe" });
  const out = await new Response(proc.stdout).text();
  return out.split("\0").filter((f) => f && SCOPE.test(f) && !f.endsWith(".snap"));
}

describe("domain neutrality", () => {
  test("no product naming in packages, Storybook or published docs", async () => {
    const hits: string[] = [];
    for (const file of await trackedFiles()) {
      const text = await readFile(join(root, file), "utf8");
      text.split("\n").forEach((line, i) => {
        if (FORBIDDEN.test(line)) hits.push(`${file}:${i + 1}: ${line.trim()}`);
      });
    }
    expect(hits).toEqual([]);
  });
});
