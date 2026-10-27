import type { Plugin } from "vite";
import { readPreferredTheme, readThemePreference } from "./site-theme";

export function initialThemeScript(): string {
  return `{const readThemePreference=${readThemePreference.toString()};const theme=(${readPreferredTheme.toString()})();document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;}`;
}

export function themeBootstrapPlugin(): Plugin {
  return {
    name: "kbui-site-theme-bootstrap",
    transformIndexHtml: {
      order: "pre",
      handler: () => [{ tag: "script", injectTo: "head-prepend", children: initialThemeScript() }],
    },
  };
}
