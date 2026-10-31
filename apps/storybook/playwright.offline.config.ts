import { defineConfig } from "playwright/test";
import config from "./playwright.config.ts";

export default defineConfig({
  ...config,
  projects: [{ name: "chromium", testMatch: "overrides.spec.ts" }],
  webServer: [],
});
