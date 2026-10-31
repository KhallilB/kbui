import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
export default defineConfig({
  plugins: [storybookTest({ configDir: ".storybook" })],
  test: {
    setupFiles: ["./vitest.accessibility.setup.ts"],
    testNamePattern:
      /^(?:Forced Colors|Forced Colors Row|Forced Color Buttons|Read Only Mixed|Caller Description|Nested Select Modal)$/,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [
        {
          browser: "chromium",
          name: "chromium-forced-colors",
          provider: playwright({
            contextOptions: { forcedColors: "active", reducedMotion: "reduce" },
          }),
        },
      ],
    },
  },
});
