import {
  Controls,
  Description,
  DocsContainer,
  type DocsContainerProps,
  Primary,
  Stories,
  Title,
  useOf,
} from "@storybook/addon-docs/blocks";
import { type PropsWithChildren, useEffect, useLayoutEffect, useState } from "react";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import { definitions } from "../catalog/definitions";
import { readThemePreference, type ThemePreference } from "../site/site-theme";
import { referencePreference, resolveTheme, storybookThemes } from "./theme";

export function useReferenceTheme(preference: ThemePreference) {
  const [hostTheme, setHostTheme] = useState<ThemePreference | null>(() => {
    const value = window.frameElement?.getAttribute("data-preview-theme");
    return value === "light" || value === "dark" ? value : null;
  });
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, []);
  const theme = resolveTheme(hostTheme ?? preference, systemDark);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  useLayoutEffect(() => {
    if (window.parent === window) return;
    const receive = (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin !== location.origin) return;
      if (event.data?.type !== "kbui:theme") return;
      if (event.data.theme === "light" || event.data.theme === "dark")
        setHostTheme(event.data.theme);
    };
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "kbui:theme-ready" }, location.origin);
    return () => window.removeEventListener("message", receive);
  }, []);
  return theme;
}

export function ReferenceDocs({ children, context }: PropsWithChildren<DocsContainerProps>) {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    const story = context.componentStories()[0];
    const value = story ? context.getStoryContext(story).globals.theme : undefined;
    return value === "light" || value === "dark" || value === "system"
      ? value
      : referencePreference(
          new URLSearchParams(location.search).get("globals"),
          readThemePreference(),
        );
  });
  const theme = useReferenceTheme(preference);
  useEffect(() => {
    const update = ({ globals }: { globals: Record<string, unknown> }) => {
      const value = globals.theme;
      if (value === "light" || value === "dark" || value === "system") setPreference(value);
    };
    context.channel.on(GLOBALS_UPDATED, update);
    return () => context.channel.off(GLOBALS_UPDATED, update);
  }, [context.channel]);
  return (
    <DocsContainer context={context} theme={storybookThemes[theme]}>
      {children}
    </DocsContainer>
  );
}

export function ReferencePage() {
  const { preparedMeta } = useOf("meta");
  const name = preparedMeta.title.split("/").at(-1) ?? "";
  return (
    <>
      <p className="reference-kicker">Component reference</p>
      <Title />
      {definitions[name] ? (
        <p className="reference-description">{definitions[name].description}</p>
      ) : (
        <Description />
      )}
      <Primary />
      <Controls />
      <Stories title="Examples" includePrimary={false} />
    </>
  );
}
