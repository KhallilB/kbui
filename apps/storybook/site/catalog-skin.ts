import type { Theme } from "./theme-foundations";

export type CatalogSkin = {
  palette: "default" | "ocean" | "plum";
  corners: "default" | "sharp" | "soft";
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
