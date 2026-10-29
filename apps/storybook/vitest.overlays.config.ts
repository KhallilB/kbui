import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { firefoxEnvironment } from "./browser-environment.ts";

const engines = ["chromium", "firefox", "webkit"] as const;
const environment = firefoxEnvironment();
function provider(engine: (typeof engines)[number], reducedMotion: "reduce" | "no-preference") {
  return playwright({
    contextOptions: { reducedMotion },
    ...(engine === "firefox" && environment ? { launchOptions: { env: environment } } : {}),
  });
}

export default defineConfig({
  test: {
    maxWorkers: 2,
    projects: engines.flatMap((engine) =>
      (["light", "dark"] as const).map((theme) => ({
        plugins: [
          storybookTest({ configDir: ".storybook", initialGlobals: { previewTheme: theme } }),
        ],
        test: {
          name: `overlays-${engine}-${theme}`,
          browser: {
            enabled: true,
            headless: true,
            provider: provider(engine, "no-preference"),
            instances: [
              { browser: engine },
              {
                browser: engine,
                name: `${engine}-${theme}-reduced`,
                provider: provider(engine, "reduce"),
              },
            ],
          },
        },
      })),
    ),
  },
});
