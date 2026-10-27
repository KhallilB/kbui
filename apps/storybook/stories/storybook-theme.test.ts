import { expect, test } from "bun:test";
import { resolveTheme, storybookThemes } from "../.storybook/theme";

test("system preference follows OS while explicit choices stay stable", () => {
  expect(resolveTheme("system", false)).toBe("light");
  expect(resolveTheme("system", true)).toBe("dark");
  expect(resolveTheme("light", true)).toBe("light");
  expect(resolveTheme("dark", false)).toBe("dark");
});

test("Storybook chrome and docs use kbui surfaces and readable accent colors", () => {
  expect(storybookThemes.light.appBg).toBe("#f5f6f8");
  expect(storybookThemes.dark.appBg).toBe("#17191d");
  expect(storybookThemes.light.colorSecondary).toBe("#b43c17");
  expect(storybookThemes.dark.colorSecondary).toBe("#ffa17f");
  expect(storybookThemes.light.brandTitle).toBe("kbui — Component reference");
});
