import type { StorybookConfig } from "@storybook/react-vite";
import { catalogPlugin } from "../catalog/source.ts";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  staticDirs: ["../site/public"],
  features: { sidebarOnboardingChecklist: false, menuOnboardingChecklist: false },
  core: { disableWhatsNewNotifications: true },
  stories: [
    "../docs/**/*.mdx",
    "../../../packages/react/src/**/*.stories.tsx",
    ...(process.env.KBUI_STORYBOOK_INTERNAL === "1" ? ["../stories/**/*.stories.tsx"] : []),
  ],
  viteFinal: (config) => ({
    ...config,
    plugins: [...(config.plugins ?? []), catalogPlugin()],
    optimizeDeps: {
      ...config.optimizeDeps,
      include: [
        ...(config.optimizeDeps?.include ?? []),
        "storybook/internal/core-events",
        "storybook/theming",
      ],
    },
  }),
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
};

export default config;
