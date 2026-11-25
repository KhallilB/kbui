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

function validate(stage?: string, failure = "", extra: Record<string, string> = {}) {
  const directory = mkdtempSync(join(tmpdir(), "kbui-validation-"));
  fixtures.push(directory);
  const bin = join(directory, "bin");
  const temporary = join(directory, "tmp");
  const log = join(directory, "commands.log");
  mkdirSync(bin);
  mkdirSync(temporary);
  writeFileSync(log, "");
  for (const command of ["bun", "npm", "node", "python3", "curl"]) {
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
  const mktemp = join(bin, "mktemp");
  writeFileSync(
    mktemp,
    '#!/usr/bin/env bash\nset -eu\nmkdir "$TMPDIR/qa"\nprintf "%s\\n" "$TMPDIR/qa"\n',
  );
  chmodSync(mktemp, 0o755);
  const result = Bun.spawnSync(["bash", "scripts/validate-site.sh", ...(stage ? [stage] : [])], {
    cwd: root,
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      COMMAND_LOG: log,
      FAIL_COMMAND: failure,
      SITE_VALIDATION_PORT: "4175",
      SITE_SHARD: "",
      TMPDIR: temporary,
      ...extra,
    },
  });
  return {
    result,
    commands: readFileSync(log, "utf8").trim().split("\n").filter(Boolean),
    temporary: readdirSync(temporary),
    temporaryRoot: temporary,
  };
}

const suites: Record<string, string[]> = {
  stories: ["bun run test:stories"],
  "stories-default": ["bun run --cwd apps/storybook test --project chromium"],
  "stories-reduced-motion": ["bun run --cwd apps/storybook test --project chromium-reduced-motion"],
  overlays: ["bun run test:overlays"],
  themes: ["bun run --cwd apps/storybook test:themes --maxWorkers=2"],
  responsive: ["bun run --cwd apps/storybook test:site", "bun run --cwd apps/storybook test:a11y"],
  "responsive-desktop": [
    "bun run --cwd apps/storybook test:site --project small-laptop --project small-desktop --project desktop --project forced-colors",
  ],
  "responsive-mobile": [
    "bun run --cwd apps/storybook test:site --project narrow-mobile --project mobile --project tablet",
    "bun run --cwd apps/storybook test:a11y",
  ],
};

const projectsOf = (stages: string[]) =>
  stages
    .flatMap((stage) => suites[stage] ?? [])
    .flatMap((command) => [...command.matchAll(/--project (\S+)/g)].map((match) => match[1]))
    .sort();

test("split story and layout stages together run every Vitest project once", () => {
  const read = (file: string) => readFileSync(join(root, "apps/storybook", file), "utf8");
  const instances = [
    ...read("vitest.config.ts").matchAll(/browser: "chromium",\s+name: "([^"]+)"/g),
  ];
  expect(projectsOf(["stories-default", "stories-reduced-motion"])).toEqual(
    instances.map((match) => match[1]).sort(),
  );
  const viewports = read("vitest.site.config.ts").match(/const viewports = \[([^\]]*)\]/)?.[1];
  expect(projectsOf(["responsive-desktop", "responsive-mobile"])).toEqual(
    [...(viewports ?? "").matchAll(/"([^"]+)"/g)].map((match) => match[1]).sort(),
  );
});

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
  "bun run --cwd apps/storybook verify:recipes",
  "bun run --cwd apps/storybook verify:component-docs",
  "bun run --cwd apps/storybook verify:release",
  "bun run --cwd apps/storybook verify:controls",
  "npm run build --prefix deployment/site",
  "npm run check --prefix deployment/site",
];

const siteOnly = /verify:(component-docs|release)/;
const builtParts: Record<string, { commands: string[]; ports: string }> = {
  built: { commands: builtCommands, ports: "python3 - 4175 4176" },
  "built-site": {
    commands: builtCommands.filter((command) => !siteOnly.test(command)),
    ports: "python3 - 4175 4176",
  },
  "built-docs": {
    commands: [...builtCommands.slice(0, 1), ...builtCommands.slice(3, 5), builtCommands[8] ?? ""],
    ports: "python3 - 4175",
  },
  "built-journeys": {
    commands: [...builtCommands.slice(0, 1), ...builtCommands.slice(3, 5), builtCommands[9] ?? ""],
    ports: "python3 - 4175",
  },
};

