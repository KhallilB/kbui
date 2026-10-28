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

type Example = {
  open: string;
  close?: string;
  slot?: string;
  css: (accent: string, radius: string, text: string) => string[];
};
const fill = (a: string, r: string, t: string) => [
  `background: ${a};`,
  `color: ${t};`,
  `border-radius: ${r};`,
];
const outline = (a: string, r: string) => [`border-color: ${a};`, `border-radius: ${r};`];
const ink = (a: string) => [`color: ${a};`];
// The part each example styles is the one that draws that component's fill or border.
const examples: Record<string, Example> = {
  Badge: { open: "<Badge", close: ">New</Badge>", css: fill },
  Button: { open: "<Button", close: ">Save</Button>", css: fill },
  Callout: { open: '<Callout title="Heads up"', close: ">…</Callout>", css: outline },
  Card: { open: "<Card", close: ">…</Card>", css: outline },
  Checkbox: { open: '<Checkbox label="Email me"', slot: "mark", css: outline },
  Dialog: { open: "<Dialog.Content", close: ">…</Dialog.Content>", css: outline },
  FileInput: { open: '<FileInput label="Files"', slot: "trigger", css: fill },
  Grid: { open: "<Grid", close: ">…</Grid>", css: () => ["gap: 2rem;"] },
  Input: { open: '<Input label="Email"', slot: "control", css: outline },
  Menu: { open: "<Menu.Content", close: ">…</Menu.Content>", css: outline },
  NumberField: { open: '<NumberField label="Boxes"', slot: "group", css: outline },
  Panel: { open: "<Panel", close: ">…</Panel>", css: (_, r) => [`border-radius: ${r};`] },
  Progress: { open: '<Progress label="Upload" value={40}', slot: "indicator", css: fill },
  RadioGroup: {
    open: '<RadioGroup.Item value="a"',
    slot: "control",
    close: ">A</RadioGroup.Item>",
    css: outline,
  },
  ScrollArea: {
    open: '<ScrollArea label="Log"',
    slot: "thumb",
    close: ">…</ScrollArea>",
    css: fill,
  },
  Select: { open: '<Select label="View"', slot: "control", css: outline },
  Stat: { open: '<Stat label="Done" value={12}', slot: "value", css: ink },
  Status: { open: "<Status", close: ">Online</Status>", css: ink },
  Switch: { open: '<Switch label="Alerts"', slot: "track", css: outline },
  Toolbar: { open: "<Toolbar", close: ">…</Toolbar>", css: outline },
  Tooltip: { open: '<Tooltip content="Saved"', close: ">…</Tooltip>", css: fill },
};

export function componentStyleExample(name: string, skin: CatalogSkin, theme: Theme): string {
  const example = examples[name] ?? { open: `<${name}`, close: " />", css: outline };
  const [accent, , text] = palettes[skin.palette === "default" ? "ocean" : skin.palette][theme];
  const radius = { default: "999px", sharp: "0px", soft: "0.875rem" }[skin.corners];
  const target = example.slot ? `classNames={{ ${example.slot}: "brand" }}` : 'className="brand"';
  return [
    `${example.open} ${target}${example.close ?? " />"}`,
    "",
    "/* Your CSS beats kbui's, so no kbui names are needed. */",
    ".brand {",
    ...example.css(accent, radius, text).map((line) => `  ${line}`),
    "}",
  ].join("\n");
}
