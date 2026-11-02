import { defineConfig } from "playwright/test";
import { landingProfiles, releaseProfiles } from "./e2e/profiles.ts";
import { externalSiteURL, siteURL } from "./e2e/urls.ts";

export default defineConfig({
  testDir: "./e2e",
  projects: [
    {
      name: "chromium",
      testMatch: [
        "recipes.spec.ts",
        "storybook.spec.ts",
        "component-docs.spec.ts",
        "depth.spec.ts",
        "runtime.spec.ts",
        "runtime-recipes.spec.ts",
        "theme.spec.ts",
        "previews.spec.ts",
      ],
      use: { browserName: "chromium" },
    },
    { name: "webkit", testMatch: "runtime-recipes.spec.ts", use: { browserName: "webkit" } },
    ...landingProfiles
      .filter(
        (profile) => !process.env.LANDING_PROFILE || profile.name === process.env.LANDING_PROFILE,
      )
      .map((profile) => ({
        name: `landing-${profile.name}`,
        testMatch: "landing.spec.ts",
        metadata: { profile },
        use: {
          browserName: profile.browserName,
          viewport: { width: profile.width, height: profile.height },
          actionTimeout: 8000,
          navigationTimeout: 8000,
        },
      })),
    ...releaseProfiles
      .filter(
        (profile) => !process.env.RELEASE_PROFILE || profile.name === process.env.RELEASE_PROFILE,
      )
      .filter(
        (profile) =>
          !process.env.RELEASE_BROWSER || profile.browserName === process.env.RELEASE_BROWSER,
      )
      .map((profile) => ({
        name: profile.name,
        testMatch: "release.spec.ts",
        metadata: { profile },
        use: {
          browserName: profile.browserName,
          viewport: { width: profile.width, height: profile.height },
          isMobile: true,
          hasTouch: true,
          deviceScaleFactor: 2,
          actionTimeout: 8000,
          navigationTimeout: 8000,
        },
      })),
  ],
  forbidOnly: Boolean(process.env.CI),
  workers: 1,
  retries: 0,
  timeout: 120_000,
  reporter: "list",
  outputDir: ".playwright/test-results",
  use: {
    baseURL: siteURL,
    browserName: "chromium",
    viewport: { width: 1280, height: 720 },
    reducedMotion: "no-preference",
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
    screenshot: "only-on-failure",
  },
  ...(!externalSiteURL && {
    webServer: {
      command: "bun run preview:site --port 4177",
      url: `${siteURL}/storybook/index.json`,
      reuseExistingServer: false,
    },
  }),
});
