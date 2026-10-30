import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [storybookTest({ configDir: ".storybook" })],
  optimizeDeps: {
    include: [
      "markdown-to-jsx/react",
      "@babel/standalone",
      "prettier/standalone",
      "prettier/plugins/babel",
      "prettier/plugins/estree",
      "prettier/plugins/postcss",
      "@kb.ui/react > @base-ui/react/number-field",
      "@kb.ui/react > @base-ui/react/radio",
      "@kb.ui/react > @base-ui/react/radio-group",
      "@kb.ui/react > @base-ui/react/select",
    ],
  },
  test: {
    name: "storybook",
    // Bound compiler-heavy browser pages to avoid startup contention.
    maxWorkers: 2,
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
