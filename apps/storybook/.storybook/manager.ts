import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import { addons } from "storybook/manager-api";
import { readThemePreference } from "../site/site-theme";
import { resolveTheme, storybookThemes } from "./theme";

addons.setConfig({
  navSize: 272,
  sidebar: { showRoots: true },
  enableShortcuts: true,
});

addons.register("kbui/reference-theme", (api) => {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  let preference = readThemePreference();
  const syncPreview = () => {
    const theme = resolveTheme(preference, media.matches);
    const frame = document.querySelector<HTMLIFrameElement>("#storybook-preview-iframe");
    frame?.setAttribute("data-preview-theme", theme);
    frame?.contentWindow?.postMessage({ type: "kbui:theme", theme }, location.origin);
  };
  const apply = () => {
    const theme = resolveTheme(preference, media.matches);
    document.documentElement.style.colorScheme = theme;
    document.documentElement.style.setProperty(
      "--reference-accent",
      storybookThemes[theme].colorSecondary,
    );
    document.documentElement.style.setProperty(
      "--reference-muted",
      storybookThemes[theme].barTextColor,
    );
    addons.setConfig({ theme: storybookThemes[theme] });
    syncPreview();
  };
  const update = ({ globals }: { globals: Record<string, unknown> }) => {
    const value = globals.theme;
    if (value !== "light" && value !== "dark" && value !== "system") return;
    preference = value;
    apply();
  };
  addons.getChannel().on(GLOBALS_UPDATED, update);
  window.addEventListener("message", (event: MessageEvent) => {
    const frame = document.querySelector<HTMLIFrameElement>("#storybook-preview-iframe");
    if (event.origin !== location.origin || event.source !== frame?.contentWindow) return;
    if (event.data?.type === "kbui:theme-ready") syncPreview();
  });
  media.addEventListener("change", apply);
  update({ globals: api.getGlobals() });
  apply();
});
