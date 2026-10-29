import assert from "node:assert/strict";

const botEmail = "41898282+github-actions[bot]@users.noreply.github.com";
const versionPattern = /\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?/;

function identity(pr, repo) {
  assert.equal(pr.user?.id, 41898282, "Release PR must belong to GitHub Actions");
  assert.equal(pr.user?.login, "github-actions[bot]");
  assert.equal(pr.head.repo?.full_name, `${repo.owner}/${repo.repo}`, "Fork release refused");
  assert.equal(pr.head.ref, "release-please--branches--main--components--kbui");
  assert.equal(pr.base.ref, "main");
  assert.match(pr.head.sha, /^[a-f0-9]{40}$/);
  assert.match(pr.base.sha, /^[a-f0-9]{40}$/);
  const version = /^chore\(main\): release (\d+\.\d+\.\d+)$/.exec(pr.title)?.[1];
  assert(version, "Expected generated stable release title");
  return version;
}

function signed(commit) {
  assert.equal(commit.verification?.verified, true, "Commit signature must be verified");
  assert.equal(commit.verification?.reason, "valid");
}

async function noReviewObligations(github, repo, number) {
  const reviews = await github.paginate(github.rest.pulls.listReviews, {
    ...repo,
    pull_number: number,
  });
  const decisions = new Map();
  for (const review of reviews.sort((a, b) => a.id - b.id)) {
    if (["APPROVED", "CHANGES_REQUESTED", "DISMISSED"].includes(review.state))
      decisions.set(review.user.id, review.state);
  }
  assert(![...decisions.values()].includes("CHANGES_REQUESTED"), "Requested changes block release");
  let after = null;
  do {
    const result = await github.graphql(
      `query($owner:String!,$name:String!,$number:Int!,$after:String) {
      repository(owner:$owner,name:$name) { pullRequest(number:$number) {
        reviewDecision
        reviewThreads(first:100,after:$after) { nodes { isResolved } pageInfo { hasNextPage endCursor } }
      } }
    }`,
      { owner: repo.owner, name: repo.repo, number, after },
    );
    const review = result.repository.pullRequest;
    assert.notEqual(review.reviewDecision, "CHANGES_REQUESTED", "Requested changes block release");
    const threads = review.reviewThreads;
    assert(
      threads.nodes.every((thread) => thread.isResolved),
      "Unresolved review blocks release",
    );
    if (!threads.pageInfo.hasNextPage) break;
    assert(
      threads.pageInfo.endCursor && threads.pageInfo.endCursor !== after,
      "Invalid review pagination",
    );
    after = threads.pageInfo.endCursor;
  } while (after);
}

