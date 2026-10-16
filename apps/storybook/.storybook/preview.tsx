import type { Preview } from "@storybook/react-vite";
import "@kbui/css/styles.css";

const preview: Preview = {
  parameters: {
    a11y: { test: "error" },
    controls: { matchers: { color: /(background|color)$/i } },
  },
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: { icon: "mirror", items: ["light", "dark"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, { globals }) => {
      // CSS keys theme off <html data-theme>, not a wrapper.
      document.documentElement.dataset.theme = String(globals.theme ?? "light");
      return <Story />;
    },
  ],
};

export default preview;
