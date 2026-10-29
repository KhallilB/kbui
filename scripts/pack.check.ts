// Needs built dist/. Run through `bun run test:pack`, not `bun run test`.
import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { publishedPackages } from "./release";

const root = join(import.meta.dir, "..");
const out = await mkdtemp(join(tmpdir(), "kbui-pack-"));
afterAll(() => rm(out, { recursive: true, force: true }));

const packages = (await publishedPackages(root)).map(({ path, pkg }) => ({
  dir: dirname(join(root, path)),
  pkg,
}));

function run(cmd: string[], cwd: string): string {
  const result = Bun.spawnSync(cmd, { cwd, stderr: "pipe" });
  if (result.exitCode !== 0) throw new Error(`${cmd.join(" ")}: ${result.stderr.toString()}`);
  return result.stdout.toString().trim();
}

test("@kb.ui/react ships the full stylesheet so one install is enough", async () => {
  const react = packages.find(({ pkg }) => pkg.name === "@kb.ui/react");
  if (!react) throw new Error("@kb.ui/react is not published");
  const tarball = run(["bun", "pm", "pack", "--quiet", "--destination", out], react.dir);
  const entries = run(["tar", "-tzf", tarball], react.dir).split("\n");
  expect(entries).toContain("package/dist/styles.css");
  expect(entries).toContain("package/docs/components/Button.md");
  expect(entries).toContain("package/docs/components/Input.md");
  const pkg = react.pkg as { exports?: Record<string, unknown>; sideEffects?: unknown };
  expect(pkg.exports?.["./styles.css"]).toBe("./dist/styles.css");
  expect(pkg.sideEffects).toEqual(["*.css"]);
  const shipped = await Bun.file(join(react.dir, "dist/styles.css")).text();
  expect(shipped).toBe(await Bun.file(join(root, "packages/css/dist/styles.css")).text());
});

describe.each(packages)("$pkg.name tarball", ({ dir, pkg }) => {
  const tarball = run(["bun", "pm", "pack", "--quiet", "--destination", out], dir);
  const entries = run(["tar", "-tzf", tarball], dir)
    .split("\n")
    .map((e) => e.replace(/^package\//, ""));

  test("is named as the release asset consumers install", () => {
    expect(basename(tarball)).toBe(`${pkg.name.slice(1).replace("/", "-")}-${pkg.version}.tgz`);
  });

  test("ships only package.json, README.md and the files field", () => {
    const allowed = (e: string) =>
      e === "package.json" ||
      e === "README.md" ||
      (pkg.files ?? []).some((f) => e === f || e.startsWith(`${f}/`));
    expect(entries.filter((e) => !allowed(e))).toEqual([]);
  });

  test("ships the current package README byte for byte", async () => {
    expect(entries).toContain("README.md");
    const shipped = Bun.spawnSync(["tar", "-xOzf", tarball, "package/README.md"], { cwd: dir });
    expect(shipped.exitCode).toBe(0);
    expect(
      shipped.stdout.equals(Buffer.from(await Bun.file(join(dir, "README.md")).arrayBuffer())),
    ).toBe(true);
  });

  test("ships built output", () => {
    expect(entries.some((e) => e.startsWith("dist/"))).toBe(true);
  });
});
