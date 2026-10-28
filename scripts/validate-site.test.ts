import { afterEach, expect, test } from "bun:test";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const fixtures: string[] = [];
afterEach(() => {
  for (const directory of fixtures.splice(0)) rmSync(directory, { recursive: true, force: true });
});

function validate(stage?: string, failure = "") {
  const directory = mkdtempSync(join(tmpdir(), "kbui-validation-"));
  fixtures.push(directory);
  const bin = join(directory, "bin");
  const temporary = join(directory, "tmp");
  const log = join(directory, "commands.log");
  mkdirSync(bin);
  mkdirSync(temporary);
  writeFileSync(log, "");
  for (const command of ["bun", "npm", "python3", "curl"]) {
    const path = join(bin, command);
    writeFileSync(
      path,
      `#!/usr/bin/env bash
set -eu
command="\${0##*/} $*"
printf '%s\\n' "$command" >> "$COMMAND_LOG"
if [[ "$command" == "\${FAIL_COMMAND:-}" ]]; then exit 23; fi
`,
    );
    chmodSync(path, 0o755);
  }
  const result = Bun.spawnSync(["bash", "scripts/validate-site.sh", ...(stage ? [stage] : [])], {
    cwd: root,
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      COMMAND_LOG: log,
      FAIL_COMMAND: failure,
      TMPDIR: temporary,
    },
  });
  return {
    result,
    commands: readFileSync(log, "utf8").trim().split("\n").filter(Boolean),
    temporary: readdirSync(temporary),
  };
}

const suites: Record<string, string[]> = {
  stories: ["bun run test:stories"],
  themes: ["bun run --cwd apps/storybook test:themes --maxWorkers=2"],
  responsive: ["bun run --cwd apps/storybook test:site", "bun run --cwd apps/storybook test:a11y"],
};

for (const [suite, commands] of Object.entries(suites)) {
  test(`${suite} stage runs only its assigned browser checks`, () => {
    const validation = validate(suite);
    expect(validation.result.exitCode).toBe(0);
    expect(validation.commands).toEqual(commands);
    expect(validation.temporary).toEqual([]);
  });
}

const builtCommands = [
  "npm ci --prefix deployment/site",
  "npm test --prefix deployment/site",
  "bun run --cwd apps/storybook verify:overrides",
  "bun run --cwd apps/storybook build:site",
  "bun scripts/site-stage.ts",
  "bun run --cwd apps/storybook build:internal --output-dir ",
  "bun run --cwd apps/storybook verify:storybook",
  "bun run --cwd apps/storybook verify:component-docs",
  "bun run --cwd apps/storybook verify:release",
  "bun run --cwd apps/storybook verify:controls",
  "npm run build --prefix deployment/site",
  "npm run check --prefix deployment/site",
];

test("built stage preserves staging, both browser engines and deployment dry-run", () => {
  const validation = validate("built");
  expect(validation.result.exitCode).toBe(0);
  const commands = validation.commands.filter((command) => /^(bun|npm) /.test(command));
  expect(commands).toHaveLength(builtCommands.length);
  for (const [index, command] of builtCommands.entries())
    expect(commands[index]).toStartWith(command);
  expect(validation.temporary).toEqual([]);
});

test("default local validation retains every stage exactly once", () => {
  const validation = validate();
  expect(validation.result.exitCode).toBe(0);
  const commands = validation.commands.filter((command) => /^(bun|npm) /.test(command));
  const expected = [...Object.values(suites).flat(), ...builtCommands];
  expect(commands).toHaveLength(expected.length);
  for (const [index, command] of expected.entries()) expect(commands[index]).toStartWith(command);
});

test("invalid stages fail before running tools", () => {
  const validation = validate("typo");
  expect(validation.result.exitCode).not.toBe(0);
  expect(validation.commands).toEqual([]);
});

test("failed browser checks stop the selected stage and preserve failure", () => {
  const validation = validate("responsive", suites.responsive?.[0]);
  expect(validation.result.exitCode).toBe(23);
  expect(validation.commands).toEqual(["bun run --cwd apps/storybook test:site"]);
});

test("built verification failures prevent deployment checks and clean temporary files", () => {
  const validation = validate("built", "bun run --cwd apps/storybook verify:release");
  expect(validation.result.exitCode).toBe(23);
  expect(validation.commands).not.toContain("bun run --cwd apps/storybook verify:controls");
  expect(validation.commands).not.toContain("npm run build --prefix deployment/site");
  expect(validation.temporary).toEqual([]);
});
