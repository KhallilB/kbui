import type { Preview } from "@storybook/react-vite";
import "../site/layers.css";
import "@kb.ui/css/styles.css";
import type { CSSProperties, ReactNode } from "react";
import { previewKind } from "../site/catalog-model";
import { readThemePreference, type ThemePreference } from "../site/site-theme";
import { ReferenceDocs, ReferencePage, useReferenceTheme } from "./docs";
import "./component-preview.css";
import "./docs.css";
import { ComponentCodePreview } from "./ComponentCodePreview";

function ThemePreview({ theme, children }: { theme: ThemePreference; children: ReactNode }) {
  useReferenceTheme(theme);
  return children;
}

const preview: Preview = {
  parameters: {
    a11y: {
      test: "error",
      // Preserve VoiceOver guards: https://github.com/mui/base-ui/issues/5237#issuecomment-4978602561.
      context: { include: ["body"], exclude: ["[data-base-ui-focus-guard]"] },
    },
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
    docs: { container: ReferenceDocs, page: ReferencePage },
    options: {
      storySort: { order: ["Introduction", "Foundations", "Components", "Layout", "Recipes"] },
    },
  },
  globalTypes: {
    previewTheme: { description: "Catalog preview theme override" },
    theme: {
      description: "Color theme",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "system", title: "System" },
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: readThemePreference(), previewTheme: "story" },
  decorators: [
    (Story, { globals, parameters, title, viewMode }) => {
      // Root scope includes portaled menus, hints and dialogs.
      const theme =
        globals.previewTheme === "light" || globals.previewTheme === "dark"
          ? globals.previewTheme
          : globals.theme === "dark" || globals.theme === "light"
            ? globals.theme
            : "system";
      const component =
        title.startsWith("Components/") || title.startsWith("Layout/")
          ? title.split("/").at(-1)?.toLowerCase()
          : undefined;
      const layout = previewKind(component);
      return (
        <ThemePreview theme={theme}>
          {component ? (
            <div
              className="component-preview"
              data-component={component}
              data-layout={layout}
              data-viewport={viewMode === "story" || undefined}
            >
              <div
                className="component-preview-content"
                style={
                  typeof parameters.kbuiPreview?.menuSpace === "number"
                    ? ({
                        "--component-preview-menu-space": `${parameters.kbuiPreview.menuSpace}px`,
                      } as CSSProperties)
                    : undefined
                }
              >
                <ComponentCodePreview>
                  <Story />
                </ComponentCodePreview>
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
