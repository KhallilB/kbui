import type { Preview } from "@storybook/react-vite";
import "@kbui/css/styles.css";

const preview: Preview = {
  parameters: {
    a11y: { test: "error" },
    viewport: {
      options: Object.fromEntries(
        [
          ["narrow-mobile", 320, 768],
          ["mobile", 390, 844],
          ["tablet", 768, 1024],
          ["small-laptop", 1024, 900],
          ["small-desktop", 1280, 900],
          ["desktop", 1440, 1000],
          ["forced-colors", 1440, 1000],
        ].map(([name, width, height]) => [
          name,
          {
            name,
            styles: { width: `${width}px`, height: `${height}px` },
          },
        ]),
      ),
    },
    backgrounds: { disable: true },
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
