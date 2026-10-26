import { defineConfig, triggers } from "cf/config";

export default defineConfig(({ mode }) => ({
  worker: {
    name: mode === "production" ? "kbui-site" : "kbui-site-preview",
    compatibilityDate: "2026-10-26",
    workersDev: true,
    assets: { htmlHandling: "auto-trailing-slash", notFoundHandling: "none" },
    triggers:
      mode === "production"
        ? [
            triggers.fetch({ pattern: "kcb.pro/kbui", zone: "kcb.pro" }),
            triggers.fetch({ pattern: "kcb.pro/kbui/*", zone: "kcb.pro" }),
          ]
        : [],
  },
}));
