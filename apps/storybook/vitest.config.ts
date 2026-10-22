import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [storybookTest({ configDir: ".storybook" })],
  test: {
    name: "storybook",
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      // Same stories twice: default, then with the reduced-motion preference on.
      instances: [
        { browser: "chromium" },
        {
          browser: "chromium",
          name: "chromium-reduced-motion",
          provider: playwright({ contextOptions: { reducedMotion: "reduce" } }),
        },
      ],
    },
  },
});
