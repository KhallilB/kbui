import type { CatalogEntry } from "../catalog/types";
import type { CatalogSkin } from "./catalog-skin";
import type { Theme } from "./theme-foundations";

export type CatalogAppearance = { theme: Theme; skin?: CatalogSkin };

export function browsableStories(entry: CatalogEntry) {
  return entry.stories.filter((story) => !/(?:^|\s)(?:Dark|Light)$/.test(story.name));
}

export function appearanceQuery({ theme }: CatalogAppearance) {
  return theme === "light" ? "" : `&theme=${theme}`;
}
export function previewGlobals({ theme }: CatalogAppearance) {
  return `&globals=previewTheme:${theme}`;
}
export function storybookGlobals({ theme }: CatalogAppearance) {
  return `&globals=theme:${theme}`;
}

export function previewLayout(component: string, _story: string) {
  if (component === "dialog") return { width: 800, minimum: 360 };
  if (component === "menu") return { width: 520, minimum: 240 };
  if (component === "tooltip") return { width: 520, minimum: 160 };
  if (component === "select") return { width: 1120, minimum: 240 };
  if (["grid", "container", "inline", "split"].includes(component))
    return { width: 1120, minimum: 160 };
  if (component === "panel") return { width: 1120, minimum: 160 };
  if (
    [
      "input",
      "textarea",
      "fieldset",
      "formactions",
      "errorsummary",
      "card",
      "callout",
      "progress",
      "scrollarea",
    ].includes(component)
  )
    return { width: 1120, minimum: 96 };
  return { width: 520, minimum: 96 };
}
