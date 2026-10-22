import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { releaseProblems } from "./release";

let root: string;

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

const entry = (name: string) => ({
  type: "json",
  path: `packages/${name}/package.json`,
  jsonpath: "$.version",
});

async function writePackage(name: string, fields: Record<string, unknown>) {
  await mkdir(join(root, "packages", name), { recursive: true });
  await writeFile(
    join(root, "packages", name, "package.json"),
    json({ name: `@kbui/${name}`, ...fields }),
  );
}

async function writeConfig(extraFiles: unknown[]) {
  await writeFile(
    join(root, "release-please-config.json"),
    json({ packages: { ".": { "extra-files": extraFiles } } }),
  );
}

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "kbui-release-"));
  await writeFile(
    join(root, "package.json"),
    json({ name: "kbui", private: true, version: "0.3.0" }),
  );
  await writeFile(join(root, ".release-please-manifest.json"), json({ ".": "0.3.0" }));
  await writePackage("tokens", { version: "0.3.0" });
  await writePackage("css", { version: "0.3.0" });
  await writeConfig([entry("tokens"), entry("css")]);
});

afterEach(() => rm(root, { recursive: true, force: true }));

describe("releaseProblems", () => {
  test("accepts packages in lockstep and covered by release-please", async () => {
    expect(await releaseProblems(root)).toEqual([]);
  });

  test("reports a package whose version drifts from the root", async () => {
    await writePackage("css", { version: "0.2.0" });
    expect(await releaseProblems(root)).toEqual([
      "@kbui/css is 0.2.0, root is 0.3.0: packages release in lockstep",
    ]);
  });

  test("reports a manifest that drifts from the root", async () => {
    await writeFile(join(root, ".release-please-manifest.json"), json({ ".": "0.2.0" }));
    expect(await releaseProblems(root)).toEqual([
      ".release-please-manifest.json is 0.2.0, root is 0.3.0",
    ]);
  });

  test("reports a published package release-please would not bump", async () => {
    await writePackage("mcp", { version: "0.3.0" });
    expect(await releaseProblems(root)).toEqual([
      "@kbui/mcp has no extra-files entry in release-please-config.json",
    ]);
  });

  test("does not count an entry that bumps the wrong field", async () => {
    await writeConfig([entry("tokens"), { ...entry("css"), jsonpath: "$.name" }]);
    expect(await releaseProblems(root)).toEqual([
      "@kbui/css has no extra-files entry in release-please-config.json",
    ]);
  });

  test("reports an entry that points at a missing file", async () => {
    await writeConfig([entry("tokens"), entry("css"), entry("gone")]);
    expect(await releaseProblems(root)).toEqual([
      "release-please-config.json extra-files points at missing packages/gone/package.json",
    ]);
  });

  test("ignores private packages", async () => {
    await writePackage("sandbox", { private: true, version: "9.9.9" });
    expect(await releaseProblems(root)).toEqual([]);
  });
});

test("this repository releases in lockstep", async () => {
  expect(await releaseProblems(join(import.meta.dir, ".."))).toEqual([]);
});
