import assert from "node:assert/strict";
import test from "node:test";
import { cleanupPreview } from "./cleanup-preview.mjs";

const context = { repo: { owner: "example", repo: "ui" }, payload: { number: 59 } };
const sha = "a".repeat(40);
const version = (id, pr = 59) => ({ id, annotations: { "workers/message": `PR ${pr} ${sha}` } });
const ids = [1, 2, 3].map((n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`);

function fixture({
  state = "closed",
  fork = false,
  pages = [[version(ids[0])]],
  active = [],
} = {}) {
  const calls = [];
  const deleted = [];
  const github = {
    rest: {
      pulls: {
        get: async (parameters) => {
          assert.deepEqual(parameters, { ...context.repo, pull_number: 59 });
          return {
            data: { state, head: { repo: { full_name: fork ? "other/ui" : "example/ui" } } },
          };
        },
      },
    },
  };
  const fetch = async (url, options) => {
    const parsed = new URL(url);
    assert.equal(parsed.origin, "https://api.cloudflare.com");
    assert.equal(options.headers.Authorization, "Bearer test-token");
    calls.push(`${options.method} ${parsed.pathname}${parsed.search}`);
    if (options.method === "DELETE") {
      const id = parsed.pathname.split("/").at(-1);
      assert.ok(pages.flat().some((item) => item.id === id));
      deleted.push(id);
      return Response.json({ success: true });
    }
    if (parsed.pathname.endsWith("/deployments")) {
      return Response.json({
        success: true,
        result: {
          deployments: [
            { versions: active.map((version_id) => ({ version_id, percentage: 100 })) },
          ],
        },
      });
    }
    assert.equal(
      parsed.pathname,
      "/client/v4/accounts/test-account/workers/workers/kbui-site-preview/versions",
    );
    const page = Number(parsed.searchParams.get("page"));
    return Response.json({
      success: true,
      result: pages[page - 1].filter((item) => !deleted.includes(item.id)),
      result_info: { page, total_pages: pages.length },
    });
  };
  return {
    calls,
    deleted,
    options: {
      github,
      context,
      fetch,
      env: { CLOUDFLARE_ACCOUNT_ID: "test-account", CLOUDFLARE_API_TOKEN: "test-token" },
    },
  };
}

test("closing or merging removes every matching PR version across pages, leaving other PRs", async () => {
  const f = fixture({ pages: [[version(ids[0]), version(ids[1], 590)], [version(ids[2])]] });
  assert.equal(await cleanupPreview(f.options), true);
  assert.deepEqual(f.deleted, [ids[0], ids[2]]);
  const firstDelete = f.calls.findIndex((call) => call.startsWith("DELETE"));
  assert.ok(f.calls.slice(0, firstDelete).some((call) => call.includes("page=2")));
  assert.ok(
    f.calls
      .filter((call) => call.startsWith("DELETE"))
      .every((call) => call.includes("/workers/workers/kbui-site-preview/versions/")),
  );
});

test("reopened and fork PRs never contact Cloudflare", async () => {
  for (const input of [{ state: "open" }, { fork: true }]) {
    const f = fixture(input);
    assert.equal(await cleanupPreview(f.options), false);
    assert.deepEqual(f.calls, []);
  }
});

test("retries and PRs without previews succeed without additional deletion", async () => {
  const f = fixture();
  await cleanupPreview(f.options);
  await cleanupPreview(f.options);
  assert.deepEqual(f.deleted, [ids[0]]);
  const empty = fixture({ pages: [[]] });
  assert.equal(await cleanupPreview(empty.options), true);
  assert.deepEqual(empty.deleted, []);
});

test("unrecognized upload metadata never authorizes deletion", async () => {
  const f = fixture({
    pages: [
      [
        { id: ids[0] },
        { id: ids[1], annotations: { "workers/message": "PR 59 manual deployment" } },
      ],
    ],
  });
  await cleanupPreview(f.options);
  assert.deepEqual(f.deleted, []);
});

test("matching version serving live traffic blocks cleanup before any deletion", async () => {
  const f = fixture({ pages: [[version(ids[0]), version(ids[1])]], active: [ids[1]] });
  await assert.rejects(cleanupPreview(f.options), /serving live traffic/);
  assert.deepEqual(f.deleted, []);
});

test("API rejection and malformed listings fail instead of reporting cleanup success", async () => {
  for (const response of [
    Response.json(
      { success: false, errors: [{ code: 10000, message: "Authentication error" }] },
      { status: 403 },
    ),
    Response.json({ success: true, result: {} }),
  ]) {
    const f = fixture();
    f.options.fetch = async () => response;
    await assert.rejects(cleanupPreview(f.options));
    assert.deepEqual(f.deleted, []);
  }
});

test("delete failure stays visible and preserves later versions for a retry", async () => {
  const f = fixture({ pages: [[version(ids[0]), version(ids[1])]] });
  const original = f.options.fetch;
  f.options.fetch = (url, options) =>
    options.method === "DELETE"
      ? Promise.resolve(Response.json({ success: false }, { status: 500 }))
      : original(url, options);
  await assert.rejects(cleanupPreview(f.options), /Cloudflare/);
  assert.deepEqual(f.deleted, []);
});

test("accepted deletion must remove versions from Cloudflare before cleanup succeeds", async () => {
  const f = fixture();
  const original = f.options.fetch;
  f.options.fetch = (url, options) =>
    options.method === "DELETE"
      ? Promise.resolve(Response.json({ success: true }))
      : original(url, options);
  await assert.rejects(cleanupPreview(f.options), /still contains PR preview versions/);
});

test("missing credentials and unsafe version identifiers fail before deletion", async () => {
  const missing = fixture();
  missing.options.env = {};
  await assert.rejects(cleanupPreview(missing.options), /CLOUDFLARE/);
  assert.deepEqual(missing.calls, []);
  const unsafe = fixture({ pages: [[version("latest")]] });
  await assert.rejects(cleanupPreview(unsafe.options), /version ID/);
  assert.deepEqual(unsafe.deleted, []);
});
