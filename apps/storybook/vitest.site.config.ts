import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const viewports = [
  "narrow-mobile",
  "mobile",
  "tablet",
  "small-laptop",
  "small-desktop",
  "desktop",
  "forced-colors",
];

export default defineConfig({
  test: {
    projects: viewports.map((name) => ({
      plugins: [
        storybookTest({
          configDir: ".storybook",
          initialGlobals: { viewport: { value: name } },
        }),
      ],
      test: {
        name,
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({
            contextOptions: name === "forced-colors" ? { forcedColors: "active" } : {},
          }),
          instances: [{ browser: "chromium" }],
        },
      },
    })),
  },
});
