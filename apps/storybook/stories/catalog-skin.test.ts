import { expect, test } from "bun:test";
import {
  applyCatalogSkin,
  catalogSkinCss,
  catalogSkinTokens,
  defaultCatalogSkin,
} from "../site/catalog-skin";

function contrast(a: string, b: string) {
  const luminance = (hex: string) => {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`Invalid palette color: ${hex}`);
    const channel = (start: number) => {
      const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  };
  const first = luminance(a);
  const second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

for (const theme of ["light", "dark"] as const) {
  test(`default skin leaves ${theme} tokens untouched`, () => {
    expect(catalogSkinTokens(defaultCatalogSkin, theme)).toEqual({});
    expect(catalogSkinCss(defaultCatalogSkin, theme)).toBe("");
  });
  for (const palette of ["ocean", "plum"] as const) {
    test(`${palette} ${theme} keeps readable filled text and theme-specific colors`, () => {
      const tokens = catalogSkinTokens({ ...defaultCatalogSkin, palette }, theme);
      expect(Object.keys(tokens)).toHaveLength(9);
      expect(tokens["--kb-radiogroup-primary-background"]).toBe(tokens["--kb-color-accent"]);
      expect(tokens["--kb-radiogroup-primary-color"]).toBe(tokens["--kb-color-accent-fg"]);
      expect(tokens["--kb-color-action"]).toBe(tokens["--kb-radiogroup-primary-background"]);
      expect(tokens["--kb-color-action-fg"]).toBe(tokens["--kb-radiogroup-primary-color"]);
      for (const fill of [
        "--kb-color-accent",
        "--kb-color-accent-hover",
        "--kb-color-action",
        "--kb-color-action-hover",
      ]) {
        expect(
          contrast(tokens[fill] ?? "", tokens["--kb-color-accent-fg"] ?? ""),
        ).toBeGreaterThanOrEqual(4.5);
      }
      expect(tokens).not.toEqual(
        catalogSkinTokens({ ...defaultCatalogSkin, palette }, theme === "light" ? "dark" : "light"),
      );
      expect(tokens["--kb-color-bg"]).toBeUndefined();
      expect(tokens["--kb-material-accent-shadow"]).toBeUndefined();
    });
  }
}

test("corners compose with palette without changing circular control geometry", () => {
  const sharp = catalogSkinTokens({ palette: "ocean", corners: "sharp" }, "light");
  const soft = catalogSkinTokens({ palette: "ocean", corners: "soft" }, "light");
  expect(sharp["--kb-radius-md"]).toBe("0px");
  expect(soft["--kb-radius-md"]).toBe("0.875rem");
  expect(sharp["--kb-color-accent"]).toBe(soft["--kb-color-accent"]);
  expect(sharp["--kb-radius-full"]).toBeUndefined();
  expect(soft["--kb-radius-full"]).toBeUndefined();
});

test("CSS overrides match applied tokens and explicit theme scope", () => {
  const skin = { palette: "plum", corners: "soft" } as const;
  const tokens = catalogSkinTokens(skin, "dark");
  const css = catalogSkinCss(skin, "dark");
  expect(css).toStartWith('[data-theme="dark"] {');
  for (const [name, value] of Object.entries(tokens)) expect(css).toContain(`${name}: ${value};`);
  expect(css).not.toContain("undefined");
});

test("changing and resetting skin removes previous managed tokens only", () => {
  const values = new Map<string, string>([
    ["--caller-token", "keep"],
    ["color-scheme", "dark"],
  ]);
  const style = {
    setProperty: (name: string, value: string | null) => {
      values.set(name, value ?? "");
    },
    removeProperty: (name: string) => {
      const old = values.get(name) ?? "";
      values.delete(name);
      return old;
    },
  };
  applyCatalogSkin(style, { palette: "ocean", corners: "sharp" }, "dark");
  expect(values.get("--kb-radius-md")).toBe("0px");
  applyCatalogSkin(style, { palette: "plum", corners: "default" }, "light");
  expect(values.has("--kb-radius-md")).toBe(false);
  expect(values.get("--kb-color-accent")).toBe(
    catalogSkinTokens({ palette: "plum", corners: "default" }, "light")["--kb-color-accent"],
  );
  applyCatalogSkin(style, defaultCatalogSkin, "dark");
  expect(Object.fromEntries(values)).toEqual({ "--caller-token": "keep", "color-scheme": "dark" });
});
