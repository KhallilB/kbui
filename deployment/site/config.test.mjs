import assert from "node:assert/strict";
import test from "node:test";
import config from "./cloudflare.config.ts";

test("production attaches only the kbui subdomain", async () => {
  const { worker } = await config({ mode: "production", isPreview: false });
  assert.equal(worker.name, "kbui-site");
  assert.deepEqual(worker.domains, ["kbui.kcb.pro"]);
  assert.deepEqual(worker.triggers, []);
  assert.equal(worker.assets.notFoundHandling, "none");
  assert.equal(worker.assets.htmlHandling, "auto-trailing-slash");
});
test("preview is a different Worker with no portfolio routes", async () => {
  for (const mode of ["preview", undefined]) {
    const { worker } = await config({ mode, isPreview: true });
    assert.equal(worker.name, "kbui-site-preview");
    assert.equal(worker.previewUrls, true);
    assert.deepEqual(worker.triggers, []);
    assert.deepEqual(worker.domains, []);
  }
});
