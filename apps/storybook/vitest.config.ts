import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [storybookTest({ configDir: ".storybook" })],
  optimizeDeps: {
    include: [
      "@kbui/react > @base-ui/react/number-field",
      "@kbui/react > @base-ui/react/radio",
      "@kbui/react > @base-ui/react/radio-group",
      "@kbui/react > @base-ui/react/select",
    ],
  },
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
