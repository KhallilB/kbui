import { afterEach, expect, test } from "bun:test";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const script = resolve(import.meta.dir, "check-consumer.ts");
const fixtures: string[] = [];
afterEach(() => {
  for (const path of fixtures.splice(0)) rmSync(path, { recursive: true, force: true });
});

const phases = ["pack", "install", "lock", "guard", "types", "smoke"];

function check(failure = "") {
  const fixture = realpathSync(mkdtempSync(join(tmpdir(), "kbui-consumer-contract-")));
  fixtures.push(fixture);
  const root = join(fixture, "repo with spaces");
  const temporary = join(fixture, "temporary space");
  const bin = join(fixture, "bin");
  const log = join(fixture, "calls.jsonl");
  mkdirSync(join(root, "packages/react"), { recursive: true });
  mkdirSync(join(root, ".github/consumer"), { recursive: true });
  mkdirSync(temporary);
  mkdirSync(bin);
  writeFileSync(log, "");
  writeFileSync(join(root, "packages/react/package.json"), '{"name":"@fixture/react"}');
  writeFileSync(join(root, ".github/consumer/package.json"), '{"private":true}');
  writeFileSync(join(root, ".github/consumer/smoke.ts"), "");
  for (const command of ["bun", "bunx"]) {
    const path = join(bin, command);
    writeFileSync(
      path,
      `#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const args = process.argv.slice(2);
const phase = path.basename(process.argv[1]) === "bunx" ? "types"
  : args[0] === "pm" ? "pack" : args[0] === "add" ? "install"
  : args[0] === "install" ? "lock" : args[0] === "smoke.ts" ? "smoke" : "guard";
fs.appendFileSync(process.env.CALLS, JSON.stringify({ phase, args, cwd: process.cwd() }) + "\\n");
if (phase === process.env.FAIL_PHASE) process.exit(23);
if (phase === "pack") {
  const tarball = path.join(args[args.indexOf("--destination") + 1], "packed React.tgz");
  fs.writeFileSync(tarball, "fixture");
  console.log(tarball);
}
if (phase === "install" && !fs.existsSync(args[1])) process.exit(24);
`,
    );
    chmodSync(path, 0o755);
  }
  const result = Bun.spawnSync([process.execPath, script, root], {
    cwd: root,
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      CALLS: log,
      FAIL_PHASE: failure,
      TMPDIR: temporary,
      TMP: temporary,
      TEMP: temporary,
    },
  });
  const calls = readFileSync(log, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { phase: string; args: string[]; cwd: string });
  return { result, calls, temporary: readdirSync(temporary), root };
}

test("checks the packed artifact in an isolated consumer and removes temporary files", () => {
  const { result, calls, temporary, root } = check();
  expect(result.exitCode).toBe(0);
  expect(calls.map((call) => call.phase)).toEqual(phases);
  const install = calls[1];
  if (!install) throw new Error("Missing consumer install");
  expect(calls[0]?.cwd).toBe(join(root, "packages/react"));
  expect(install.args[1]).toEndWith("packed React.tgz");
  for (const call of calls.slice(1)) {
    expect(call.cwd.startsWith(root)).toBe(false);
    expect(call.cwd).toBe(install.cwd);
  }
  expect(calls[2]?.args).toEqual(["install", "--frozen-lockfile"]);
  expect(calls[3]?.args).toEqual(["node_modules/@fixture/react/dist/check-versions.js"]);
  expect(calls[4]?.args).toEqual(["--no-install", "tsc", "-p", "."]);
  expect(calls[5]?.args).toEqual(["smoke.ts"]);
  expect(temporary).toEqual([]);
});

for (const failure of phases) {
  test(`${failure} failure stops later checks and removes temporary files`, () => {
    const { result, calls, temporary } = check(failure);
    expect(result.exitCode).not.toBe(0);
    expect(calls.map((call) => call.phase)).toEqual(phases.slice(0, phases.indexOf(failure) + 1));
    expect(temporary).toEqual([]);
  });
}
