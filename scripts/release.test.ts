import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { publishedPackages, releaseProblems } from "./release";

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

test("published packages name their source so npm provenance can verify them", async () => {
  for (const { path, pkg } of await publishedPackages(join(import.meta.dir, ".."))) {
    expect({ name: pkg.name, repository: (pkg as { repository?: unknown }).repository }).toEqual({
      name: pkg.name,
      repository: {
        type: "git",
        url: "git+https://github.com/KhallilB/kbui.git",
        directory: path.replace("/package.json", ""),
      },
    });
  }
});

async function documentedRelease(content: string) {
  await writeFile(join(root, "USAGE.md"), content);
  await writeConfig([entry("tokens"), entry("css"), { type: "generic", path: "USAGE.md" }]);
}

const annotated = (line: string) =>
  `<!-- x-release-please-start-version -->\n${line}\n<!-- x-release-please-end -->\n`;

test("rejects stale versioned documentation before a release", async () => {
  await documentedRelease(annotated("KBUI_VERSION=0.2.0"));
  expect(await releaseProblems(root)).toEqual(["USAGE.md documents 0.2.0, root is 0.3.0"]);
});

test("requires version annotations for release-managed documentation", async () => {
  await documentedRelease("KBUI_VERSION=0.3.0\n");
  expect(await releaseProblems(root)).toEqual(["USAGE.md has no release-version block"]);
});

test("rejects multiple versions per line because the generic updater replaces only one", async () => {
  await documentedRelease(annotated("/v0.3.0/kbui-react-0.3.0.tgz"));
  expect(await releaseProblems(root)).toEqual([
    "USAGE.md has multiple versions on one managed line; use a version variable",
  ]);
});

test("allows historical versions outside managed blocks", async () => {
  await documentedRelease(`Before 0.2.0, setup was different.\n${annotated("KBUI_VERSION=0.3.0")}`);
  expect(await releaseProblems(root)).toEqual([]);
});

test("accepts synchronized documentation after a version bump", async () => {
  await writeFile(join(root, "package.json"), json({ version: "0.4.0" }));
  await writeFile(join(root, ".release-please-manifest.json"), json({ ".": "0.4.0" }));
  await writePackage("tokens", { version: "0.4.0" });
  await writePackage("css", { version: "0.4.0" });
  await documentedRelease(annotated("KBUI_VERSION=0.4.0"));
  expect(await releaseProblems(root)).toEqual([]);
});

test("rejects an empty release-version block", async () => {
  await documentedRelease(annotated("No release version here."));
  expect(await releaseProblems(root)).toEqual(["USAGE.md has no version in its managed blocks"]);
});

test("keeps installation entry points registered with the release updater", async () => {
  const config = await Bun.file(new URL("../release-please-config.json", import.meta.url)).json();
  const paths = config.packages["."]["extra-files"]
    .filter((file: { type: string }) => file.type === "generic")
    .map((file: { path: string }) => file.path);
  expect(paths.sort()).toEqual([
    "README.md",
    "apps/storybook/docs/Introduction.mdx",
    "docs/guides/using-kbui.md",
  ]);
});

test("rejects incomplete and nested annotation blocks", async () => {
  await documentedRelease("<!-- x-release-please-start-version -->\nKBUI_VERSION=0.3.0\n");
  expect(await releaseProblems(root)).toEqual(["USAGE.md has no release-version block"]);
  await documentedRelease(annotated(annotated("KBUI_VERSION=0.3.0")));
  expect(await releaseProblems(root)).toEqual(["USAGE.md has malformed release-version blocks"]);
});
