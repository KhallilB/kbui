import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { componentStyleTarget, componentStyleUsage } from "../site/catalog-skin";
import { compileComponentStyle } from "../site/style-compiler";

test("Tailwind compiles real utilities, variants and arbitrary values without Preflight", async () => {
  const theme = readFileSync(require.resolve("tailwindcss/theme.css"), "utf8");
  const css = await compileComponentStyle(
    "tailwind",
    "bg-[#123456] px-8 hover:bg-black dark:text-white rounded-none",
    theme,
  );
  expect(css).toContain("#123456");
  expect(css).toContain("padding-inline");
  expect(css).toContain(":hover");
  expect(css).toContain("[data-theme=dark]");
  expect(css).not.toContain("box-sizing: border-box");
});

test("CSS validates before application and preserves component selectors", async () => {
  expect(await compileComponentStyle("css", ".brand:hover { color: red; }")).toContain(
    ".brand:hover",
  );
  await expect(compileComponentStyle("css", ".brand { color: red;")).rejects.toThrow();
});

test("component targets and copied props use the actual styled parts", () => {
  expect(componentStyleTarget("Badge")).toBe(".kb-badge");
  expect(componentStyleTarget("Input")).toBe(".kb-input-control");
  expect(componentStyleTarget("Dialog")).toBe(".kb-dialog-popup");
  expect(componentStyleTarget("Menu")).toBe(".kb-menu");
  expect(componentStyleTarget("Tooltip")).toBe(".kb-tooltip");
  expect(componentStyleTarget("Progress")).toBe(".kb-progress-indicator");
  expect(componentStyleUsage("Input", "rounded-none")).toContain(
    'classNames={{ control: "rounded-none" }}',
  );
  expect(componentStyleUsage("Badge", "bg-black")).toContain('className={"bg-black"}');
});
