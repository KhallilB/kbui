import { create } from "storybook/theming";
import tokens from "../../../packages/tokens/tokens.json";
import type { Theme, ThemePreference } from "../site/site-theme";

export function resolveTheme(preference: ThemePreference, systemDark: boolean): Theme {
  return preference === "system" ? (systemDark ? "dark" : "light") : preference;
}

export function referencePreference(
  globals: string | null,
  fallback: ThemePreference,
): ThemePreference {
  const value = globals?.match(/(?:^|;)theme:(light|dark|system)(?:;|$)/)?.[1];
  return value === "light" || value === "dark" || value === "system" ? value : fallback;
}

function referenceTheme(mode: Theme) {
  const color = (name: keyof typeof tokens.color) => {
    const token = tokens.color[name];
    return mode === "dark" ? token.$extensions["kb.dark"] : token.$value;
  };
  const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 40"><path d="M8 8V32M28 8L16 20L28 32M8 20H16" fill="none" stroke="${color("fg")}" stroke-width="6"/><text x="48" y="31" fill="${color("fg")}" font-family="Helvetica,Arial,sans-serif" font-size="34" font-weight="700" letter-spacing="-2">kbui</text><text x="126" y="26" fill="${color("muted")}" font-family="Helvetica,Arial,sans-serif" font-size="12">Reference</text></svg>`;
  return create({
    base: mode,
    brandTitle: "kbui — Component reference",
    brandUrl: "../",
    brandTarget: "_self",
    brandImage: `data:image/svg+xml,${encodeURIComponent(logo)}`,
    fontBase: tokens.font.sans.$value,
    fontCode: tokens.font.mono.$value,
    colorPrimary: color("accent-ink"),
    colorSecondary: color("accent-ink"),
    appBg: color("bg"),
    appContentBg: color("bg"),
    appPreviewBg: color("bg"),
    appBorderColor: color("border"),
    appBorderRadius: 12,
    textColor: color("fg"),
    textMutedColor: color("muted"),
    textInverseColor: mode === "dark" ? color("bg") : tokens.white.$value,
    barBg: color("bg"),
    barTextColor: color("muted"),
    barSelectedColor: color("accent-ink"),
    barHoverColor: color("accent-ink"),
    inputBg: color("surface"),
    inputBorder: color("border"),
    inputTextColor: color("fg"),
    inputBorderRadius: 8,
  });
}

export const storybookThemes = { light: referenceTheme("light"), dark: referenceTheme("dark") };
