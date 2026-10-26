import assert from "node:assert/strict";
import test from "node:test";
import config from "./cloudflare.config.ts";

test("production owns only kbui's two route patterns", async () => {
  const { worker } = await config({ mode: "production", isPreview: false });
  assert.equal(worker.name, "kbui-site");
  assert.deepEqual(worker.triggers, [
    { type: "fetch", pattern: "kcb.pro/kbui", zone: "kcb.pro" },
    { type: "fetch", pattern: "kcb.pro/kbui/*", zone: "kcb.pro" },
  ]);
  assert.equal(worker.assets.notFoundHandling, "none");
  assert.equal(worker.assets.htmlHandling, "auto-trailing-slash");
});
test("preview is a different Worker with no portfolio routes", async () => {
  for (const mode of ["preview", undefined]) {
    const { worker } = await config({ mode, isPreview: true });
    assert.equal(worker.name, "kbui-site-preview");
    assert.deepEqual(worker.triggers, []);
  }
});