export async function verifyReleasePR(github, repo, number) {
  number = Number(number);
  assert(Number.isSafeInteger(number) && number > 0, "Expected release PR number");
  const { data: pr } = await github.rest.pulls.get({ ...repo, pull_number: number });
  const version = identity(pr, repo);
  assert.equal(pr.state, "open");
  assert.equal(pr.draft, false);
  assert(pr.labels.some((label) => label.name === "autorelease: pending"));
  const currentMain = async () =>
    (await github.rest.git.getRef({ ...repo, ref: "heads/main" })).data.object.sha;
  assert.equal(await currentMain(), pr.base.sha, "Main changed; release needs fresh checks");
  const commits = await github.paginate(github.rest.pulls.listCommits, {
    ...repo,
    pull_number: number,
  });
  assert.equal(commits.length, 1, "Only the generated release commit is allowed");
  assert.equal(commits[0].sha, pr.head.sha);
  const { data: commit } = await github.rest.git.getCommit({ ...repo, commit_sha: pr.head.sha });
  signed(commit);
  assert.equal(commit.author.email, botEmail, "Release commit must be signed for the bot identity");
  assert.deepEqual(
    commit.parents.map(({ sha }) => sha),
    [pr.base.sha],
  );

  const read = async (ref, path) => {
    const { data } = await github.rest.repos.getContent({ ...repo, ref, path });
    assert.equal(data.type, "file");
    assert.equal(data.encoding, "base64");
    return Buffer.from(data.content, "base64").toString("utf8");
  };
  const config = JSON.parse(await read(pr.base.sha, "release-please-config.json")).packages["."];
  const extra = config["extra-files"] ?? [];
  const changelog = config["changelog-path"] ?? "CHANGELOG.md";
  const allowed = new Set([
    "package.json",
    ".release-please-manifest.json",
    changelog,
    ...extra.map(({ path }) => path),
  ]);
  const files = await github.paginate(github.rest.pulls.listFiles, {
    ...repo,
    pull_number: number,
  });
  assert(
    files.length > 0 &&
      files.every((file) => allowed.has(file.filename) && file.status === "modified"),
    "Unexpected release files",
  );
  const currentVersion = JSON.parse(await read(pr.base.sha, "package.json")).version;
  const previous = currentVersion.split(".").map(Number);
  const next = version.split(".").map(Number);
  assert(
    next.some(
      (value, index) =>
        value > previous[index] && next.slice(0, index).every((part, i) => part === previous[i]),
    ),
    "Release version must increase",
  );
  for (const path of allowed) {
    const before = await read(pr.base.sha, path);
    const after = await read(pr.head.sha, path);
    if (path === changelog) {
      const header = "# Changelog\n\n";
      assert(
        before.startsWith(header) &&
          after.startsWith(`${header}## [${version}](`) &&
          after.endsWith(before.slice(header.length)),
        "Changelog history changed",
      );
    } else if (path.endsWith(".json")) {
      const field = path === ".release-please-manifest.json" ? "." : "version";
      const oldValue = JSON.parse(before);
      const newValue = JSON.parse(after);
      assert.equal(newValue[field], version, `${path} must use the release version`);
      assert.deepEqual(
        newValue,
        { ...oldValue, [field]: version },
        `${path} changes more than version metadata`,
      );
    } else {
      assert(extra.some((entry) => entry.path === path && entry.type === "generic"));
      let blocks = 0;
      const expected = before.replace(
        /(x-release-please-start-version[^\n]*\n)([\s\S]*?)(x-release-please-end)/g,
        (_, start, body, end) => {
          blocks++;
          return (
            start +
            body
              .split("\n")
              .map((line) => line.replace(versionPattern, version))
              .join("\n") +
            end
          );
        },
      );
      assert(
        blocks > 0 && after === expected,
        `${path} changes more than managed version examples`,
      );
    }
  }
  await noReviewObligations(github, repo, number);
  assert.equal(await currentMain(), pr.base.sha, "Main moved during release validation");
  return { number, head: pr.head.sha, base: pr.base.sha, version };
}

export async function mergeReleasePR(github, repo, checked) {
  const { data: pr } = await github.rest.pulls.get({ ...repo, pull_number: checked.number });
  assert.equal(identity(pr, repo), checked.version);
  assert.equal(pr.head.sha, checked.head, "Release head changed after checks");
  let sha = pr.merge_commit_sha;
  if (!pr.merged) {
    assert.deepEqual(
      await verifyReleasePR(github, repo, checked.number),
      checked,
      "Release changed after checks",
    );
    const { data: result } = await github.rest.pulls.merge({
      ...repo,
      pull_number: checked.number,
      sha: checked.head,
      merge_method: "merge",
    });
    assert.equal(result.merged, true, "GitHub refused release merge");
    sha = result.sha;
  }
  const { data: merge } = await github.rest.git.getCommit({ ...repo, commit_sha: sha });
  signed(merge);
  assert.deepEqual(
    merge.parents.map(({ sha }) => sha),
    [checked.base, checked.head],
    "Merge did not preserve checked parents",
  );
  // GITHUB_TOKEN merges suppress push workflows; dispatch them explicitly.
  // Retry resumes dispatch after an existing merge without rewriting commits.
  for (const workflow_id of ["ci.yml", "deploy-site.yml", "release.yml"]) {
    await github.rest.actions.createWorkflowDispatch({ ...repo, workflow_id, ref: "main" });
  }
  return sha;
}
