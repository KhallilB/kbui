import { componentStyleAnatomy } from "./component-style-anatomy";
import type { Theme } from "./theme-foundations";

export type CatalogSkin = {
  palette: "default" | "ocean" | "plum";
  corners: "default" | "sharp" | "soft";
  custom?: { component: string; css: string; classes: string };
};
export const defaultCatalogSkin: CatalogSkin = { palette: "default", corners: "default" };

const palettes = {
  ocean: {
    light: ["#21637a", "#174d61", "#ffffff", "#21637a"],
    dark: ["#8cd5e8", "#b2e6f2", "#102b35", "#8cd5e8"],
  },
  plum: {
    light: ["#78446f", "#603458", "#ffffff", "#78446f"],
    dark: ["#e7a7d5", "#f2c5e6", "#351b30", "#e7a7d5"],
  },
} as const;
const paletteProperties = [
  "--kb-color-accent",
  "--kb-color-accent-hover",
  "--kb-color-accent-fg",
  "--kb-color-ring",
  "--kb-color-action",
  "--kb-color-action-hover",
  "--kb-color-action-fg",
  "--kb-radiogroup-primary-background",
  "--kb-radiogroup-primary-color",
] as const;
const cornerProperties = [
  "--kb-radius-sm",
  "--kb-radius-md",
  "--kb-radius-lg",
  "--kb-dialog-radius",
  "--kb-popup-radius",
] as const;

export function catalogSkinTokens(skin: CatalogSkin, theme: Theme): Record<string, string> {
  const tokens: Record<string, string> = {};
  if (skin.palette !== "default") {
    const [accent, hover, foreground, ring] = palettes[skin.palette][theme];
    Object.assign(tokens, {
      "--kb-color-accent": accent,
      "--kb-color-accent-hover": hover,
      "--kb-color-accent-fg": foreground,
      "--kb-color-ring": ring,
      "--kb-color-action": accent,
      "--kb-color-action-hover": hover,
      "--kb-color-action-fg": foreground,
      "--kb-radiogroup-primary-background": accent,
      "--kb-radiogroup-primary-color": foreground,
    });
  }
  if (skin.corners !== "default") {
    const corners =
      skin.corners === "sharp"
        ? ["0px", "0px", "0px", "0px", "0px"]
        : ["0.5rem", "0.875rem", "1.25rem", "1.5rem", "1rem"];
    cornerProperties.forEach((name, index) => {
      tokens[name] = corners[index] ?? "0px";
    });
  }
  return tokens;
}

export function catalogSkinCss(skin: CatalogSkin, theme: Theme): string {
  const declarations = Object.entries(catalogSkinTokens(skin, theme));
  if (!declarations.length) return "";
  return `[data-theme="${theme}"] {\n${declarations.map(([name, value]) => `  ${name}: ${value};`).join("\n")}\n}`;
}

export function applyCatalogSkin(
  style: Pick<CSSStyleDeclaration, "setProperty" | "removeProperty">,
  skin: CatalogSkin,
  theme: Theme,
): void {
  const tokens = catalogSkinTokens(skin, theme);
  for (const name of [...paletteProperties, ...cornerProperties]) {
    const value = tokens[name];
    if (value) style.setProperty(name, value);
    else style.removeProperty(name);
  }
}

const fill = (a: string, r: string, t: string) => [
  `background: ${a};`,
  `color: ${t};`,
  `border-radius: ${r};`,
];
const outline = (a: string, r: string) => [`border-color: ${a};`, `border-radius: ${r};`];
const ink = (a: string) => [`color: ${a};`];
const presets: Record<string, (accent: string, radius: string, text: string) => string[]> = {
  Badge: fill,
  Button: fill,
  Callout: outline,
  Card: outline,
  Checkbox: outline,
  Dialog: outline,
  PageHeader: outline,
  StatsRow: outline,
  EmptyState: outline,
  FileInput: fill,
  Grid: () => ["gap: 2rem;"],
  Input: outline,
  Menu: outline,
  NumberField: outline,
  Panel: (_, r) => [`border-radius: ${r};`],
  Progress: fill,
  RadioGroup: outline,
  ScrollArea: fill,
  Select: outline,
  Skeleton: fill,
  Spinner: ink,
  Stat: ink,
  Status: ink,
  Switch: outline,
  Tabs: outline,
  Toast: outline,
  Toolbar: outline,
  Tooltip: fill,
};

export function componentStyleTarget(name: string): string {
  return componentStyleAnatomy(name).selector;
}

export function presetComponentCss(name: string, skin: CatalogSkin) {
  const declarations = presets[name] ?? outline;
  if (skin.palette === "default" && skin.corners === "default")
    return [
      ".brand {",
      "  /* Uncomment to try:",
      ...declarations("var(--kb-color-accent)", "999px", "var(--kb-color-accent-fg)").map(
        (line) => `  ${line}`,
      ),
      "  */",
      "}",
      "",
      "/* Hover state:",
      ".brand:hover {",
      "  opacity: 0.8;",
      "}",
      "*/",
    ].join("\n");
  const radius = { default: "var(--kb-radius-md)", sharp: "0px", soft: "0.875rem" }[skin.corners];
  return [
    ".brand {",
    ...declarations("var(--kb-color-accent)", radius, "var(--kb-color-accent-fg)").map(
      (line) => `  ${line}`,
    ),
    "}",
  ].join("\n");
}

export const defaultTailwindSource = `/* Color — uncomment to try:
bg-sky-500 text-slate-950
*/

/* Shape and spacing:
rounded-full px-3 py-1
*/

/* Hover and dark mode:
hover:bg-sky-400 dark:bg-sky-300 dark:text-slate-950
*/`;
