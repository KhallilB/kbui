import { afterEach, beforeEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readArchives, verifyPublication } from "./release-readmes.ts";

let root: string;
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "kbui-readmes-"));
  await mkdir(join(root, "package"));
  await writeFile(
    join(root, "package/package.json"),
    JSON.stringify({ name: "@kb.ui/react", version: "0.12.0" }),
  );
  await writeFile(join(root, "package/README.md"), "# React\n\nInstall the adapter.\n");
  const packed = Bun.spawnSync(["tar", "-czf", "react.tgz", "package"], { cwd: root });
  expect(packed.exitCode).toBe(0);
});
afterEach(() => rm(root, { recursive: true, force: true }));

async function fixture() {
  const [archive] = await readArchives(root);
  if (!archive) throw new Error("Missing archive");
  const integrity = `sha512-${createHash("sha512")
    .update(await readFile(join(root, "react.tgz")))
    .digest("base64")}`;
  return {
    archive,
    metadata: {
      "dist-tags": { latest: "0.12.0" },
      versions: { "0.12.0": { dist: { integrity } } },
      readme: "# React\n\nInstall the adapter.\n",
    },
  };
}

test("reads the exact README and integrity from the published archive", async () => {
  const { archive, metadata } = await fixture();
  expect(archive).toMatchObject({
    name: "@kb.ui/react",
    version: "0.12.0",
    readme: "# React\n\nInstall the adapter.\n",
    integrity: metadata.versions["0.12.0"].dist.integrity,
  });
});

test("accepts matching registry metadata without credentials", async () => {
  const { archive, metadata } = await fixture();
  const urls: string[] = [];
  await verifyPublication([archive], {
    fetch: async (url: string) => {
      urls.push(url);
      return Response.json(metadata);
    },
    attempts: 1,
  });
  expect(urls).toEqual(["https://registry.npmjs.org/%40kb.ui%2Freact"]);
});

for (const failure of ["readme", "integrity", "version", "latest", "network"] as const) {
  test(`fails release when registry ${failure} stays wrong`, async () => {
    const { archive, metadata } = await fixture();
    if (failure === "readme") metadata.readme = "old instructions";
    if (failure === "integrity") metadata.versions["0.12.0"].dist.integrity = "sha512-wrong";
    if (failure === "version") metadata.versions = {} as typeof metadata.versions;
    if (failure === "latest") metadata["dist-tags"].latest = "0.11.0";
    let calls = 0;
    await expect(
      verifyPublication([archive], {
        fetch: async () => {
          calls++;
          return failure === "network"
            ? new Response("unavailable", { status: 503 })
            : Response.json(metadata);
        },
        sleep: async () => {},
        attempts: 2,
      }),
    ).rejects.toThrow();
    expect(calls).toBe(2);
  });
}

test("waits for registry propagation then verifies the unchanged archive", async () => {
  const { archive, metadata } = await fixture();
  let calls = 0;
  const delays: number[] = [];
  await verifyPublication([archive], {
    fetch: async () =>
      Response.json(++calls === 1 ? { ...metadata, readme: "old copy" } : metadata),
    sleep: async (ms: number) => {
      delays.push(ms);
    },
    attempts: 2,
    delay: 25,
  });
  expect(calls).toBe(2);
  expect(delays).toEqual([25]);
});

test("historical retry validates immutable bytes without requiring old README to be latest", async () => {
  const { archive, metadata } = await fixture();
  metadata["dist-tags"].latest = "0.13.0";
  metadata.readme = "New release instructions";
  await verifyPublication([archive], {
    fetch: async () => Response.json(metadata),
    attempts: 1,
    allowHistorical: true,
  });
  metadata.versions["0.12.0"].dist.integrity = "sha512-wrong";
  await expect(
    verifyPublication([archive], {
      fetch: async () => Response.json(metadata),
      attempts: 1,
      allowHistorical: true,
    }),
  ).rejects.toThrow("integrity");
});

test("legacy GitHub-only scope does not contact npm", async () => {
  const { archive } = await fixture();
  await verifyPublication([{ ...archive, name: "@kbui/react" }], {
    fetch: async () => {
      throw new Error("Must not contact npm");
    },
    attempts: 1,
  });
});

test("empty release directory cannot pass verification", async () => {
  await rm(join(root, "react.tgz"));
  await expect(readArchives(root)).rejects.toThrow("No release archives");
});

test("verifies all three package publications", async () => {
  const { archive, metadata } = await fixture();
  const names = ["@kb.ui/tokens", "@kb.ui/css", "@kb.ui/react"];
  const urls: string[] = [];
  await verifyPublication(
    names.map((name) => ({ ...archive, name })),
    {
      fetch: async (url: string) => {
        urls.push(url);
        return Response.json(metadata);
      },
      attempts: 1,
    },
  );
  expect(urls).toEqual(
    names.map((name) => `https://registry.npmjs.org/${encodeURIComponent(name)}`),
  );
});

test("rejects an archive with an empty README", async () => {
  await writeFile(join(root, "package/README.md"), "\n");
  expect(Bun.spawnSync(["tar", "-czf", "react.tgz", "package"], { cwd: root }).exitCode).toBe(0);
  await expect(readArchives(root)).rejects.toThrow("Incomplete release archive");
});