for (const [stage, { commands: expected, ports }] of Object.entries(builtParts)) {
  test(`${stage} stage runs its staged-site checks in order`, () => {
    const validation = validate(stage);
    expect(validation.result.exitCode).toBe(0);
    expect(validation.commands[0]).toBe(ports);
    const commands = validation.commands.filter((command) => /^(bun|npm) /.test(command));
    expect(commands).toHaveLength(expected.length);
    for (const [index, command] of expected.entries()) expect(commands[index]).toStartWith(command);
    expect(validation.temporary).toEqual([]);
  });
}

test("built parts together cover the full built stage exactly once", () => {
  const parts = ["built-site", "built-docs", "built-journeys"].map(
    (stage) => builtParts[stage]?.commands ?? [],
  );
  const shared = [
    "npm ci --prefix deployment/site",
    "bun run --cwd apps/storybook build:site",
    "bun scripts/site-stage.ts",
  ];
  for (const part of parts)
    expect(part.filter((command) => shared.includes(command))).toEqual(shared);
  const own = parts.flat().filter((command) => !shared.includes(command));
  expect([...own].sort()).toEqual(
    builtCommands.filter((command) => !shared.includes(command)).sort(),
  );
});

test("a shard limits only the docs and journey specs", () => {
  for (const [stage, spec] of [
    ["built-docs", "verify:component-docs"],
    ["built-journeys", "verify:release"],
  ] as const) {
    const validation = validate(stage, "", { SITE_SHARD: "2/2" });
    expect(validation.result.exitCode).toBe(0);
    const sharded = validation.commands.filter((command) => command.includes("--shard"));
    expect(sharded).toHaveLength(1);
    expect(sharded[0]).toStartWith(`bun run --cwd apps/storybook ${spec} --shard=2/2`);
  }
  const site = validate("built-site", "", { SITE_SHARD: "2/2" });
  expect(site.commands.some((command) => command.includes("--shard"))).toBe(false);
});

test("malformed shards fail before running tools", () => {
  for (const shard of ["2", "a/b", "1/2 --grep x"]) {
    const validation = validate("built-docs", "", { SITE_SHARD: shard });
    expect(validation.result.exitCode).not.toBe(0);
    expect(validation.commands).toEqual([]);
  }
});

test("journey failures preserve failure and clean temporary files", () => {
  const validation = validate("built-journeys", "bun run --cwd apps/storybook verify:release");
  expect(validation.result.exitCode).toBe(23);
  expect(validation.temporary).toEqual([]);
});

test("built verification failures prevent deployment checks and clean temporary files", () => {
  const validation = validate("built", "bun run --cwd apps/storybook verify:release");
  expect(validation.result.exitCode).toBe(23);
  expect(validation.commands).not.toContain("bun run --cwd apps/storybook verify:controls");
  expect(validation.commands).not.toContain("npm run build --prefix deployment/site");
  expect(validation.temporary).toEqual([]);
});

test("recipe verification failure stops later built-site checks", () => {
  const validation = validate("built", "bun run --cwd apps/storybook verify:recipes");
  expect(validation.result.exitCode).toBe(23);
  expect(validation.commands).not.toContain("bun run --cwd apps/storybook verify:component-docs");
  expect(validation.commands).not.toContain("npm run check --prefix deployment/site");
  expect(validation.temporary).toEqual([]);
});

test("occupied validation ports stop before building or staging", () => {
  const validation = validate("built", "python3 - 4175 4176");
  expect(validation.result.exitCode).toBe(23);
  expect(validation.commands).toEqual(["python3 - 4175 4176"]);
  expect(validation.temporary).toEqual([]);
});

test("built artifacts use the maintained preview server for staged and QA output", () => {
  const validation = validate("built");
  const servers = validation.commands.filter((command) =>
    command.includes("vite/bin/vite.js preview"),
  );
  expect(servers).toHaveLength(2);
  expect(
    servers.some((command) => command.includes(`--outDir ${root}/deployment/site/public`)),
  ).toBe(true);
  expect(
    servers.some((command) => command.includes(`--outDir ${validation.temporaryRoot}/qa`)),
  ).toBe(true);
  expect(validation.commands.some((command) => command.startsWith("python3 -m http.server"))).toBe(
    false,
  );
});
