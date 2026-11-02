import { defineConfig } from "playwright/test";
import { controlProfiles } from "./e2e/profiles.ts";
import { externalInternalURL, internalURL } from "./e2e/urls.ts";
import config from "./playwright.config.ts";

export default defineConfig({
  ...config,
  projects: [
    ...controlProfiles
      .filter(
        (profile) =>
          !process.env.CONTROL_EDGES_PROFILE || profile.name === process.env.CONTROL_EDGES_PROFILE,
      )
      .map((profile) => ({
        name: `controls-${profile.name}`,
        testMatch: "controls.spec.ts",
        metadata: { profile },
        use: {
          browserName: profile.browserName,
          viewport: { width: profile.width, height: profile.height },
          actionTimeout: 8000,
          navigationTimeout: 8000,
        },
      })),
    ...(["chromium", "webkit"] as const).map((browserName) => ({
      name: `focus-${browserName}`,
      testMatch: "focus.spec.ts",
      use: { browserName },
    })),
  ],
  use: { ...config.use, baseURL: internalURL },
  webServer: externalInternalURL
    ? []
    : {
        command:
          "bun run build:internal --output-dir .playwright/internal/storybook && ./node_modules/.bin/vite preview --host 127.0.0.1 --port 4178 --strictPort --outDir .playwright/internal",
        url: `${internalURL}/storybook/index.json`,
        timeout: 120_000,
        reuseExistingServer: false,
      },
});
