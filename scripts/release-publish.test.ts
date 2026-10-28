import { afterEach, beforeEach, expect, test } from "bun:test";
import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let root: string;
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "kbui-publish-"));
  await mkdir(join(root, "release"));
  await mkdir(join(root, "package"));
  await mkdir(join(root, "bin"));
  await writeFile(
    join(root, "bin/npm"),
    `#!/usr/bin/env node
const fs = require("node:fs");
fs.appendFileSync(process.env.CALLS, process.argv.slice(2).join(" ") + "\\n");
process.exit(process.argv[2] === "view" ? Number(process.env.VIEW_EXIT) : Number(process.env.PUBLISH_EXIT));
`,
  );
  await chmod(join(root, "bin/npm"), 0o755);
});
afterEach(() => rm(root, { recursive: true, force: true }));

async function publish(name: string, viewExit = 1, publishExit = 0) {
  await writeFile(join(root, "package/package.json"), JSON.stringify({ name, version: "0.10.0" }));
  const pack = Bun.spawnSync(["tar", "-czf", "release/react.tgz", "package"], { cwd: root });
  expect(pack.exitCode).toBe(0);
  const workflow = Bun.YAML.parse(
    await Bun.file(new URL("../.github/workflows/release.yml", import.meta.url)).text(),
  ) as { jobs: { publish: { steps: { name?: string; run?: string }[] } } };
  const script = workflow.jobs.publish.steps.find(
    (step) => step.name === "Publish each tarball to npm",
  )?.run;
  if (!script) throw new Error("Missing npm publish step");
  const calls = join(root, "calls");
  const result = Bun.spawnSync(["bash", "-euo", "pipefail", "-c", script], {
    cwd: root,
    env: {
      ...process.env,
      PATH: `${join(root, "bin")}:${process.env.PATH}`,
      CALLS: calls,
      VIEW_EXIT: String(viewExit),
      PUBLISH_EXIT: String(publishExit),
    },
  });
  return {
    exitCode: result.exitCode,
    calls: (await Bun.file(calls).exists()) ? await Bun.file(calls).text() : "",
  };
}

test("legacy scope never contacts npm or attempts publishing", async () => {
  expect(await publish("@kbui/react")).toEqual({ exitCode: 0, calls: "" });
});

test("new scope publishes the validated tarball", async () => {
  expect(await publish("@kb.ui/react")).toEqual({
    exitCode: 0,
    calls: "view @kb.ui/react@0.10.0 version\npublish release/react.tgz --access public\n",
  });
});

test("reruns skip versions already published", async () => {
  expect(await publish("@kb.ui/react", 0)).toEqual({
    exitCode: 0,
    calls: "view @kb.ui/react@0.10.0 version\n",
  });
});

test("publish failures remain failures for bootstrap recovery", async () => {
  expect((await publish("@kb.ui/react", 1, 7)).exitCode).toBe(7);
});
