import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { posix, resolve } from "node:path";

type Workflow = {
  on: {
    push: { branches?: string[]; paths?: string[] };
    pull_request?: unknown;
    workflow_dispatch?: {
      inputs: { tag: { description: string; required: boolean; type: string } };
    };
  };
  jobs: Record<
    string,
    {
      name?: string;
      "runs-on"?: string;
      strategy?: { "fail-fast": boolean; matrix: { include: { suite: string; name: string }[] } };
      container?: { image: string };
      if?: string;
      needs?: string | string[];
      permissions?: Record<string, string>;
      outputs?: Record<string, string>;
      environment?: { name: string; url?: string };
      steps: {
        name?: string;
        if?: string;
        run?: string;
        uses?: string;
        with?: Record<string, unknown>;
        env?: Record<string, string>;
      }[];
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

test("CI compiles examples in the configured Storybook workspace", () => {
  const manifest = JSON.parse(readFileSync(`${root}/apps/storybook/package.json`, "utf8"));
  const examples = job("ci", "check").steps.find((step) => step.name === "Check examples");
  expect(examples?.run).toBe(`bun run --filter ${manifest.name} verify:code`);
});

test("Linux browser jobs use the image matching the pinned client", () => {
  const manifest = JSON.parse(readFileSync(`${root}/apps/storybook/package.json`, "utf8"));
  expect(manifest.devDependencies.playwright).toBe("1.64.1");
  for (const [name, key] of [
    ["ci", "browser-tests"],
    ["ci", "browser-built"],
    ["deploy-site", "build"],
    ["deploy-site", "validation"],
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
    ["ci", "browser-tests"],
    ["ci", "browser-built"],
    ["deploy-site", "build"],
    ["deploy-site", "validation"],
    ["release", "assets"],
  ] as const) {
    const steps = job(name, key).steps;
    const trust = steps.findIndex(
      (step) => step.run === 'git config --global --add safe.directory "$GITHUB_WORKSPACE"',
    );
    const install = steps.findIndex((step) => step.run === "bun install --frozen-lockfile");
    expect(trust).toBeGreaterThanOrEqual(0);
    expect(trust).toBeLessThan(install);
    const setup = steps.findIndex((step) => step.run?.startsWith("npm install --global "));
    expect(setup).toBeGreaterThanOrEqual(0);
    expect(setup).toBeLessThan(install);
    expect(steps[setup]?.run).toContain("require('./package.json').packageManager");
    expect(steps.some((step) => step.uses === "oven-sh/setup-bun@v2")).toBe(false);
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
  for (const key of ["browser-tests", "browser-built"])
    expect(jobs[key]?.if).toBe("needs.check.outputs.browser == 'true'");
  expect(JSON.stringify(job("ci", "check").steps)).toContain("scripts/ci-scope.ts");
});

test("independent browser suites and built-site checks run on separate standard runners", () => {
  const jobs = workflow("ci").jobs;
  for (const key of ["browser-tests", "browser-built"]) {
    expect(jobs[key]?.needs).toEqual(["check"]);
    expect(jobs[key]?.["runs-on"]).toBe("ubuntu-latest");
  }
  const suites = job("ci", "browser-tests");
  expect(suites.strategy?.["fail-fast"]).toBe(false);
  expect(suites.strategy?.matrix.include).toEqual([
    { suite: "stories", name: "Test: stories" },
    { suite: "themes", name: "Test: themes" },
    { suite: "responsive", name: "Test: layouts" },
  ]);
  expect(JSON.stringify(suites.steps)).toContain(`bun run validate:site \${{ matrix.suite }}`);
  expect(job("ci", "browser-built").name).toBe("Test: site");
  expect(suites.steps.some((step) => step.uses?.includes("upload-artifact"))).toBe(false);
  expect(jobs.browser?.name).toBe("Gate: validation");
  expect(jobs.browser?.needs).toEqual(["check", "browser-tests", "browser-built"]);
  expect(jobs.browser?.if).toBe("always() && needs.check.outputs.browser == 'true'");
});

test("final validation gate rejects failed, skipped and cancelled prerequisites", () => {
  const gate = job("ci", "browser").steps.find((step) => step.run);
  if (!gate?.run) throw new Error("Missing validation gate command");
  expect(gate.env).toEqual({
    SUITES_RESULT: `\${{ needs.browser-tests.result }}`,
    BUILT_RESULT: `\${{ needs.browser-built.result }}`,
  });
  for (const suites of ["success", "failure", "skipped", "cancelled"]) {
    for (const built of ["success", "failure", "skipped", "cancelled"]) {
      const result = Bun.spawnSync(["bash", "-e", "-c", gate.run], {
        env: { ...process.env, SUITES_RESULT: suites, BUILT_RESULT: built },
      });
      expect(result.exitCode === 0, `${suites}/${built}`).toBe(
        suites === "success" && built === "success",
      );
    }
  }
});

test("ordinary gate exposes named build and validation steps without losing checks", () => {
  expect(
    job("ci", "check")
      .steps.filter((step) => step.run?.startsWith("bun run "))
      .map((step) => ({ name: step.name, run: step.run })),
  ).toEqual([
    { name: "Build packages", run: "bun run build" },
    { name: "Lint", run: "bun run lint" },
    { name: "Typecheck", run: "bun run typecheck" },
    { name: "Check examples", run: "bun run --filter @kb.ui/storybook verify:code" },
    { name: "Run tests", run: "bun run test" },
    { name: "Check packages", run: "bun run test:pack" },
    { name: "Test consumer", run: "bun run test:consumer" },
    {
      name: "Build Storybook",
      run: "bun run --cwd apps/storybook build-storybook --output-dir dist/storybook",
    },
  ]);
});

test("PR consumer validation uses the local check without npm publishing", () => {
  const manifest = JSON.parse(readFileSync(`${root}/package.json`, "utf8"));
  expect(manifest.scripts["test:consumer"]).toBe("bun scripts/check-consumer.ts");
  expect(manifest.scripts.check).toEndWith("&& bun run test:consumer");
  expect(JSON.stringify(workflow("ci").jobs)).not.toMatch(/\bnpm publish\b/);
  expect(workflow("release").on.push.branches).toEqual(["main"]);
  expect(workflow("release").on.pull_request).toBeUndefined();
});

test("deployment workflow runs only on main and excludes Markdown-only pushes", () => {
  const site = workflow("deploy-site");
  expect(site.on.pull_request).toBeUndefined();
  expect(site.on.push.branches).toEqual(["main"]);
  expect(site.on.push.paths).toContain("!**/*.md");
  expect(job("deploy-site", "build").if).toBe("github.ref == 'refs/heads/main'");
});

test("production browser stages run independently and all gate artifact deployment", () => {
  const validation = job("deploy-site", "validation");
  expect(validation.if).toBe("github.ref == 'refs/heads/main'");
  expect(validation["runs-on"]).toBe("ubuntu-latest");
  expect(validation.strategy?.["fail-fast"]).toBe(false);
  expect(validation.strategy?.matrix.include).toEqual([
    { suite: "stories", name: "Test: stories" },
    { suite: "themes", name: "Test: themes" },
    { suite: "responsive", name: "Test: layouts" },
  ]);
  expect(validation.steps.map((step) => step.run)).toContain("bun run build");
  expect(validation.steps.map((step) => step.run)).toContain(
    `bun run validate:site \${{ matrix.suite }}`,
  );
  expect(job("deploy-site", "build").steps.map((step) => step.run)).toContain(
    "bun run validate:site built",
  );
  expect(job("deploy-site", "build").steps.map((step) => step.run)).not.toContain(
    "bun run validate:site",
  );
  const deploy = job("deploy-site", "deploy");
  expect(deploy.needs).toEqual(["build", "validation"]);
  expect(deploy.if).toBe("github.ref == 'refs/heads/main' && github.event_name != 'pull_request'");
  expect(JSON.stringify(validation.steps)).not.toContain("CLOUDFLARE_API_TOKEN");
  expect(validation.steps.some((step) => step.uses?.includes("upload-artifact"))).toBe(false);
});

test("deployment paths preserve generated API docs while excluding ordinary prose", () => {
  const paths = workflow("deploy-site").on.push.paths ?? [];
  const matches = (file: string) =>
    paths.reduce((matched, pattern) => {
      const negative = pattern.startsWith("!");
      return new Bun.Glob(negative ? pattern.slice(1) : pattern).match(file) ? !negative : matched;
    }, false);
  expect(matches("packages/react/README.md")).toBe(false);
  expect(matches("packages/react/docs/components/Button.md")).toBe(true);
  expect(matches("docs/guides/list-detail.md")).toBe(true);
  expect(matches("docs/guides/inbox.md")).toBe(true);
  expect(matches("docs/guides/components-and-recipes.md")).toBe(true);
  expect(matches("packages/css/README.md")).toBe(false);
  expect(matches("apps/storybook/site/README.md")).toBe(false);
  expect(matches("apps/storybook/docs/Introduction.mdx")).toBe(true);
  expect(matches("packages/react/src/index.ts")).toBe(true);
});

test("PR browser validation retains staged WebKit journeys and deployment dry-run", () => {
  const steps = JSON.stringify(job("ci", "browser-built").steps);
  expect(steps).toContain("bun run validate:site built");
  expect(JSON.stringify(job("deploy-site", "build").steps)).toContain("bun run validate:site");
  const validation = readFileSync(`${root}/scripts/validate-site.sh`, "utf8");
  for (const command of [
    "npm test --prefix deployment/site",
    // Only dark-theme pass over component stories.
    "test:themes",
    "bun scripts/site-stage.ts",
    "verify:release",
    "test:themes",
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

test("release notes clean npm mentions before assets run without changing real contributors", () => {
  const release = job("release", "release-please");
  const cleanup = release.steps.find((step) => step.name === "Keep npm scopes out of contributors");
  expect(cleanup?.if).toBe("steps.release.outputs.release_created == 'true'");
  expect(cleanup?.uses).toBe("actions/github-script@v7");
  expect(cleanup?.env?.TAG).toBe(`\${{ steps.release.outputs.tag_name }}`);
  const script = String(cleanup?.with?.script);
  expect(script).toContain("/scripts/release-mentions.mjs");
  expect(script).toContain("cleanReleaseNotes(github, context.repo, process.env.TAG)");
  expect(job("release", "assets").needs).toBe("release-please");
});

test("npm publish trusts GitHub OIDC only after every OS installs the release", () => {
  const publish = job("release", "publish");
  expect(publish.needs).toEqual(["release-please", "install"]);
  expect(publish.if).toContain("needs.install.result == 'success'");
  expect(publish.permissions).toEqual({ contents: "read", "id-token": "write" });
  const steps = JSON.stringify(publish.steps);
  expect(steps).toContain("actions/download-artifact");
  expect(steps).toContain("npm publish");
  expect(steps).not.toMatch(/NPM_TOKEN|NODE_AUTH_TOKEN|secrets\./);
});

test("manual publishing retries validate the tag and require a published release", async () => {
  expect(workflow("release").on.workflow_dispatch?.inputs.tag).toEqual({
    description: "Existing release tag (vX.Y.Z)",
    required: true,
    type: "string",
  });
  const retry = job("release", "release-please").steps.find(
    (step) => step.name === "Resolve release retry",
  );
  expect(retry?.if).toBe("github.event_name == 'workflow_dispatch'");
  if (!retry?.with?.script) throw new Error("Missing retry resolver");
  const outputs: Record<string, string> = {};
  const resolveRetry = new Function(
    "github",
    "context",
    "core",
    "process",
    `return (async () => { ${retry.with.script} })();`,
  );
  const github = {
    rest: {
      repos: { getReleaseByTag: async () => ({ data: { tag_name: "v0.10.1", draft: false } }) },
    },
  };
  await resolveRetry(
    github,
    { repo: { owner: "KhallilB", repo: "kbui" } },
    {
      setOutput: (key: string, value: string) => {
        outputs[key] = value;
      },
    },
    { env: { RETRY_TAG: "v0.10.1" } },
  );
  expect(outputs).toEqual({ release_created: "true", tag_name: "v0.10.1", version: "0.10.1" });
  await expect(
    resolveRetry(github, { repo: {} }, {}, { env: { RETRY_TAG: "main; echo unsafe" } }),
  ).rejects.toThrow("Expected release tag vX.Y.Z");
  await expect(
    resolveRetry(
      { rest: { repos: { getReleaseByTag: async () => ({ data: { draft: true } }) } } },
      { repo: {} },
      {},
      { env: { RETRY_TAG: "v0.10.1" } },
    ),
  ).rejects.toThrow("Release is a draft");
  expect(job("release", "release-please").outputs?.tag_name).toBe(
    `\${{ steps.release.outputs.tag_name || steps.retry.outputs.tag_name }}`,
  );
  for (const step of job("release", "release-please").steps.filter(
    (step) => step.uses === "googleapis/release-please-action@v4",
  ))
    expect(step.if).toBe("github.event_name == 'push'");
});

test("manual retries reuse uploaded bytes and never repack or replace release assets", async () => {
  const download = job("release", "assets").steps.find(
    (step) => step.name === "Reuse uploaded release tarballs",
  );
  expect(download?.if).toBe("github.event_name == 'workflow_dispatch'");
  if (!download?.with?.script) throw new Error("Missing tarball download");
  const files: Record<string, number[]> = {};
  const downloadAssets = new Function(
    "github",
    "context",
    "process",
    "require",
    "fetch",
    `return (async () => { ${download.with.script} })();`,
  );
  const github = {
    rest: {
      repos: {
        getReleaseByTag: async () => ({
          data: {
            assets: ["tokens", "css", "react"].map((name) => ({
              name: `kb.ui-${name}-0.10.1.tgz`,
              browser_download_url: `https://example.com/${name}`,
            })),
          },
        }),
      },
    },
  };
  await downloadAssets(
    github,
    { repo: {} },
    { env: { TAG: "v0.10.1", VERSION: "0.10.1" } },
    () => ({
      mkdirSync: () => {},
      writeFileSync: (path: string, data: Uint8Array) => {
        files[path] = [...data];
      },
    }),
    async () => ({ ok: true, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer }),
  );
  expect(files).toEqual({
    "release/kb.ui-tokens-0.10.1.tgz": [1, 2, 3],
    "release/kb.ui-css-0.10.1.tgz": [1, 2, 3],
    "release/kb.ui-react-0.10.1.tgz": [1, 2, 3],
  });
  await expect(
    downloadAssets(
      { rest: { repos: { getReleaseByTag: async () => ({ data: { assets: [] } }) } } },
      { repo: {} },
      { env: { TAG: "v0.10.1", VERSION: "0.10.1" } },
      () => ({}),
      async () => {
        throw new Error("Unexpected download");
      },
    ),
  ).rejects.toThrow("Missing release asset kb.ui-tokens-0.10.1.tgz");
  await expect(
    downloadAssets(
      github,
      { repo: {} },
      { env: { TAG: "v0.10.1", VERSION: "0.10.1" } },
      () => ({
        mkdirSync: () => {},
        writeFileSync: () => {
          throw new Error("Unexpected write");
        },
      }),
      async () => ({ ok: false, status: 503 }),
    ),
  ).rejects.toThrow("Download failed for kb.ui-tokens-0.10.1.tgz: 503");
  const pack = job("release", "assets").steps.find(
    (step) => step.name === "Pack every published package",
  );
  expect(pack?.if).toBe("github.event_name != 'workflow_dispatch'");
  const upload = job("release", "upload").steps.find((step) =>
    step.run?.includes("gh release upload"),
  );
  expect(upload?.if).toBe("github.event_name != 'workflow_dispatch'");
});

test("PR previews reuse either existing CI Storybook build", () => {
  for (const key of ["check", "browser-built"]) {
    const upload = job("ci", key).steps.find((step) => step.uses === "actions/upload-artifact@v4");
    expect(upload).toBeDefined();
    expect(upload?.with?.path).toBe("apps/storybook/dist/storybook/");
    expect(upload?.with?.name).toBe(`storybook-\${{ github.sha }}`);
    expect(upload?.with?.["if-no-files-found"]).toBe("error");
    expect(upload?.if).toContain("github.event_name == 'pull_request'");
    expect(upload?.if).toContain(
      "github.event.pull_request.head.repo.full_name == github.repository",
    );
  }
  const compile = job("ci", "check").steps.find((step) => step.run?.includes("build-storybook"));
  expect(compile?.run).toContain("--output-dir dist/storybook");
  const deploy = job("ci", "preview");
  expect(deploy.needs).toEqual(["check", "browser"]);
  const download = deploy.steps.find((step) => step.uses === "actions/download-artifact@v4");
  expect(download?.with?.name).toBe(`storybook-\${{ github.sha }}`);
  expect(download?.with?.path).toBe("deployment/site/public");
  expect(JSON.stringify(deploy.steps)).not.toMatch(/build-storybook|build:site|validate:site/);
});

test("preview credentials stay behind successful same-repository PR validation", () => {
  const preview = job("ci", "preview");
  for (const guard of [
    "always()",
    "github.event_name == 'pull_request'",
    "github.event.pull_request.head.repo.full_name == github.repository",
    "needs.check.result == 'success'",
    "needs.browser.result == 'success'",
    "needs.browser.result == 'skipped'",
  ])
    expect(preview.if).toContain(guard);
  expect(preview.environment?.name).toBe("kbui-preview");
  expect(preview.permissions).toEqual({
    contents: "read",
    deployments: "write",
    "pull-requests": "write",
  });
  expect(JSON.stringify(workflow("ci").on)).not.toContain("pull_request_target");
  const deploy = preview.steps.find((step) => step.name === "Deploy preview");
  expect(deploy?.env?.CLOUDFLARE_API_TOKEN).toBe(`\${{ secrets.CLOUDFLARE_API_TOKEN }}`);
  expect(preview.steps.filter((step) => step.env?.CLOUDFLARE_API_TOKEN)).toHaveLength(1);
  expect(deploy?.run).toContain("npm run configure:preview");
  expect(deploy?.run).toContain("npm run upload:preview");
  expect(deploy?.run).toContain(`--preview-alias "pr-\${PR_NUMBER}"`);
});

test("PR aliases identify separate URLs without deploying production traffic", () => {
  const preview = job("ci", "preview");
  const url = preview.environment?.url ?? "";
  expect(url.replace(`\${{ github.event.number }}`, "57")).toBe(
    "https://pr-57-kbui-site-preview.khallilbailey.workers.dev",
  );
  expect(url.replace(`\${{ github.event.number }}`, "58")).toBe(
    "https://pr-58-kbui-site-preview.khallilbailey.workers.dev",
  );
  const manifest = JSON.parse(readFileSync(`${root}/deployment/site/package.json`, "utf8"));
  expect(manifest.scripts["configure:preview"]).toBe(
    "cf workers triggers deploy --prebuilt --mode preview",
  );
  expect(manifest.scripts["upload:preview"]).toBe(
    "cf workers versions create --prebuilt --mode preview",
  );
  expect(JSON.stringify(preview.steps)).not.toContain("npm run deploy");
});

const commentContext = {
  repo: { owner: "example", repo: "ui" },
  payload: { number: 59, pull_request: { head: { sha: "abc123" } } },
};
const commentMarker = "<!-- kbui-storybook-preview -->";

async function runPreviewComment(
  comments: unknown[],
  files: { filename: string }[] = [],
  entries: Record<string, unknown>[] = [],
) {
  const steps = job("ci", "preview").steps;
  const step = steps.find((step) => step.name === "Post preview link");
  if (!step) throw new Error("Missing preview comment step");
  expect(step?.uses).toBe("actions/github-script@v7");
  expect(steps.indexOf(step)).toBeGreaterThan(
    steps.findIndex((step) => step.name === "Deploy preview"),
  );
  expect(step?.if).toBeUndefined();
  const writes: { kind: string; parameters: Record<string, unknown> }[] = [];
  const listComments = () => {};
  const listFiles = () => {};
  const github = {
    paginate: async (endpoint: unknown, parameters: Record<string, unknown>) => {
      if (endpoint === listFiles) {
        expect(parameters).toEqual({ ...commentContext.repo, pull_number: 59, per_page: 100 });
        return files;
      }
      expect(endpoint).toBe(listComments);
      expect(parameters).toEqual({ ...commentContext.repo, issue_number: 59, per_page: 100 });
      return comments;
    },
    rest: {
      pulls: { listFiles },
      issues: {
        listComments,
        createComment: async (parameters: Record<string, unknown>) => {
          writes.push({ kind: "create", parameters });
        },
        updateComment: async (parameters: Record<string, unknown>) => {
          writes.push({ kind: "update", parameters });
        },
      },
    },
  };
  const script = step?.with?.script;
  expect(typeof script).toBe("string");
  const requireFixture = (name: string) => {
    if (name === "node:path") return { posix };
    expect(name).toBe("node:fs");
    return {
      readFileSync: (path: string, encoding: string) => {
        expect(path).toBe("deployment/site/public/index.json");
        expect(encoding).toBe("utf8");
        return JSON.stringify({
          entries: Object.fromEntries(entries.map((entry, i) => [i, entry])),
        });
      },
    };
  };
  await new Function("github", "context", "require", `return (async () => {${script}})()`)(
    github,
    commentContext,
    requireFixture,
  );
  return writes;
}

test("successful preview posts its URL to the PR conversation", async () => {
  const writes = await runPreviewComment([]);
  expect(writes).toHaveLength(1);
  expect(writes[0]?.kind).toBe("create");
  expect(writes[0]?.parameters).toMatchObject({ ...commentContext.repo, issue_number: 59 });
  expect(writes[0]?.parameters.body).toContain(commentMarker);
  expect(writes[0]?.parameters.body).toContain(
    "[Browse all stories](https://pr-59-kbui-site-preview.khallilbailey.workers.dev)",
  );
  expect(writes[0]?.parameters.body).toContain("abc123");
});

test("preview links use built story IDs and documentation routes for changed PR files", async () => {
  const writes = await runPreviewComment(
    [],
    [
      { filename: "packages/react/src/components/Heading/Heading.stories.tsx" },
      { filename: "apps/storybook/docs/Tokens.mdx" },
    ],
    [
      {
        id: "custom-heading--article",
        type: "story",
        title: "Heading",
        name: "Article",
        importPath: "../../packages/react/src/components/Heading/Heading.stories.tsx",
      },
      {
        id: "tokens--docs",
        type: "docs",
        title: "Tokens",
        name: "Docs",
        importPath: "./docs/Tokens.mdx",
      },
      {
        id: "heading--docs",
        type: "docs",
        title: "Heading",
        name: "Docs",
        importPath: "../../packages/react/src/components/Heading/Heading.stories.tsx",
      },
      {
        id: "button--default",
        type: "story",
        title: "Button",
        name: "Default",
        importPath: "../../packages/react/src/components/Button/Button.stories.tsx",
      },
    ],
  );
  const body = writes[0]?.parameters.body as string;
  expect(body).toContain(
    "[Heading / Article](https://pr-59-kbui-site-preview.khallilbailey.workers.dev/?path=/story/custom-heading--article)",
  );
  expect(body).toContain("?path=/docs/tokens--docs");
  expect(body).not.toContain("heading--docs");
  expect(body).not.toContain("button--default");
  expect(body).toContain("Browse all stories");
});

test("component-only changes link affected indexed stories and skip unrelated sources", async () => {
  const writes = await runPreviewComment(
    [],
    [{ filename: "apps/storybook/site/Catalog.tsx" }],
    [
      {
        id: "catalog--browse",
        type: "story",
        title: "Catalog [browse]",
        name: "Browse",
        importPath: "./stories/Catalog.stories.tsx",
        componentPath: "./site/Catalog.tsx",
      },
      {
        id: "removed--story",
        type: "story",
        title: "Removed",
        name: "Story",
        importPath: "./stories/Removed.stories.tsx",
      },
    ],
  );
  const body = writes[0]?.parameters.body as string;
  expect(body).toContain("?path=/story/catalog--browse");
  expect(body).toContain("Catalog \\[browse\\]");
  expect(body).not.toContain("removed--story");
});

test("shared dependency changes keep browse fallback without claiming changed stories", async () => {
  const writes = await runPreviewComment([], [{ filename: "packages/tokens/src/tokens.json" }]);
  const body = writes[0]?.parameters.body as string;
  expect(body).toContain("Browse all stories");
  expect(body).not.toContain("### Changed stories");
});

test("large story changes keep comment bounded and retain browse access", async () => {
  const entries = Array.from({ length: 45 }, (_, i) => ({
    id: `catalog--story-${i}`,
    type: "story",
    title: "Catalog",
    name: `Story ${i}`,
    importPath: "./stories/Catalog.stories.tsx",
  }));
  const writes = await runPreviewComment(
    [],
    [{ filename: "apps/storybook/stories/Catalog.stories.tsx" }],
    entries,
  );
  const body = writes[0]?.parameters.body as string;
  expect(body.match(/\?path=\/story\//g)).toHaveLength(40);
  expect(body).toContain("Showing 40 of 45");
  expect(body).toContain("Browse all stories");
});

test("later previews update the existing Actions comment without duplicates", async () => {
  const writes = await runPreviewComment([
    { id: 10, body: commentMarker, user: { type: "User", login: "reviewer" } },
    { id: 11, body: "Unrelated automation", user: { login: "github-actions[bot]" } },
    { id: 12, body: commentMarker, user: { login: "github-actions[bot]" } },
  ]);
  expect(writes).toHaveLength(1);
  expect(writes[0]?.kind).toBe("update");
  expect(writes[0]?.parameters).toMatchObject({ ...commentContext.repo, comment_id: 12 });
  expect(writes[0]?.parameters.body).toContain("abc123");
});

test("every npm publication and recovery verifies registry READMEs after publishing", () => {
  const steps = job("release", "publish").steps;
  const publish = steps.findIndex((step) => step.name === "Publish each tarball to npm");
  const verify = steps.findIndex((step) => step.name === "Verify published READMEs and integrity");
  expect(verify).toBeGreaterThan(publish);
  expect(steps[verify]?.if).toBeUndefined();
  expect(steps[verify]?.run).toBe("node scripts/release-readmes.ts release");
  expect(steps[verify]?.env?.ALLOW_HISTORICAL).toBe(
    `\${{ github.event_name == 'workflow_dispatch' }}`,
  );
  expect(steps.some((step) => step.uses === "actions/checkout@v4")).toBe(true);
});
