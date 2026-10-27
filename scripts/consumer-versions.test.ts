import { afterEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkVersions } from "../packages/react/scripts/check-versions";

const roots: string[] = [];
afterEach(async () => {
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});
async function fixture(versions: Record<string, string>) {
  const root = await mkdtemp(join(tmpdir(), "kbui-consumer-"));
  roots.push(root);
  for (const [name, version] of Object.entries(versions)) {
    const dir = join(root, "node_modules", "@kbui", name);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "package.json"), JSON.stringify({ name: `@kbui/${name}`, version }));
  }
  return root;
}
test("accepts synchronized React/CSS with optional tokens", async () => {
  await expect(checkVersions(await fixture({ react: "0.4.0", css: "0.4.0" }))).resolves.toBe(
    "0.4.0",
  );
  await expect(
    checkVersions(await fixture({ react: "0.4.0", css: "0.4.0", tokens: "0.4.0" })),
  ).resolves.toBe("0.4.0");
});
test("rejects mixed installed versions, including optional packages", async () => {
  await expect(checkVersions(await fixture({ react: "0.4.0", css: "0.3.0" }))).rejects.toThrow(
    "Mixed KBUI versions",
  );
  await expect(
    checkVersions(await fixture({ react: "0.4.0", css: "0.4.0", tokens: "0.3.0" })),
  ).rejects.toThrow("Mixed KBUI versions");
});
test("accepts the React package alone, which carries the stylesheet", async () => {
  expect(await checkVersions(await fixture({ react: "0.7.0" }))).toBe("0.7.0");
});
test("rejects missing required packages and malformed manifests", async () => {
  await expect(checkVersions(await fixture({ css: "0.4.0" }))).rejects.toThrow("@kbui/react");
  const root = await fixture({ react: "0.4.0", css: "0.4.0" });
  await writeFile(join(root, "node_modules/@kbui/css/package.json"), "{");
  await expect(checkVersions(root)).rejects.toThrow();
});
test("rejects mismatched identity or invalid version instead of skipping it", async () => {
  const root = await fixture({ react: "0.4.0", css: "0.4.0" });
  await writeFile(
    join(root, "node_modules/@kbui/css/package.json"),
    JSON.stringify({ name: "elsewhere", version: "0.4.0" }),
  );
  await expect(checkVersions(root)).rejects.toThrow("Invalid KBUI manifest");
  await writeFile(
    join(root, "node_modules/@kbui/css/package.json"),
    JSON.stringify({ name: "@kbui/css", version: "latest" }),
  );
  await expect(checkVersions(root)).rejects.toThrow("Invalid KBUI manifest");
});

test("CLI exits nonzero for mixed versions and passes synchronized installs", async () => {
  const cli = new URL("../packages/react/scripts/check-versions.ts", import.meta.url).pathname;
  const root = await fixture({ react: "0.4.0", css: "0.3.0" });
  const bad = Bun.spawnSync(["bun", cli, root]);
  expect(bad.exitCode).toBe(1);
  expect(bad.stderr.toString()).toContain("Mixed KBUI versions");
  await writeFile(
    join(root, "node_modules/@kbui/css/package.json"),
    JSON.stringify({ name: "@kbui/css", version: "0.4.0" }),
  );
  const good = Bun.spawnSync(["bun", cli, root]);
  expect(good.exitCode).toBe(0);
  expect(good.stdout.toString()).toContain("KBUI 0.4.0: synchronized");
});

test.each(["0.4.0-.", "0.4.0-01", "0.4.0+", "00.4.0"])(
  "rejects malformed SemVer %s",
  async (version) => {
    await expect(checkVersions(await fixture({ react: version, css: version }))).rejects.toThrow(
      "Invalid KBUI manifest",
    );
  },
);
test("accepts valid prerelease and build identifiers", async () => {
  const version = "0.5.0-rc.1+build.2";
  await expect(checkVersions(await fixture({ react: version, css: version }))).resolves.toBe(
    version,
  );
});
test("Node CLI checks installed versions through a symlink", async () => {
  const root = await fixture({ react: "0.4.0", css: "0.3.0" });
  const cli = join(root, "check-versions.mjs");
  await symlink(new URL("../packages/react/dist/check-versions.js", import.meta.url).pathname, cli);
  const result = Bun.spawnSync(["node", cli, root]);
  expect(result.exitCode).toBe(1);
  expect(result.stderr.toString()).toContain("Mixed KBUI versions");
});
