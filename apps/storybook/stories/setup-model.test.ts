import { expect, test } from "bun:test";
import { installCommand, readSetup, setupHref, themeMarkup } from "../site/setup-model";

test("release install uses matched published assets for each package manager", () => {
  const react = "https://github.com/KhallilB/kbui/releases/download/v0.5.0/kbui-react-0.5.0.tgz";
  const css = "https://github.com/KhallilB/kbui/releases/download/v0.5.0/kbui-css-0.5.0.tgz";
  for (const [manager, prefix] of [
    ["bun", "bun add"],
    ["npm", "npm install"],
    ["pnpm", "pnpm add"],
    ["yarn", "yarn add"],
  ] as const) {
    expect(installCommand(manager, false)).toBe(`${prefix} ${react} ${css}`);
    expect(installCommand(manager, true)).toEndWith("kbui-tokens-0.5.0.tgz");
  }
});

test("shared setup links preserve supported settings and reject unknown options", () => {
  expect(readSetup("?manager=pnpm&tokens=1")).toEqual({ manager: "pnpm", tokens: true });
  expect(readSetup("?manager=oops&tokens=yes")).toEqual({ manager: "npm", tokens: false });
  expect(setupHref("../", { manager: "yarn", tokens: true })).toBe(
    "../setup/?manager=yarn&tokens=1",
  );
  expect(themeMarkup("system")).toBe('<html lang="en">');
  expect(themeMarkup("dark")).toBe('<html lang="en" data-theme="dark">');
});
