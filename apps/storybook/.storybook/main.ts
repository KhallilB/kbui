import type { StorybookConfig } from "@storybook/react-vite";
import { catalogPlugin } from "../catalog/source.ts";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: [
    "../docs/**/*.mdx",
    "../../../packages/react/src/**/*.stories.tsx",
    ...(process.env.KBUI_STORYBOOK_INTERNAL === "1" ? ["../stories/**/*.stories.tsx"] : []),
  ],
  viteFinal: (config) => ({ ...config, plugins: [...(config.plugins ?? []), catalogPlugin()] }),
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
};

export default config;
