import { expect, test } from "bun:test";
import {
  installCommand,
  readSetup,
  setupHref,
  stylesheetImport,
  themeMarkup,
} from "../site/setup-model";

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

test("from 0.7.0 one React tarball carries the stylesheet", () => {
  const react = "https://github.com/KhallilB/kbui/releases/download/v0.7.0/kbui-react-0.7.0.tgz";
  expect(installCommand("bun", false, "0.7.0")).toBe(`bun add ${react}`);
  expect(installCommand("npm", true, "0.7.0")).toBe(
    `npm install ${react} https://github.com/KhallilB/kbui/releases/download/v0.7.0/kbui-tokens-0.7.0.tgz`,
  );
  expect(installCommand("pnpm", false, "0.10.0")).not.toContain("kbui-css");
  expect(stylesheetImport("0.7.0")).toBe("@kbui/react/styles.css");
  expect(stylesheetImport("1.0.0")).toBe("@kbui/react/styles.css");
  expect(stylesheetImport("0.6.0")).toBe("@kbui/css/styles.css");
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
