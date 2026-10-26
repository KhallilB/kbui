import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Canonical examples prove default design preserves component behavior, including body portals.
export default defineConfig({
  test: {
    projects: ["light", "dark"].map((theme) => ({
      plugins: [
        storybookTest({
          configDir: ".storybook",
          initialGlobals: { previewTheme: theme },
        }),
      ],
      test: {
        name: `default-theme-${theme}`,
        browser: {
          enabled: true,
          headless: true,
          provider: playwright(),
          instances: [
            { browser: "chromium" },
            {
              browser: "chromium",
              name: `chromium-${theme}-reduced`,
              provider: playwright({ contextOptions: { reducedMotion: "reduce" } }),
            },
          ],
        },
      },
    })),
  },
});
