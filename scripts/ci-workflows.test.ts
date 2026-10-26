import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type Workflow = {
  on: { push: { branches?: string[]; paths?: string[] }; pull_request?: unknown };
  jobs: Record<
    string,
    {
      container?: { image: string };
      if?: string;
      needs?: string[];
      steps: { run?: string; uses?: string }[];
    }
  >;
};

const root = resolve(import.meta.dir, "..");
const workflow = (name: string) =>
  Bun.YAML.parse(readFileSync(`${root}/.github/workflows/${name}.yml`, "utf8")) as Workflow;
const job = (name: string, key: string) => {
  const found = workflow(name).jobs[key];
  if (!found) throw new Error(`Missing ${name}/${key} job`);
  return found;
};

test("Linux browser jobs use the image matching the pinned client", () => {
  const manifest = JSON.parse(readFileSync(`${root}/apps/storybook/package.json`, "utf8"));
  expect(manifest.devDependencies.playwright).toBe("1.64.1");
  for (const [name, key] of [
    ["ci", "browser"],
    ["deploy-site", "build"],
    ["release", "assets"],
  ] as const) {
    expect(job(name, key).container?.image).toBe("mcr.microsoft.com/playwright:v1.64.1-noble");
  }
});

test("CI never downloads browsers or their system packages", () => {
  for (const name of ["ci", "deploy-site", "release"]) {
    expect(readFileSync(`${root}/.github/workflows/${name}.yml`, "utf8")).not.toMatch(
      /(?:bunx|npx) playwright install/,
    );
  }
});

test("container installs trust only their checkout after tool setup", () => {
  for (const [name, key] of [
    ["ci", "browser"],
    ["deploy-site", "build"],
    ["release", "assets"],
  ] as const) {
    const steps = job(name, key).steps;
    const trust = steps.findIndex(
      (step) => step.run === 'git config --global --add safe.directory "$GITHUB_WORKSPACE"',
    );
    const install = steps.findIndex((step) => step.run === "bun install --frozen-lockfile");
    expect(trust).toBeGreaterThanOrEqual(0);
    expect(trust).toBeLessThan(install);
    expect(steps.some((step) => step.uses === "oven-sh/setup-bun@v2")).toBe(true);
    expect(
      steps.some(
        (step) =>
          step.uses?.startsWith("jdx/mise-action") || step.uses?.startsWith("actions/setup-node"),
      ),
    ).toBe(false);
  }
});

test("ordinary checks stay browser-free and browser job follows changed-file scope", () => {
  const jobs = workflow("ci").jobs;
  expect(job("ci", "check").container).toBeUndefined();
  expect(JSON.stringify(job("ci", "check").steps)).not.toContain("test:stories");
  expect(jobs.browser?.if).toBe("needs.check.outputs.browser == 'true'");
  expect(JSON.stringify(job("ci", "check").steps)).toContain("scripts/ci-scope.ts");
});

test("deployment workflow runs only on main and excludes Markdown-only pushes", () => {
  const site = workflow("deploy-site");
  expect(site.on.pull_request).toBeUndefined();
  expect(site.on.push.branches).toEqual(["main"]);
  expect(site.on.push.paths).toContain("!**/*.md");
  expect(job("deploy-site", "build").if).toBe("github.ref == 'refs/heads/main'");
});

test("deployment paths preserve generated API docs while excluding ordinary prose", () => {
  const paths = workflow("deploy-site").on.push.paths ?? [];
  const matches = (file: string) =>
    paths.reduce((matched, pattern) => {
      const negative = pattern.startsWith("!");
      return new Bun.Glob(negative ? pattern.slice(1) : pattern).match(file) ? !negative : matched;
    }, false);
  expect(matches("packages/react/README.md")).toBe(true);
  expect(matches("packages/css/README.md")).toBe(false);
  expect(matches("apps/storybook/site/README.md")).toBe(false);
  expect(matches("apps/storybook/docs/Introduction.mdx")).toBe(true);
  expect(matches("packages/react/src/index.ts")).toBe(true);
});

test("PR browser validation retains staged WebKit journeys and deployment dry-run", () => {
  const steps = JSON.stringify(job("ci", "browser").steps);
  expect(steps).toContain("bun run validate:site");
  expect(JSON.stringify(job("deploy-site", "build").steps)).toContain("bun run validate:site");
  const validation = readFileSync(`${root}/scripts/validate-site.sh`, "utf8");
  for (const command of [
    "npm test --prefix deployment/site",
    "bun scripts/site-stage.ts",
    "verify:release",
    "npm run build --prefix deployment/site",
    "npm run check --prefix deployment/site",
  ])
    expect(validation).toContain(command);
  expect(steps).not.toContain("CLOUDFLARE_API_TOKEN");
  const manifest = JSON.parse(readFileSync(`${root}/deployment/site/package.json`, "utf8"));
  expect(manifest.scripts.check).toContain("--dry-run");
});

test("release publishing uses host tools after container validation", () => {
  const jobs = workflow("release").jobs;
  expect(JSON.stringify(job("release", "assets").steps)).not.toMatch(
    /\b(?:jq|gh release upload)\b/,
  );
  expect(jobs.upload?.container).toBeUndefined();
  expect(jobs.upload?.needs).toEqual(["release-please", "assets"]);
  expect(JSON.stringify(jobs.upload?.steps)).toContain("gh release upload");
  expect(JSON.stringify(jobs.upload?.steps)).toContain("$GITHUB_REPOSITORY");
  expect(job("release", "install").needs).toEqual(["release-please", "upload"]);
});
