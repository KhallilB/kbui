import { expect, test } from "bun:test";
import { mergeReleasePR, verifyReleasePR } from "./release-automerge.mjs";

const base = "a".repeat(40);
const head = "b".repeat(40);
const merged = "c".repeat(40);
const repo = { owner: "KhallilB", repo: "kbui" };
const bot = { login: "github-actions[bot]", id: 41898282 };
const encode = (value) => ({
  type: "file",
  encoding: "base64",
  content: Buffer.from(value).toString("base64"),
});
const json = JSON.stringify;

function fixture() {
  const pr = {
    number: 94,
    state: "open",
    draft: false,
    user: bot,
    title: "chore(main): release 0.10.5",
    labels: [{ name: "autorelease: pending" }],
    head: {
      sha: head,
      ref: "release-please--branches--main--components--kbui",
      repo: { full_name: "KhallilB/kbui" },
    },
    base: { sha: base, ref: "main" },
  };
  const paths = [
    "package.json",
    ".release-please-manifest.json",
    "CHANGELOG.md",
    "packages/react/package.json",
    "README.md",
  ];
  const original = {
    "package.json": json({ name: "kbui", version: "0.10.4", scripts: { check: "bun run check" } }),
    ".release-please-manifest.json": json({ ".": "0.10.4" }),
    "CHANGELOG.md": "# Changelog\n\n## Old history\n",
    "packages/react/package.json": json({ name: "@kb.ui/react", version: "0.10.4" }),
    "README.md":
      "History 0.9.0\n<!-- x-release-please-start-version -->\nnpm install @kb.ui/react@0.10.4\n<!-- x-release-please-end -->\n",
    "release-please-config.json": json({
      packages: {
        ".": {
          "extra-files": [
            { type: "json", path: "packages/react/package.json", jsonpath: "$.version" },
            { type: "generic", path: "README.md" },
          ],
        },
      },
    }),
  };
  const updated = Object.fromEntries(
    Object.entries(original).map(([path, text]) => [path, text.replaceAll("0.10.4", "0.10.5")]),
  );
  updated["CHANGELOG.md"] =
    "# Changelog\n\n## [0.10.5](https://example.test)\n\nNotes.\n\n## Old history\n";
  const signature = { verified: true, reason: "valid" };
  const commit = {
    sha: head,
    parents: [{ sha: base }],
    author: { email: "41898282+github-actions[bot]@users.noreply.github.com" },
    verification: signature,
  };
  const review = {
    reviewDecision: null,
    reviewThreads: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } },
  };
  const calls = [];
  const reviews = [];
  const data = { main: base, pr, paths, original, updated, commit, review, reviews };
  const github = {
    paginate: async (method, args) => (await method(args)).data,
    graphql: async () => ({ repository: { pullRequest: review } }),
    rest: {
      pulls: {
        get: async () => ({ data: pr }),
        listFiles: async () => ({
          data: paths.map((filename) => ({ filename, status: "modified" })),
        }),
        listCommits: async () => ({ data: [{ sha: head }] }),
        listReviews: async () => ({ data: reviews }),
        merge: async (args) => {
          calls.push({ kind: "merge", ...args });
          pr.merged = true;
          pr.merge_commit_sha = merged;
          return { data: { merged: true, sha: merged } };
        },
      },
      repos: {
        getContent: async ({ path, ref }) => ({
          data: encode((ref === head ? updated : original)[path]),
        }),
      },
      git: {
        getRef: async () => ({ data: { object: { sha: data.main } } }),
        getCommit: async ({ commit_sha }) => ({
          data:
            commit_sha === merged
              ? { parents: [{ sha: base }, { sha: head }], verification: signature }
              : commit,
        }),
      },
      actions: {
        createWorkflowDispatch: async (args) => {
          calls.push({ kind: "dispatch", ...args });
        },
      },
    },
  };
  return { data, github, calls, signature };
}

