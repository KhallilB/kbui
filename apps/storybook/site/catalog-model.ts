import type { CatalogEntry } from "../catalog/types";
import type { CatalogSkin } from "./catalog-skin";
import type { Theme } from "./theme-foundations";

export type CatalogAppearance = { theme: Theme; skin?: CatalogSkin };

export function browsableStories(entry: CatalogEntry) {
  if (entry.examples)
    return entry.examples.map((example) => {
      const story = entry.stories.find((candidate) => candidate.id === example.id);
      if (!story) throw new Error(`Missing catalog example: ${example.id}`);
      return { ...story, name: example.name };
    });
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

export const layoutPreviewComponents = [
  "collection",
  "grid",
  "container",
  "pageheader",
  "gallery",
  "statsrow",
  "inline",
  "split",
  "settings",
  "form",
  "formsection",
  "separator",
  "panel",
  "scrollarea",
  "table",
  "descriptionlist",
  "collectionlist",
  "collectionrow",
] as const;

export const surfacePreviewComponents = [
  "tabs",
  "popover",
  "accordion",
  "disclosure",
  "copyabletext",
  "codeblock",
  "input",
  "textarea",
  "fieldset",
  "formactions",
  "errorsummary",
  "select",
  "combobox",
  "multiselect",
  "card",
  "callout",
  "emptystate",
  "skeleton",
  "toast",
  "progress",
  "image",
  "thumbnail",
] as const;

export function previewKind(component: string | undefined): "layout" | "surface" | "compact" {
  if (!component) return "compact";
  if ((layoutPreviewComponents as readonly string[]).includes(component)) return "layout";
  if ((surfacePreviewComponents as readonly string[]).includes(component)) return "surface";
  return "compact";
}

export function previewLayout(component: string, _story: string) {
  if (component === "dialog") return { width: 800, minimum: 360 };
  if (component === "popover") return { width: 520, minimum: 480 };
  if (component === "menu") return { width: 520, minimum: 240 };
  if (component === "tooltip") return { width: 520, minimum: 160 };
  if (["select", "combobox", "multiselect"].includes(component))
    return { width: 1120, minimum: 240 };
  if (
    [
      "collection",
      "grid",
      "container",
      "pageheader",
      "gallery",
      "statsrow",
      "inline",
      "split",
      "settings",
      "form",
      "formsection",
      "panel",
      "table",
      "descriptionlist",
      "collectionlist",
      "collectionrow",
    ].includes(component)
  )
    return { width: 1120, minimum: 160 };
  if (
    [
      "tabs",
      "copyabletext",
      "codeblock",
      "input",
      "textarea",
      "fieldset",
      "formactions",
      "errorsummary",
      "card",
      "callout",
      "emptystate",
      "skeleton",
      "toast",
      "progress",
      "image",
      "thumbnail",
      "scrollarea",
    ].includes(component)
  )
    return { width: 1120, minimum: 96 };
  return { width: 520, minimum: 96 };
}
