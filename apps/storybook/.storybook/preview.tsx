import type { Preview } from "@storybook/react-vite";
import "../site/layers.css";
import "@kbui/css/styles.css";
import { type ReactNode, useLayoutEffect, useState } from "react";
import type { Theme } from "../site/site-theme";
import "./component-preview.css";

function ThemePreview({ theme, children }: { theme: Theme; children: ReactNode }) {
  const [receivedTheme, setReceivedTheme] = useState<Theme | null>(() => {
    const value = window.frameElement?.getAttribute("data-preview-theme");
    return value === "light" || value === "dark" ? value : null;
  });
  const activeTheme = receivedTheme ?? theme;
  useLayoutEffect(() => {
    // Root scope includes body portals.
    document.documentElement.dataset.theme = activeTheme;
    document.documentElement.style.colorScheme = activeTheme;
  }, [activeTheme]);
  useLayoutEffect(() => {
    if (window.parent === window) return;
    const receive = (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin !== location.origin) return;
      if (event.data?.type !== "kbui:theme") return;
      if (event.data.theme === "light" || event.data.theme === "dark")
        setReceivedTheme(event.data.theme);
    };
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "kbui:theme-ready" }, location.origin);
    return () => window.removeEventListener("message", receive);
  }, []);
  return children;
}

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
    previewTheme: { description: "Catalog preview theme override" },
    theme: {
      description: "Color theme",
      toolbar: { icon: "mirror", items: ["light", "dark"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "light", previewTheme: "story" },
  decorators: [
    (Story, { globals, title, viewMode }) => {
      // Root scope includes portaled menus, hints and dialogs.
      const theme =
        globals.previewTheme === "light" || globals.previewTheme === "dark"
          ? globals.previewTheme
          : globals.theme === "dark"
            ? "dark"
            : "light";
      const component =
        title.startsWith("Components/") || title === "Layout/Grid"
          ? title.split("/").at(-1)?.toLowerCase()
          : undefined;
      const layout = ["grid", "panel", "scrollarea"].includes(component ?? "")
        ? "layout"
        : ["input", "select", "card", "callout", "progress"].includes(component ?? "")
          ? "surface"
          : "compact";
      return (
        <ThemePreview theme={theme}>
          {component ? (
            <div
              className="component-preview"
              data-component={component}
              data-layout={layout}
              data-viewport={viewMode === "story" || undefined}
            >
              <div className="component-preview-content">
                <Story />
              </div>
            </div>
          ) : (
            <Story />
          )}
        </ThemePreview>
      );
    },
  ],
};

export default preview;