test("accepts only the signed generated release delta and returns immutable check inputs", async () => {
  const { github } = fixture();
  expect(await verifyReleasePR(github, repo, 94)).toEqual({
    number: 94,
    head,
    base,
    version: "0.10.5",
  });
});

for (const failure of [
  "author",
  "fork",
  "branch",
  "draft",
  "closed",
  "base",
  "signature",
  "signer",
  "parent",
  "workflow",
  "script",
  "prose",
  "history",
  "version",
  "review",
  "thread",
]) {
  test(`refuses ${failure} before a privileged merge`, async () => {
    const { data, github, calls } = fixture();
    if (failure === "author") data.pr.user = { ...bot, id: 7 };
    if (failure === "fork") data.pr.head.repo.full_name = "other/kbui";
    if (failure === "branch") data.pr.head.ref = "feature/user-change";
    if (failure === "draft") data.pr.draft = true;
    if (failure === "closed") data.pr.state = "closed";
    if (failure === "base") data.main = "d".repeat(40);
    if (failure === "signature") data.commit.verification = { verified: false, reason: "unsigned" };
    if (failure === "signer") data.commit.author.email = "other@example.test";
    if (failure === "parent") data.commit.parents = [{ sha: "d".repeat(40) }];
    if (failure === "workflow") data.paths.push(".github/workflows/release.yml");
    if (failure === "script")
      data.updated["package.json"] = json({
        name: "kbui",
        version: "0.10.5",
        scripts: { check: "echo bypass" },
      });
    if (failure === "prose") data.updated["README.md"] += "Unreviewed text\n";
    if (failure === "history")
      data.updated["CHANGELOG.md"] = data.updated["CHANGELOG.md"].replace(
        "Old history",
        "Rewritten history",
      );
    if (failure === "version")
      data.updated["packages/react/package.json"] = data.original["packages/react/package.json"];
    if (failure === "review") data.review.reviewDecision = "CHANGES_REQUESTED";
    if (failure === "thread") data.review.reviewThreads.nodes.push({ isResolved: false });
    await expect(verifyReleasePR(github, repo, 94)).rejects.toThrow();
    expect(calls).toEqual([]);
  });
}

test("rechecks changed head and main after checks, without merging stale results", async () => {
  for (const change of ["head", "base"]) {
    const { github, data, calls } = fixture();
    const checked = await verifyReleasePR(github, repo, 94);
    if (change === "head") data.pr.head.sha = "d".repeat(40);
    else data.main = "d".repeat(40);
    await expect(mergeReleasePR(github, repo, checked)).rejects.toThrow();
    expect(calls).toEqual([]);
  }
});

test("merges checked SHA with a merge commit then explicitly starts all downstream workflows", async () => {
  const { github, calls } = fixture();
  const checked = await verifyReleasePR(github, repo, 94);
  expect(await mergeReleasePR(github, repo, checked)).toBe(merged);
  expect(calls[0]).toMatchObject({
    kind: "merge",
    pull_number: 94,
    sha: head,
    merge_method: "merge",
  });
  expect(
    calls
      .filter((call) => call.kind === "dispatch")
      .map(({ workflow_id, ref }) => ({ workflow_id, ref })),
  ).toEqual(
    ["ci.yml", "deploy-site.yml", "release.yml"].map((workflow_id) => ({
      workflow_id,
      ref: "main",
    })),
  );
});

test("merge retry resumes dispatch without merging twice", async () => {
  const { github, calls } = fixture();
  const checked = await verifyReleasePR(github, repo, 94);
  let failed = false;
  const dispatch = github.rest.actions.createWorkflowDispatch;
  github.rest.actions.createWorkflowDispatch = async (args) => {
    if (!failed) {
      failed = true;
      throw new Error("Network failure");
    }
    return dispatch(args);
  };
  await expect(mergeReleasePR(github, repo, checked)).rejects.toThrow("Network failure");
  expect(await mergeReleasePR(github, repo, checked)).toBe(merged);
  expect(calls.filter((call) => call.kind === "merge")).toHaveLength(1);
  expect(calls.filter((call) => call.kind === "dispatch")).toHaveLength(3);
});

