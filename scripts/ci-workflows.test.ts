import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { posix, resolve } from "node:path";

type Workflow = {
  on: { push: { branches?: string[]; paths?: string[] }; pull_request?: unknown };
  jobs: Record<
    string,
    {
      container?: { image: string };
      if?: string;
      needs?: string[];
      permissions?: Record<string, string>;
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

test("PR previews reuse either existing CI Storybook build", () => {
  for (const key of ["check", "browser"]) {
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
  const deploy = preview.steps.find((step) => step.name === "Publish Storybook preview");
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
  const step = steps.find((step) => step.name === "Comment Storybook preview");
  if (!step) throw new Error("Missing preview comment step");
  expect(step?.uses).toBe("actions/github-script@v7");
  expect(steps.indexOf(step)).toBeGreaterThan(
    steps.findIndex((step) => step.name === "Publish Storybook preview"),
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
