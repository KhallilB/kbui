import { afterEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  installCommand,
  readSetup,
  setupHref,
  stylesheetImport,
  themeMarkup,
} from "../site/setup-model";

test("0.7.0 installs React with its bundled stylesheet for each package manager", () => {
  const react = "https://github.com/KhallilB/kbui/releases/download/v0.7.0/kbui-react-0.7.0.tgz";
  const tokens = "https://github.com/KhallilB/kbui/releases/download/v0.7.0/kbui-tokens-0.7.0.tgz";
  for (const [manager, prefix] of [
    ["bun", "bun add"],
    ["npm", "npm install"],
    ["pnpm", "pnpm add"],
    ["yarn", "yarn add"],
  ] as const) {
    expect(installCommand(manager, false, "0.7.0")).toBe(`${prefix} ${react}`);
    expect(installCommand(manager, true, "0.7.0")).toBe(`${prefix} ${react} ${tokens}`);
  }
});

test("from 0.7.0 one React tarball carries the stylesheet", () => {
  const react = "https://github.com/KhallilB/kbui/releases/download/v0.7.0/kbui-react-0.7.0.tgz";
  expect(installCommand("bun", false, "0.7.0")).toBe(`bun add ${react}`);
  expect(installCommand("npm", true, "0.7.0")).toBe(
    `npm install ${react} https://github.com/KhallilB/kbui/releases/download/v0.7.0/kbui-tokens-0.7.0.tgz`,
  );
  expect(installCommand("pnpm", false, "0.10.0")).not.toContain("kbui-css");
  expect(stylesheetImport("0.7.0")).toBe("@kb.ui/react/styles.css");
  expect(stylesheetImport("1.0.0")).toBe("@kb.ui/react/styles.css");
  expect(installCommand("npm", false, "0.6.0")).toBe(
    "npm install https://github.com/KhallilB/kbui/releases/download/v0.6.0/kbui-react-0.6.0.tgz https://github.com/KhallilB/kbui/releases/download/v0.6.0/kbui-css-0.6.0.tgz",
  );
  expect(stylesheetImport("0.6.0")).toBe("@kb.ui/css/styles.css");
});

test("legacy scope stays on release tarballs for every package manager", () => {
  for (const [manager, prefix] of [
    ["bun", "bun add"],
    ["npm", "npm install"],
    ["pnpm", "pnpm add"],
    ["yarn", "yarn add"],
  ] as const) {
    const base = "https://github.com/KhallilB/kbui/releases/download/v0.9.1";
    expect(installCommand(manager, false, "0.9.1")).toBe(`${prefix} ${base}/kbui-react-0.9.1.tgz`);
    expect(installCommand(manager, true, "0.9.1")).toBe(
      `${prefix} ${base}/kbui-react-0.9.1.tgz ${base}/kbui-tokens-0.9.1.tgz`,
    );
  }
  expect(installCommand("npm", false, "0.8.0")).toContain("/releases/download/v0.8.0/");
});

test("from 0.10.0 every package manager installs @kb.ui from the npm registry", () => {
  for (const [manager, prefix] of [
    ["bun", "bun add"],
    ["npm", "npm install"],
    ["pnpm", "pnpm add"],
    ["yarn", "yarn add"],
  ] as const) {
    expect(installCommand(manager, false, "0.10.0")).toBe(`${prefix} @kb.ui/react@0.10.0`);
    expect(installCommand(manager, true, "0.10.0")).toBe(
      `${prefix} @kb.ui/react@0.10.0 @kb.ui/tokens@0.10.0`,
    );
  }
  expect(installCommand("npm", false, "0.9.0")).toBe(
    "npm install https://github.com/KhallilB/kbui/releases/download/v0.9.0/kbui-react-0.9.0.tgz",
  );
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

const fixtures: string[] = [];
afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

test("default setup follows future manifest bumps without editing the model", async () => {
  const source = await Bun.file(new URL("../site/setup-model.ts", import.meta.url)).text();
  for (const [version, command] of [
    [
      "0.8.0",
      "npm install https://github.com/KhallilB/kbui/releases/download/v0.8.0/kbui-react-0.8.0.tgz",
    ],
    ["0.10.0", "npm install @kb.ui/react@0.10.0"],
    ["1.0.0", "npm install @kb.ui/react@1.0.0"],
  ]) {
    const root = await mkdtemp(join(tmpdir(), "kbui-setup-release-"));
    fixtures.push(root);
    const site = join(root, "apps", "storybook", "site");
    await mkdir(site, { recursive: true });
    await writeFile(join(root, "package.json"), JSON.stringify({ version }));
    await writeFile(join(site, "setup-model.ts"), source);
    const model = await import(join(site, "setup-model.ts"));
    expect(model.installCommand("npm", false)).toBe(command);
    expect(model.stylesheetImport()).toBe("@kb.ui/react/styles.css");
    expect(model.firstComponent).toContain('import "@kb.ui/react/styles.css";');
  }
});