test("invalid merge signature never starts publication or deployment", async () => {
  const { github, calls, signature } = fixture();
  const checked = await verifyReleasePR(github, repo, 94);
  const merge = github.rest.pulls.merge;
  github.rest.pulls.merge = async (args) => {
    const result = await merge(args);
    signature.verified = false;
    return result;
  };
  await expect(mergeReleasePR(github, repo, checked)).rejects.toThrow();
  expect(calls.filter((call) => call.kind === "dispatch")).toEqual([]);
});

test("requested changes remain blocking when a later review only comments", async () => {
  const { data, github } = fixture();
  data.reviews.push(
    { id: 1, user: { id: 7 }, state: "CHANGES_REQUESTED" },
    { id: 2, user: { id: 7 }, state: "COMMENTED" },
  );
  await expect(verifyReleasePR(github, repo, 94)).rejects.toThrow("Requested changes");
  data.reviews.push({ id: 3, user: { id: 7 }, state: "APPROVED" });
  expect((await verifyReleasePR(github, repo, 94)).head).toBe(head);
});

test("unresolved threads beyond the first page block release", async () => {
  const { github } = fixture();
  github.graphql = async (_query, { after }) => ({
    repository: {
      pullRequest: {
        reviewDecision: null,
        reviewThreads: after
          ? { nodes: [{ isResolved: false }], pageInfo: { hasNextPage: false } }
          : { nodes: [], pageInfo: { hasNextPage: true, endCursor: "page2" } },
      },
    },
  });
  await expect(verifyReleasePR(github, repo, 94)).rejects.toThrow("Unresolved review");
});

test("actual workflow scripts bind checks and merging to the controlling main revision", async () => {
  const workflow = Bun.YAML.parse(
    await Bun.file(new URL("../.github/workflows/release.yml", import.meta.url)).text(),
  );
  const checkScript = workflow.jobs["release-pr-check"].steps.find(
    (step) => step.id === "candidate",
  ).with.script;
  const mergeScript = workflow.jobs["release-pr-merge"].steps.find(
    (step) => step.name === "Merge unchanged release and start downstream workflows",
  ).with.script;
  const execute = (script, github, context, core, env) =>
    new Function("github", "context", "core", "process", `return (async () => { ${script} })();`)(
      github,
      context,
      core,
      {
        env: {
          GITHUB_WORKSPACE: new URL("..", import.meta.url).pathname.replace(/\/$/, ""),
          ...env,
        },
      },
    );
  const { github, calls } = fixture();
  const outputs = {};
  await execute(
    checkScript,
    github,
    { repo, sha: base },
    {
      setOutput: (key, value) => {
        outputs[key] = value;
      },
    },
    { PR_NUMBER: "94" },
  );
  expect(outputs).toEqual({ number: 94, head, base, version: "0.10.5" });
  await expect(
    execute(
      checkScript,
      github,
      { repo, sha: "d".repeat(40) },
      { setOutput: () => {} },
      { PR_NUMBER: "94" },
    ),
  ).rejects.toThrow("Main changed since this workflow started");
  await expect(
    execute(
      mergeScript,
      github,
      { repo, sha: "d".repeat(40) },
      {},
      { CHECKED_RELEASE: json(outputs) },
    ),
  ).rejects.toThrow("another main revision");
  expect(calls).toEqual([]);
  await execute(
    mergeScript,
    github,
    { repo, sha: base },
    { info: () => {} },
    { CHECKED_RELEASE: json({ ...outputs, number: "94" }) },
  );
  expect(calls.filter((call) => call.kind === "merge")).toHaveLength(1);
});
